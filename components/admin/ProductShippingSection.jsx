import React, { useState } from 'react';
import { Info, ChevronDown, Monitor, Package, ChevronUp } from 'lucide-react';

export default function ProductShippingSection({ formData, setFormData, shippingProfiles = [] }) {
    const [isInternationalOpen, setIsInternationalOpen] = useState(false);

    const updateShippingMeta = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
            {/* Header with Toggle */}
            <div className="p-5 flex items-center justify-between border-b border-[#ebebeb]">
                <h4 className="text-sm font-semibold text-[#202223]">Shipping</h4>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#6d7175]">Physical product</span>
                    <button
                        type="button"
                        onClick={() => updateShippingMeta('isPhysical', !formData.isPhysical)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isPhysical ? 'bg-[#008060]' : 'bg-[#c9cccf]'}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPhysical ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                    </button>
                </div>
            </div>

            {formData.isPhysical && (
                <div className="p-5 space-y-6">
                    {/* Shipping Profile Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-[#202223]">Shipping profile</label>
                            <Info size={14} className="text-[#6d7175] cursor-help" />
                        </div>
                        <select 
                            className="w-full px-3 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] shadow-inner focus:border-[#008060] outline-none"
                            value={formData.shippingProfileId || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, shippingProfileId: e.target.value }))}
                        >
                            <option value="">Select a profile...</option>
                            {shippingProfiles.map(profile => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name} {profile.isDefault ? '(Default)' : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-[#6d7175]">Shipping profiles help you group products together and apply specific shipping rates.</p>
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-[#202223]">Package</label>
                            <Info size={14} className="text-[#6d7175] cursor-help" />
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196]">
                                <Package size={16} />
                            </div>
                            <select 
                                className="w-full pl-10 pr-10 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] bg-white appearance-none cursor-pointer shadow-inner"
                                value={formData.packageType || 'store_default'}
                                onChange={(e) => updateShippingMeta('packageType', e.target.value)}
                            >
                                <option value="store_default">Store default • Sample box - 8.6 × 5.4 × 1.6 in, 0 lb</option>
                                <option value="custom">Custom packaging</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7175] pointer-events-none">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Weight Input */}
                    <div className="space-y-2">
                        <label className="text-sm text-[#202223]">Product weight</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="any"
                                placeholder="0.0"
                                className="flex-1 px-3 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] shadow-inner"
                                value={formData.weight || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                            />
                            <div className="relative min-w-[80px]">
                                <select 
                                    className="w-full px-3 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] bg-white appearance-none cursor-pointer shadow-inner"
                                    value={formData.weightUnit || 'kg'}
                                    onChange={(e) => updateShippingMeta('weightUnit', e.target.value)}
                                >
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                    <option value="oz">oz</option>
                                    <option value="g">g</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7175] pointer-events-none">
                                    <ChevronDown size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Options Collapsible */}
                    <div className="pt-2">
                        <div 
                            className="flex items-center justify-between py-3 border-t border-[#ebebeb] cursor-pointer group"
                            onClick={() => setIsInternationalOpen(!isInternationalOpen)}
                        >
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-[#f1f2f3] border border-transparent group-hover:border-[#c9cccf] rounded-md text-sm text-[#202223] transition-colors">Country of origin</span>
                                <span className="px-3 py-1 bg-[#f1f2f3] border border-transparent group-hover:border-[#c9cccf] rounded-md text-sm text-[#202223] transition-colors">HS Code</span>
                            </div>
                            <div className={`text-[#6d7175] transition-transform ${isInternationalOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} />
                            </div>
                        </div>

                        {isInternationalOpen && (
                            <div className="space-y-4 pt-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-sm text-[#202223] mb-1 block font-medium">Country/Region of origin</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] bg-white cursor-pointer"
                                        value={formData.countryOfOrigin || ''}
                                        onChange={(e) => updateShippingMeta('countryOfOrigin', e.target.value)}
                                    >
                                        <option value="">Select country...</option>
                                        <option value="IN">India</option>
                                        <option value="US">United States</option>
                                        {/* Add more as needed */}
                                    </select>
                                    <p className="text-xs text-[#6d7175] mt-1.5 leading-relaxed">In most cases, where the product is manufactured or assembled.</p>
                                </div>
                                <div>
                                    <label className="text-sm text-[#202223] mb-1 block font-medium">HS (Harmonized System) code</label>
                                    <input
                                        type="text"
                                        placeholder="Search or enter code"
                                        className="w-full px-3 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060]"
                                        value={formData.hsCode || ''}
                                        onChange={(e) => updateShippingMeta('hsCode', e.target.value)}
                                    />
                                    <p className="text-xs text-[#6d7175] mt-1.5 leading-relaxed">Used by customs to calculate duties for international shipping.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
