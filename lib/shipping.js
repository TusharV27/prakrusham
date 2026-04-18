import prisma from './prisma.js';

const normalizeJsonValue = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (typeof value.en === 'string' && value.en.trim()) return value.en.trim();
        const firstText = Object.values(value).find(v => typeof v === 'string' && v.trim());
        return firstText || '';
    }
    return String(value);
};

/**
 * Calculates shipping rates for a set of items and a destination address.
 * Follows Shopify-like logic: matches address to zones within shipping profiles.
 * 
 * @param {Array} items - Array of { productId, quantity, price, weight }
 * @param {Object} address - { pincode, state, country }
 * @returns {Object} { success, shippingOptions, addressMatched }
 */
export async function calculateShippingRates(items, address) {
    try {
        if (!items || items.length === 0) {
            return { success: true, shippingOptions: [] };
        }

        // 1. Normalize and Lookup Address Info
        let { pincode, state, country } = address || {};
        pincode = (pincode || '').toString().trim();
        country = (country || 'India').toString().trim();
        
        if (pincode && (!state || state === '')) {
            const pinData = await prisma.pincodeData.findUnique({ 
                where: { pincode: pincode } 
            });
            if (pinData) {
                state = pinData.state;
            }
        }

        const userState = (state || '').toString().trim().toLowerCase();
        const userCountry = country.toLowerCase();

        // 2. Ensure the destination pincode is within an admin-configured delivery area
        const matchedArea = await prisma.area.findFirst({
            where: {
                pincode: pincode,
                status: 'active'
            }
        });

        if (!matchedArea) {
            return {
                success: true,
                shippingOptions: [],
                addressMatched: {
                    areaName: null,
                    state: state || 'Unknown',
                    country: country || 'India',
                    pincode: pincode
                }
            };
        }

        // 3. Group items by Shipping Profile
        const profileSums = {}; // profileId -> { totalWeight, totalPrice, items: [] }
        let verifiedCartTotal = 0;
        
        for (const item of items) {
            let product = item;
            // Always fetch fresh data to ensure security and consistency
            const dbProduct = await prisma.product.findUnique({
                where: { id: item.productId || item.id },
                select: { id: true, shippingProfileId: true, weight: true, price: true }
            });

            if (!dbProduct) continue;

            const profileId = dbProduct.shippingProfileId || 'default';
            if (!profileSums[profileId]) {
                profileSums[profileId] = { totalWeight: 0, totalPrice: 0, items: [] };
            }

            const qty = item.quantity || 1;
            const price = dbProduct.price || 0;
            const weight = dbProduct.weight || 0;

            profileSums[profileId].totalWeight += weight * qty;
            profileSums[profileId].totalPrice += price * qty;
            profileSums[profileId].items.push({ ...dbProduct, quantity: qty });
            verifiedCartTotal += price * qty;
        }

        const shippingOptions = [];
        let allProfilesMatched = true;

        // 3. Fetch General Profile for fallback logic
        const generalProfile = await prisma.shippingProfile.findFirst({
            where: { isDefault: true },
            include: { zones: { include: { rates: true } } }
        });

        const profileRateResults = []; // Store intermediate results to ensure all profiles have rates

        // 4. Calculate rates for each group of items
        for (const [profileId, data] of Object.entries(profileSums)) {
            let profile = null;
            
            if (profileId === 'default') {
                profile = generalProfile;
            } else {
                profile = await prisma.shippingProfile.findUnique({
                    where: { id: profileId },
                    include: { zones: { include: { rates: true } } }
                });
            }

            if (!profile) {
                // If a specific profile is missing, fallback to general if possible, otherwise fail
                if (generalProfile) {
                    profile = generalProfile;
                } else {
                    allProfilesMatched = false;
                    break;
                }
            }

            // Matching function for a zone
            const findMatchingZone = (pf) => {
                return pf.zones.find(z => {
                    if (!z.isActive) return false;
                    
                    const countries = (Array.isArray(z.countries) ? z.countries : []).map(c => c.toString().toLowerCase());
                    const states = (Array.isArray(z.states) ? z.states : []).map(s => s.toString().toLowerCase());
                    
                    const matchesState = states.includes(userState);
                    const matchesCountry = countries.includes(userCountry);
                    
                    // If states are specified for the zone, they must match. 
                    // Otherwise, if only countries are specified, match country.
                    return states.length > 0 ? (userState && matchesState) : matchesCountry;
                });
            };

            let zone = findMatchingZone(profile);

            // FALLBACK LOGIC: If custom profile has NO zone for this region, fallback to General Profile's zones
            if (!zone && profileId !== 'default' && generalProfile) {
                zone = findMatchingZone(generalProfile);
            }

            if (!zone) {
                allProfilesMatched = false;
                break;
            }

            // Find applicable rates within the matched zone
            const applicableRates = zone.rates.filter(rate => {
                const weightMatch = (data.totalWeight >= (rate.minWeight || 0)) && 
                                    (!rate.maxWeight || data.totalWeight <= rate.maxWeight);
                const priceMatch = (data.totalPrice >= (rate.minPrice || 0)) &&
                                   (!rate.maxPrice || data.totalPrice <= rate.maxPrice);
                return weightMatch && priceMatch;
            });

            if (applicableRates.length === 0) {
                allProfilesMatched = false;
                break;
            }

            profileRateResults.push({ profileId, rates: applicableRates });
        }

        // Only aggregate options if ALL partitions of the cart are deliverable
        if (allProfilesMatched && Object.keys(profileSums).length > 0) {
            profileRateResults.forEach(({ rates }) => {
                rates.forEach(rate => {
                    const existingOption = shippingOptions.find(o => o.name === rate.name);
                    if (existingOption) {
                        existingOption.price += rate.price;
                    } else {
                        shippingOptions.push({
                            name: rate.name,
                            price: rate.price,
                            carrierName: 'Standard Shipping',
                            estimatedDays: '3-7 days'
                        });
                    }
                });
            });
        }

        // 5. Add Hyperlocal Options (Local Delivery & Pickup)
        // These are evaluated against the total cart amount, not per-profile.

        // Local Delivery
        const localDelivery = await prisma.localDeliverySetting.findFirst({
            where: { isActive: true }
        });

        if (localDelivery) {
            const deliveryPincodes = (Array.isArray(localDelivery.pincodes) ? localDelivery.pincodes : [])
                                    .map(p => p.toString().trim());
            
            if (deliveryPincodes.includes(pincode)) {
                if ((localDelivery.minOrderAmount || 0) <= verifiedCartTotal) {
                    shippingOptions.push({
                        name: 'Local Delivery',
                        price: localDelivery.deliveryCharge || 0,
                        isLocal: true,
                        carrierName: 'Hyperlocal Delivery',
                        estimatedDays: 'Same day / 24 hours'
                    });
                }
            }
        }

        // Area-based delivery for admin-managed areas
        if ((matchedArea.minOrderAmount || 0) <= verifiedCartTotal) {
            const areaLabel = normalizeJsonValue(matchedArea.areaName) || `Area ${matchedArea.pincode}`;
            if (!state || state === '') {
                state = normalizeJsonValue(matchedArea.state) || state;
            }
            shippingOptions.push({
                name: areaLabel,
                price: matchedArea.deliveryCharge || 0,
                isAreaDelivery: true,
                carrierName: 'Area Delivery',
                estimatedDays: 'Same day / 24 hours'
            });
        }

        // Local Pickup
        const localPickup = await prisma.localPickupSetting.findFirst({
            where: { isActive: true }
        });

        if (localPickup) {
            shippingOptions.push({
                name: 'Local Pickup',
                price: 0,
                isPickup: true,
                instructions: localPickup.instructions,
                location: localPickup.locationName,
                carrierName: 'Self Collection',
                estimatedDays: 'Ready for pickup'
            });
        }

        return {
            success: true,
            shippingOptions: shippingOptions.sort((a, b) => a.price - b.price),
            addressMatched: {
                areaName: normalizeJsonValue(matchedArea?.areaName) || null,
                state: state || 'Unknown',
                country: country || 'India',
                pincode: pincode
            }
        };

    } catch (error) {
        console.error('Shipping calculation library error:', error);
        return { success: false, message: error.message };
    }
}
