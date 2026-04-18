'use client';

import React, { useState, useEffect } from 'react';
import { 
    Truck, 
    Plus, 
    MoreHorizontal, 
    Package,
    AlertCircle,
    Loader2,
    Save,
    MapPin,
    Search,
    X,
    Globe,
    IndianRupee,
    Trash2,
    Tag,
    Edit2,
    Store,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ShippingZoneCard from '@/components/shipping/ShippingZoneCard';

const INDIAN_STATES = [
    { name: 'Andaman and Nicobar Islands', code: 'AN' },
    { name: 'Andhra Pradesh', code: 'AP' },
    { name: 'Arunachal Pradesh', code: 'AR' },
    { name: 'Assam', code: 'AS' },
    { name: 'Bihar', code: 'BR' },
    { name: 'Chandigarh', code: 'CH' },
    { name: 'Chhattisgarh', code: 'CG' },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN' },
    { name: 'Delhi', code: 'DL' },
    { name: 'Goa', code: 'GA' },
    { name: 'Gujarat', code: 'GJ' },
    { name: 'Haryana', code: 'HR' },
    { name: 'Himachal Pradesh', code: 'HP' },
    { name: 'Jammu and Kashmir', code: 'JK' },
    { name: 'Jharkhand', code: 'JH' },
    { name: 'Karnataka', code: 'KA' },
    { name: 'Kerala', code: 'KL' },
    { name: 'Ladakh', code: 'LA' },
    { name: 'Lakshadweep', code: 'LD' },
    { name: 'Madhya Pradesh', code: 'MP' },
    { name: 'Maharashtra', code: 'MH' },
    { name: 'Manipur', code: 'MN' },
    { name: 'Meghalaya', code: 'ML' },
    { name: 'Mizoram', code: 'MZ' },
    { name: 'Nagaland', code: 'NL' },
    { name: 'Odisha', code: 'OR' },
    { name: 'Puducherry', code: 'PY' },
    { name: 'Punjab', code: 'PB' },
    { name: 'Rajasthan', code: 'RJ' },
    { name: 'Sikkim', code: 'SK' },
    { name: 'Tamil Nadu', code: 'TN' },
    { name: 'Telangana', code: 'TG' },
    { name: 'Tripura', code: 'TR' },
    { name: 'Uttar Pradesh', code: 'UP' },
    { name: 'Uttarakhand', code: 'UK' },
    { name: 'West Bengal', code: 'WB' }
];

const REGION_DATA = [
    {
        id: 'asia',
        name: 'Asia',
        type: 'region',
        countries: [
            { id: 'IN', name: 'India', flag: '🇮🇳', states: INDIAN_STATES }
        ]
    }
];

export default function ProfileDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Modals state
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [editingRate, setEditingRate] = useState(null);
    const [selectedZoneId, setSelectedZoneId] = useState(null);

    // Form states
    const [zoneName, setZoneName] = useState('');
    const [selectedCountries, setSelectedCountries] = useState([]); // Array of country codes e.g. ['IN']
    const [selectedStates, setSelectedStates] = useState([]); // Array of state names
    const [regionSearchQuery, setRegionSearchQuery] = useState('');
    const [expandedCountries, setExpandedCountries] = useState(['IN']); // Country IDs expanded to show states
    const [rateName, setRateName] = useState('');
    const [ratePrice, setRatePrice] = useState('0');
    const [rateType, setRateType] = useState('FLAT');
    const [minWeight, setMinWeight] = useState('');
    const [maxWeight, setMaxWeight] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Product management state
    const [products, setProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [productLoading, setProductLoading] = useState(false);

    // Advanced Filtering State
    const [searchBy, setSearchBy] = useState('all');
    const [showSearchByMenu, setShowSearchByMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [categoriesList, setCategoriesList] = useState([]);
    const [vendorsList, setVendorsList] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        if (id === 'new') {
            setProfile({
                name: '',
                products: [],
                zones: [],
                productCount: 0
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/admin/shipping/profiles/${id}`);
            const result = await response.json();
            if (result.success) {
                setProfile(result.data);
                if (result.data.products) {
                    setSelectedProductIds(result.data.products.map(p => p.id));
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to fetch shipping profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            setProductLoading(true);
            
            // Build query parameters
            let query = `/api/products?limit=250&status=ALL&search=${encodeURIComponent(productSearch)}`;
            
            // Add searchBy if not 'all'
            if (searchBy !== 'all') {
                query += `&searchBy=${searchBy}`;
            }

            // Add active filters
            activeFilters.forEach(filter => {
                if (filter.type === 'category') query += `&categoryId=${filter.value}`;
                if (filter.type === 'vendor') query += `&vendorId=${filter.value}`;
                if (filter.type === 'status') query += `&status=${filter.value}`;
            });

            const response = await fetch(query);
            const result = await response.json();
            if (result.success) {
                setProducts(result.data || []);
            } else {
                console.error('API Error:', result.message);
                alert('API Error: ' + (result.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Fetch error:', err);
            alert('Network error while fetching products. Check your connection or server logs.');
        } finally {
            setProductLoading(false);
        }
    };

    const fetchFilterData = async () => {
        try {
            const [catRes, venRes] = await Promise.all([
                fetch('/api/categories?limit=100'),
                fetch('/api/vendors?limit=100')
            ]);
            const catData = await catRes.json();
            const venData = await venRes.json();
            if (catData.success) setCategoriesList(catData.data);
            if (venData.success) setVendorsList(venData.data);
        } catch (err) {
            console.error('Failed to fetch filter data:', err);
        }
    };

    const addFilter = (type, value, label) => {
        const filtered = activeFilters.filter(f => f.type !== type);
        setActiveFilters([...filtered, { type, value, label }]);
        setShowFilterMenu(false);
    };

    const removeFilter = (type) => {
        setActiveFilters(prev => prev.filter(f => f.type !== type));
    };

    useEffect(() => {
        if (showProductModal) fetchAllProducts();
    }, [showProductModal, productSearch]);

    const handleSaveProducts = async () => {
        try {
            setSaving(true);
            const response = await fetch(`/api/admin/shipping/profiles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: selectedProductIds })
            });
            const result = await response.json();
            if (result.success) {
                setSuccessMsg('Products updated successfully');
                setShowProductModal(false);
                fetchProfile();
            }
        } catch (err) {
            setError('Failed to update products');
        } finally {
            setSaving(false);
        }
    };

    // Helper for robust name rendering
    const getProductName = (product) => {
        if (!product) return 'Unknown Product';
        if (typeof product.name === 'string') return product.name;
        if (typeof product.name === 'object') {
            return product.name.en || product.name.hi || product.name.gu || 'Unnamed Product';
        }
        return 'Unnamed Product';
    };

    const handleSaveProfile = async () => {
        if (!profile.name?.trim()) {
            setError('Profile name is required');
            return;
        }

        try {
            setSaving(true);
            const method = id === 'new' ? 'POST' : 'PATCH';
            const url = id === 'new' ? '/api/admin/shipping/profiles' : `/api/admin/shipping/profiles/${id}`;
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: profile.name,
                    productIds: id === 'new' ? selectedProductIds : undefined // For new profiles, send initial products
                })
            });
            const result = await response.json();
            if (result.success) {
                setSuccessMsg(`Profile ${id === 'new' ? 'created' : 'saved'} successfully`);
                if (id === 'new') {
                    router.push(`/admin/settings/shipping/${result.data.id}`);
                }
            }
        } catch (err) {
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleZoneAction = async (e) => {
        if (e) e.preventDefault();
        try {
            const method = editingZone ? 'PATCH' : 'POST';
            const url = editingZone ? `/api/admin/shipping/zones/${editingZone.id}` : '/api/admin/shipping/zones';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    profileId: id, 
                    name: zoneName, 
                    countries: selectedCountries, // Array of codes e.g. ['IN']
                    states: selectedStates, // Array of names
                    isActive: true 
                })
            });
            const result = await response.json();
            if (result.success) {
                setShowZoneModal(false);
                resetZoneForm();
                fetchProfile();
                setSuccessMsg(`Zone ${editingZone ? 'updated' : 'created'} successfully`);
            }
        } catch (err) {
            setError(`Failed to ${editingZone ? 'update' : 'create'} zone`);
        }
    };

    const handleDeleteZone = async (zoneId) => {
        if (!confirm('Are you sure you want to delete this zone?')) return;
        try {
            const response = await fetch(`/api/admin/shipping/zones/${zoneId}`, { method: 'DELETE' });
            if (response.ok) {
                fetchProfile();
                setSuccessMsg('Zone deleted successfully');
            }
        } catch (err) {
            setError('Failed to delete zone');
        }
    };

    const handleRateAction = async (e) => {
        e.preventDefault();
        try {
            const method = editingRate ? 'PATCH' : 'POST';
            const url = editingRate ? `/api/admin/shipping/rates/${editingRate.id}` : '/api/admin/shipping/rates';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zoneId: selectedZoneId,
                    name: rateName,
                    type: rateType,
                    price: parseFloat(ratePrice),
                    minWeight: rateType === 'WEIGHT_BASED' ? (minWeight ? parseFloat(minWeight) : 0) : null,
                    maxWeight: rateType === 'WEIGHT_BASED' && maxWeight ? parseFloat(maxWeight) : null,
                    minPrice: rateType === 'PRICE_BASED' ? (minPrice ? parseFloat(minPrice) : 0) : null,
                    maxPrice: rateType === 'PRICE_BASED' && maxPrice ? parseFloat(maxPrice) : null
                })
            });
            const result = await response.json();
            if (result.success) {
                setShowRateModal(false);
                resetRateForm();
                fetchProfile();
                setSuccessMsg(`Rate ${editingRate ? 'updated' : 'created'} successfully`);
            }
        } catch (err) {
            setError(`Failed to ${editingRate ? 'update' : 'create'} rate`);
        }
    };

    const handleDeleteRate = async (rateId) => {
        if (!confirm('Delete this shipping rate?')) return;
        try {
            const response = await fetch(`/api/admin/shipping/rates/${rateId}`, { method: 'DELETE' });
            if (response.ok) {
                fetchProfile();
                setSuccessMsg('Rate deleted successfully');
            }
        } catch (err) {
            setError('Failed to delete rate');
        }
    };

    const resetZoneForm = () => {
        setZoneName(''); 
        setSelectedCountries([]); 
        setSelectedStates([]); 
        setRegionSearchQuery('');
        setEditingZone(null);
    };

    const resetRateForm = () => {
        setRateName(''); setRatePrice('0'); setRateType('FLAT'); setMinWeight(''); setMaxWeight(''); setMinPrice(''); setMaxPrice(''); setEditingRate(null);
    };

    const openEditZone = (zone) => {
        setEditingZone(zone); 
        setZoneName(zone.name); 
        setSelectedCountries(Array.isArray(zone.countries) ? zone.countries : []);
        setSelectedStates(Array.isArray(zone.states) ? zone.states : []);
        setShowZoneModal(true);
    };

    const openEditRate = (zoneId, rate) => {
        setSelectedZoneId(zoneId); setEditingRate(rate); setRateName(rate.name); setRatePrice(rate.price.toString()); setRateType(rate.type); setMinWeight(rate.minWeight?.toString() || ''); setMaxWeight(rate.maxWeight?.toString() || ''); setMinPrice(rate.minPrice?.toString() || ''); setMaxPrice(rate.maxPrice?.toString() || ''); setShowRateModal(true);
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#008060] w-8 h-8" /></div>;
    if (!profile) return <div className="p-12 text-center text-gray-500 font-medium">Profile not found.</div>;

    return (
        <div className="w-full min-h-screen bg-[#f6f6f7]/50 font-sans pb-32">
            <div className="max-w-[700px] mx-auto p-4 md:p-8 space-y-4">
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => router.push('/admin/settings/shipping')} className="text-[#6d7175] hover:text-[#202223] transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Truck size={17} className="text-[#6d7175]" />
                        <h1 className="text-[16px] font-bold text-[#202223] font-sans">
                            {id === 'new' ? 'Create shipping profile' : 'Edit shipping profile'}
                        </h1>
                    </div>
                </div>

                {/* Profile Name Section */}
                <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm p-4 space-y-3">
                    <h2 className="text-[13px] font-semibold text-[#202223]">Profile name</h2>
                    <div className="space-y-1.5">
                        <input 
                            type="text" 
                            value={profile.name} 
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            placeholder="e.g. Fragile products"
                            className="w-full h-10 px-3 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                        />
                        <p className="text-[11px] text-[#6d7175] font-medium leading-tight">Customers won't see this</p>
                    </div>
                </div>

                {/* Products Section */}
                <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm overflow-hidden p-4 space-y-3">
                    <h2 className="text-[13px] font-semibold text-[#202223] font-sans">Products</h2>
                    <button 
                        onClick={() => { setShowProductModal(true); }}
                        className="w-full flex items-center justify-between p-3 border border-[#ebebeb] rounded-lg hover:bg-[#fafafa] transition-colors group"
                    >
                        <div className="flex items-center gap-3 text-left">
                            <Tag size={17} className="text-[#6d7175]" />
                            <div className="space-y-0.5">
                                <span className="text-[13px] font-bold text-[#202223] block leading-tight font-sans">{profile.productCount || '0'} products</span>
                                <span className="text-[11px] text-[#6d7175] font-medium block leading-tight font-sans">Manage products in this profile</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <p className="text-[11px] text-[#6d7175] font-medium leading-relaxed font-sans">
                        Includes all products not in other profiles. New products are added by default.
                    </p>
                </div>

                {/* Fulfillment Location & Shipping Zones */}
                <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm p-4 space-y-5">
                    <div className="space-y-3">
                        <h2 className="text-[13px] font-semibold text-[#202223]">Fulfillment location</h2>
                        <div className="w-full flex items-center justify-between p-3 border border-[#ebebeb] rounded-lg hover:bg-[#fafafa] transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center text-[#6d7175]">
                                    <MapPin size={18} />
                                </div>
                                <div className="space-y-0.5 text-left">
                                    <span className="text-[13px] font-medium text-[#202223] block leading-tight">Shop location</span>
                                    <span className="text-[11px] text-[#6d7175] font-medium block leading-tight">India</span>
                                </div>
                            </div>
                            <button className="p-1.5 hover:bg-[#f1f2f3] rounded-md text-[#6d7175]">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-[13px] font-semibold text-[#202223]">Shipping zones</h2>
                        
                        {/* No Zones Warning Banner */}
                        {(!profile.zones || profile.zones.length === 0) && (
                            <div className="p-3 bg-[#fff4e5] border border-[#ffebcc] rounded-lg flex items-start gap-3">
                                <AlertCircle size={16} className="text-[#916a00] shrink-0 mt-0.5" />
                                <span className="text-[12px] text-[#202223] font-medium leading-relaxed">
                                    Add a zone and shipping option to ship from this location
                                </span>
                            </div>
                        )}

                        <div className="space-y-3">
                            {profile.zones?.map(zone => (
                                <ShippingZoneCard 
                                    key={zone.id} zone={zone} 
                                    onAddRate={(zoneId) => { setSelectedZoneId(zoneId); resetRateForm(); setShowRateModal(true); }}
                                    onEditZone={() => openEditZone(zone)}
                                    onEditRate={(rate) => openEditRate(zone.id, rate)}
                                    onDeleteRate={(rateId) => handleDeleteRate(rateId)}
                                    onDeleteZone={() => handleDeleteZone(zone.id)}
                                />
                            ))}

                            <button 
                                onClick={() => { 
                                    if (id === 'new') {
                                        setError('Please save the profile first before adding shipping zones.');
                                        return;
                                    }
                                    resetZoneForm(); 
                                    setShowZoneModal(true); 
                                }}
                                className="w-full text-left p-3 text-[13px] font-medium text-[#202223] hover:bg-[#f6f6f7] transition-colors flex items-center gap-3 border border-[#ebebeb] rounded-lg"
                            >
                                <div className="w-5 h-5 bg-white border border-[#d1d1d1] rounded-full flex items-center justify-center">
                                    <Plus size={11} strokeWidth={3} className="text-[#6d7175]" />
                                </div>
                                <span>Add zone</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Footer */}
                <div className="flex justify-between items-center py-4 border-t border-[#ebebeb] mt-8">
                    <button onClick={() => router.push('/admin/settings/shipping')} className="px-4 py-1.5 text-[12px] font-bold text-[#202223] hover:bg-white rounded-lg transition-colors border border-[#c9cccf] bg-transparent shadow-sm">
                        Discard
                    </button>
                    <button 
                        onClick={handleSaveProfile} disabled={saving}
                        className="bg-[#008060] text-white px-5 py-1.5 rounded-lg text-[12px] font-black hover:bg-[#006e52] disabled:opacity-60 transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        Save
                    </button>
                </div>

            </div>

            {/* Manage Products Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#202223]/30 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#ebebeb]"
                        >
                            <div className="px-6 py-4 border-b border-[#f1f1f1] flex items-center justify-between bg-white shrink-0">
                                <h3 className="text-[16px] font-bold text-[#202223]">Manage products</h3>
                                <button onClick={() => setShowProductModal(false)} className="p-1 hover:bg-[#f1f2f3] rounded-full transition-colors"><X size={20} className="text-[#6d7175]" /></button>
                            </div>

                            <div className="px-6 py-4 border-b border-[#f1f1f1] bg-white space-y-4 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && fetchAllProducts()}
                                            placeholder="Search products"
                                            className="w-full h-10 pl-10 pr-4 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                        />
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowSearchByMenu(!showSearchByMenu)}
                                            className="h-10 px-4 flex items-center gap-2 bg-white border border-[#babfc3] rounded-lg text-[13px] font-medium text-[#202223] hover:bg-[#fafafa] transition-all whitespace-nowrap min-w-[130px]"
                                        >
                                            Search by {searchBy === 'all' ? 'All' : searchBy}
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showSearchByMenu ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {showSearchByMenu && (
                                            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-[#ebebeb] z-50 py-1 animate-in fade-in slide-in-from-top-1">
                                                {[
                                                    { id: 'all', label: 'All' },
                                                    { id: 'name', label: 'Product title' },
                                                    { id: 'id', label: 'Product ID' },
                                                    { id: 'barcode', label: 'Barcode' },
                                                    { id: 'sku', label: 'SKU' },
                                                    { id: 'variant_id', label: 'Variant ID' },
                                                    { id: 'variant_title', label: 'Variant title' }
                                                ].map((item) => (
                                                    <button 
                                                        key={item.id}
                                                        onClick={() => { setSearchBy(item.id); setShowSearchByMenu(false); }}
                                                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#f6f6f7] transition-colors ${searchBy === item.id ? 'bg-[#f4f6f8] font-bold' : 'text-[#202223]'}`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-dashed border-[#babfc3] rounded-lg text-[13px] font-medium text-[#202223] hover:bg-[#fafafa]"
                                    >
                                        Add filter +
                                    </button>

                                    {showFilterMenu && (
                                        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-[#ebebeb] z-50 py-1 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-1">
                                            {/* Categories */}
                                            <div className="px-3 py-1.5 border-b border-[#f1f1f1]">
                                                <span className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest">Categories</span>
                                                {categoriesList.map(cat => (
                                                    <button 
                                                        key={cat.id} 
                                                        onClick={() => addFilter('category', cat.id, `Category: ${cat.name?.en || cat.name}`)}
                                                        className="w-full text-left px-2 py-1.5 text-[12px] text-[#202223] hover:bg-[#f6f6f7] rounded-md transition-colors"
                                                    >
                                                        {cat.name?.en || cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Vendors */}
                                            <div className="px-3 py-1.5 border-b border-[#f1f1f1]">
                                                <span className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest">Vendors</span>
                                                {vendorsList.map(v => (
                                                    <button 
                                                        key={v.id} 
                                                        onClick={() => addFilter('vendor', v.id, `Vendor: ${v.businessName?.en || v.businessName || v.name?.en}`)}
                                                        className="w-full text-left px-2 py-1.5 text-[12px] text-[#202223] hover:bg-[#f6f6f7] rounded-md transition-colors"
                                                    >
                                                        {v.businessName?.en || v.businessName || v.name?.en}
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Status */}
                                            <div className="px-3 py-1.5">
                                                <span className="text-[10px] font-black text-[#6d7175] uppercase tracking-widest">Status</span>
                                                {['ACTIVE', 'DRAFT', 'ARCHIVED'].map(status => (
                                                    <button 
                                                        key={status} 
                                                        onClick={() => addFilter('status', status, `Status: ${status}`)}
                                                        className="w-full text-left px-2 py-1.5 text-[12px] text-[#202223] hover:bg-[#f6f6f7] rounded-md transition-colors"
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Active Filter Chips */}
                                {activeFilters.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-left-2 pb-1">
                                        {activeFilters.map((filter, idx) => (
                                            <div 
                                                key={idx} 
                                                className="flex items-center gap-1.5 bg-white border border-[#babfc3] px-2.5 py-1 rounded-full shadow-sm"
                                            >
                                                <span className="text-[11px] font-bold text-[#202223]">{filter.label}</span>
                                                <button 
                                                    onClick={() => removeFilter(filter.type)}
                                                    className="p-0.5 hover:bg-[#fafafa] rounded-full text-[#6d7175] hover:text-red-500 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => { setActiveFilters([]); setProductSearch(''); setSearchBy('all'); }}
                                            className="text-[11px] font-bold text-[#007ace] hover:underline px-2 py-1 transition-all"
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto shrink-1 custom-scrollbar">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-0 bg-[#fafafa] border-b border-[#f1f1f1] z-10">
                                        <tr>
                                            <th className="w-12 px-4 py-2 text-left text-[11px] font-bold text-[#6d7175] uppercase tracking-wider">
                                                <div className="w-5 h-5 border-2 border-[#babfc3] rounded bg-white"></div>
                                            </th>
                                            <th className="px-4 py-2 text-left text-[11px] font-bold text-[#6d7175] uppercase tracking-wider">Product</th>
                                            <th className="px-4 py-2 text-right text-[11px] font-bold text-[#6d7175] uppercase tracking-wider">Profile</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#f1f1f1]">
                                        {productLoading ? (
                                            <tr>
                                                <td colSpan="3" className="py-20 text-center text-[13px] text-[#6d7175]">
                                                    <Loader2 className="animate-spin inline mr-2" size={20} /> Loading products...
                                                </td>
                                            </tr>
                                        ) : products.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="py-20 text-center space-y-2">
                                                    <Package size={32} className="mx-auto text-[#babfc3] mb-2" />
                                                    <p className="text-[14px] font-bold text-[#202223]">No products found</p>
                                                    <p className="text-[12px] text-[#6d7175]">Try changing your search or filters.</p>
                                                </td>
                                            </tr>
                                        ) : products.map((product) => {
                                            const isSelected = selectedProductIds.includes(product.id);
                                            return (
                                                <tr 
                                                    key={product.id}
                                                    onClick={() => {
                                                        setSelectedProductIds(prev => isSelected ? prev.filter(id => id !== product.id) : [...prev, product.id]);
                                                    }}
                                                    className={`hover:bg-[#fafafa] cursor-pointer transition-colors ${isSelected ? 'bg-[#f4f6f8]' : ''}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-[#007ace] border-[#007ace]' : 'bg-white border-[#babfc3]'}`}>
                                                            {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 border border-[#f1f1f1] bg-white rounded flex items-center justify-center overflow-hidden shrink-0">
                                                                {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <Package size={18} className="text-[#babfc3]" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-medium text-[#202223] truncate">{getProductName(product)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-[12px] text-[#6d7175] font-medium italic">
                                                            {product.shippingProfileId === id ? 'Current profile' : (product.shippingProfileName || '')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-[#f1f1f1] flex justify-end gap-3 bg-white shrink-0">
                                <button onClick={() => setShowProductModal(false)} className="px-4 py-1.5 text-[13px] font-semibold text-[#202223] hover:bg-[#f1f2f3] rounded-lg border border-[#babfc3] transition-colors">Cancel</button>
                                <button 
                                    onClick={handleSaveProducts} 
                                    disabled={saving}
                                    className="px-6 py-1.5 text-[13px] font-bold text-white bg-[#202223] hover:bg-black rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Shipping Zone Modal */}
            <AnimatePresence>
                {showZoneModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#202223]/30 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-[#ebebeb]"
                        >
                            <div className="px-6 py-4 border-b border-[#f1f1f1] flex items-center justify-between bg-white shrink-0">
                                <h3 className="text-[16px] font-bold text-[#202223]">{editingZone ? 'Edit' : 'Create'} shipping zone</h3>
                                <button onClick={() => setShowZoneModal(false)} className="p-1 hover:bg-[#f1f2f3] rounded-full transition-colors"><X size={20} className="text-[#6d7175]" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Zone Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[#202223]">Zone name</label>
                                    <input 
                                        type="text" 
                                        value={zoneName} 
                                        onChange={(e) => setZoneName(e.target.value)}
                                        placeholder="e.g. Domestic"
                                        className="w-full h-10 px-3 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                    />
                                    <p className="text-[11px] text-[#6d7175] font-medium">Customers won't see this</p>
                                </div>

                                {/* Regions Search */}
                                <div className="space-y-3">
                                    <label className="text-[13px] font-medium text-[#202223]">Regions</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text" 
                                            value={regionSearchQuery}
                                            onChange={(e) => setRegionSearchQuery(e.target.value)}
                                            placeholder="Search"
                                            className="w-full h-10 pl-10 pr-4 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                        />
                                    </div>

                                    {/* Region List */}
                                    <div className="border border-[#ebebeb] rounded-xl overflow-hidden divide-y divide-[#f1f1f1]">
                                        {REGION_DATA.map(region => (
                                            <div key={region.id} className="bg-white">
                                                {region.countries.map(country => {
                                                    const isExpanded = expandedCountries.includes(country.id);
                                                    const countryStates = country.states || [];
                                                    const selectedInThisCountry = countryStates.filter(s => selectedStates.includes(s.name));
                                                    const selectionStatus = selectedCountries.includes(country.id) 
                                                        ? 'all' 
                                                        : (selectedInThisCountry.length > 0 ? 'partial' : 'none');

                                                    const filteredStates = countryStates.filter(s => 
                                                        s.name.toLowerCase().includes(regionSearchQuery.toLowerCase())
                                                    );

                                                    if (regionSearchQuery && filteredStates.length === 0 && !country.name.toLowerCase().includes(regionSearchQuery.toLowerCase())) return null;

                                                    return (
                                                        <div key={country.id}>
                                                            <div className="flex items-center justify-between p-3 hover:bg-[#fafafa] cursor-pointer group" onClick={() => {
                                                                if (selectionStatus === 'all') {
                                                                    setSelectedCountries(prev => prev.filter(id => id !== country.id));
                                                                    setSelectedStates(prev => prev.filter(name => !countryStates.find(s => s.name === name)));
                                                                } else {
                                                                    setSelectedCountries(prev => [...new Set([...prev, country.id])]);
                                                                    setSelectedStates(prev => [...new Set([...prev, ...countryStates.map(s => s.name)])]);
                                                                }
                                                            }}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${selectionStatus === 'all' ? 'bg-[#007ace] border-[#007ace]' : selectionStatus === 'partial' ? 'bg-white border-[#007ace]' : 'bg-white border-[#babfc3]'}`}>
                                                                        {selectionStatus === 'all' && <Check size={14} className="text-white" strokeWidth={4} />}
                                                                        {selectionStatus === 'partial' && <div className="w-2.5 h-0.5 bg-[#007ace] rounded-full" />}
                                                                    </div>
                                                                    <div className="w-8 h-6 flex items-center justify-center bg-gray-50 rounded border border-[#f1f1f1] text-[16px]">
                                                                        {country.flag}
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <span className="text-[13px] font-medium text-[#202223]">{country.name}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[12px] text-[#6d7175] font-medium">
                                                                        {selectedInThisCountry.length === countryStates.length ? `All ${countryStates.length} states` : `${selectedInThisCountry.length} of ${countryStates.length} states`}
                                                                    </span>
                                                                    <button onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setExpandedCountries(prev => isExpanded ? prev.filter(id => id !== country.id) : [...prev, country.id]);
                                                                    }} className="p-1 hover:bg-gray-100 rounded-md transition-all">
                                                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* States list */}
                                                            <AnimatePresence>
                                                                {(isExpanded || regionSearchQuery) && (
                                                                    <motion.div 
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        className="overflow-hidden bg-[#fafafa]"
                                                                    >
                                                                        <div className="pl-12 pr-4 divide-y divide-[#f1f1f1]">
                                                                            {filteredStates.map(state => {
                                                                                const isStateSelected = selectedStates.includes(state.name);
                                                                                return (
                                                                                    <div 
                                                                                        key={state.code} 
                                                                                        className="flex items-center justify-between py-2.5 cursor-pointer hover:text-[#007ace] transition-colors"
                                                                                        onClick={() => {
                                                                                            let newStates;
                                                                                            if (isStateSelected) {
                                                                                                newStates = selectedStates.filter(s => s !== state.name);
                                                                                                setSelectedCountries(prev => prev.filter(id => id !== country.id));
                                                                                            } else {
                                                                                                newStates = [...selectedStates, state.name];
                                                                                                if (newStates.length === countryStates.length) {
                                                                                                    setSelectedCountries(prev => [...new Set([...prev, country.id])]);
                                                                                                }
                                                                                            }
                                                                                            setSelectedStates(newStates);
                                                                                        }}
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isStateSelected ? 'bg-[#007ace] border-[#007ace]' : 'bg-white border-[#babfc3]'}`}>
                                                                                                {isStateSelected && <Check size={11} className="text-white" strokeWidth={4} />}
                                                                                            </div>
                                                                                            <span className="text-[13px] font-medium">{state.name}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="text-[13px] font-medium text-[#007ace] hover:underline">Add more regions in Markets</button>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-[#f1f1f1] flex justify-end gap-3 bg-white shrink-0">
                                <button onClick={() => setShowZoneModal(false)} className="px-4 py-1.5 text-[13px] font-semibold text-[#202223] hover:bg-[#f1f2f3] rounded-lg border border-[#babfc3] transition-colors">Cancel</button>
                                <button 
                                    onClick={handleZoneAction} 
                                    disabled={saving || !zoneName || selectedCountries.length === 0 && selectedStates.length === 0}
                                    className="px-6 py-1.5 text-[13px] font-bold text-white bg-[#202223] hover:bg-black rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Shipping Rate Modal */}
            <AnimatePresence>
                {showRateModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#202223]/30 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-[#ebebeb]"
                        >
                            <div className="px-6 py-4 border-b border-[#f1f1f1] flex items-center justify-between bg-white shrink-0">
                                <h3 className="text-[16px] font-bold text-[#202223]">{editingRate ? 'Edit' : 'Add'} rate</h3>
                                <button onClick={() => setShowRateModal(false)} className="p-1 hover:bg-[#f1f2f3] rounded-full transition-colors"><X size={20} className="text-[#6d7175]" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Rate Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[#202223]">Rate name</label>
                                    <input 
                                        type="text" 
                                        value={rateName} 
                                        onChange={(e) => setRateName(e.target.value)}
                                        placeholder="e.g. Standard"
                                        className="w-full h-10 px-3 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                    />
                                    <p className="text-[11px] text-[#6d7175] font-medium">Customers see this at checkout.</p>
                                </div>

                                {/* Price */}
                                <div className="space-y-1.5">
                                    <label className="text-[13px] font-medium text-[#202223]">Price</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175] text-[14px]">₹</div>
                                        <input 
                                            type="number" 
                                            value={ratePrice} 
                                            onChange={(e) => setRatePrice(e.target.value)}
                                            className="w-full h-10 pl-7 pr-3 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div className="space-y-4 pt-4 border-t border-[#f1f1f1]">
                                    {rateType === 'FLAT' ? (
                                        <button 
                                            onClick={() => setRateType('WEIGHT_BASED')}
                                            className="text-[13px] font-medium text-[#007ace] hover:no-underline underline transition-all"
                                        >
                                            Add conditions
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[13px] font-bold text-[#202223]">Conditions</h4>
                                                <button 
                                                    onClick={() => setRateType('FLAT')}
                                                    className="text-[12px] font-medium text-red-600 hover:underline"
                                                >
                                                    Remove conditions
                                                </button>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <label className="flex items-center gap-3 p-3 border border-[#babfc3] rounded-lg cursor-pointer hover:bg-[#fafafa] transition-colors">
                                                    <input 
                                                        type="radio" 
                                                        name="rateCondition" 
                                                        checked={rateType === 'WEIGHT_BASED'}
                                                        onChange={() => setRateType('WEIGHT_BASED')}
                                                        className="w-4 h-4 text-[#007ace]"
                                                    />
                                                    <span className="text-[13px] font-medium text-[#202223]">Based on item weight</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 border border-[#babfc3] rounded-lg cursor-pointer hover:bg-[#fafafa] transition-colors">
                                                    <input 
                                                        type="radio" 
                                                        name="rateCondition" 
                                                        checked={rateType === 'PRICE_BASED'}
                                                        onChange={() => setRateType('PRICE_BASED')}
                                                        className="w-4 h-4 text-[#007ace]"
                                                    />
                                                    <span className="text-[13px] font-medium text-[#202223]">Based on order price</span>
                                                </label>
                                            </div>

                                            {/* Range Inputs */}
                                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[12px] font-medium text-[#6d7175]">Minimum {rateType === 'WEIGHT_BASED' ? 'weight (kg)' : 'price (₹)'}</label>
                                                    <input 
                                                        type="number" 
                                                        value={rateType === 'WEIGHT_BASED' ? minWeight : minPrice} 
                                                        onChange={(e) => rateType === 'WEIGHT_BASED' ? setMinWeight(e.target.value) : setMinPrice(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full h-10 px-3 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[12px] font-medium text-[#6d7175]">Maximum {rateType === 'WEIGHT_BASED' ? 'weight (kg)' : 'price (₹)'}</label>
                                                    <input 
                                                        type="number" 
                                                        value={rateType === 'WEIGHT_BASED' ? maxWeight : maxPrice} 
                                                        onChange={(e) => rateType === 'WEIGHT_BASED' ? setMaxWeight(e.target.value) : setMaxPrice(e.target.value)}
                                                        placeholder="No limit"
                                                        className="w-full h-10 px-3 bg-white border border-[#babfc3] rounded-lg text-[14px] outline-none focus:ring-1 focus:ring-[#007ace] transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-[#f1f1f1] flex justify-end gap-3 bg-white shrink-0">
                                <button onClick={() => setShowRateModal(false)} className="px-4 py-1.5 text-[13px] font-semibold text-[#202223] hover:bg-[#f1f2f3] rounded-lg border border-[#babfc3] transition-colors">Cancel</button>
                                <button 
                                    onClick={handleRateAction} 
                                    disabled={saving || !rateName || ratePrice === ''}
                                    className="px-6 py-1.5 text-[13px] font-bold text-white bg-[#202223] hover:bg-black rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                                >
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
