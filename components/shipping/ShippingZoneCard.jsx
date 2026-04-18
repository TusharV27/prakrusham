'use client';

import React, { useState } from 'react';
import { 
    Globe, 
    MoreHorizontal, 
    Plus, 
    Truck, 
    AlertTriangle, 
    Trash2,
    Settings2,
    ChevronRight,
    Edit2
} from 'lucide-react';

export default function ShippingZoneCard({ 
    zone, 
    onAddRate, 
    onEditRate, 
    onDeleteRate, 
    onEditZone, 
    onDeleteZone 
}) {
    // If country is India, show flag, otherwise show globe for international
    const isInternational = zone.name?.toLowerCase().includes('international') || (Array.isArray(zone.countries) && zone.countries.length > 1);
    const [showZoneMenu, setShowZoneMenu] = useState(false);
    const [editingRateMenuId, setEditingRateMenuId] = useState(null);
    
    return (
        <div className="bg-white border border-[#D1D1D1] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden mb-4 font-sans">
            {/* Zone Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#E1E3E5]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#F6F6F7] border border-[#E1E3E5] rounded-lg flex items-center justify-center text-xl shadow-sm overflow-hidden text-[20px]">
                        {Array.isArray(zone.countries) && zone.countries.includes('IN') ? "🇮🇳" : (isInternational ? <Globe size={20} className="text-[#6D7175]" /> : "🌍")}
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-[14px] font-bold text-[#202223] leading-tight">{zone.name}</h4>
                        <p className="text-[12px] text-[#6D7175] font-medium leading-none">
                            {Array.isArray(zone.countries) ? (
                                zone.countries.length === 1 && Array.isArray(zone.states) && zone.states.length > 0
                                    ? `India (${zone.states.length} states)`
                                    : zone.countries.length <= 3 
                                        ? zone.countries.join(', ') 
                                        : `${zone.countries.slice(0, 3).join(', ')}, ${zone.countries.length - 3} more`
                            ) : zone.countries}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setShowZoneMenu(!showZoneMenu)}
                        className="p-1.5 hover:bg-[#F1F2F3] rounded-md text-[#6D7175] transition-colors active:bg-[#ebebeb]"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {showZoneMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowZoneMenu(false)}></div>
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#D1D1D1] rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                <button 
                                    onClick={() => { setShowZoneMenu(false); onEditZone(zone); }}
                                    className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#F6F6F7] flex items-center gap-2.5"
                                >
                                    Edit zone
                                </button>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button 
                                    onClick={() => { setShowZoneMenu(false); onDeleteZone(zone.id); }}
                                    className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-[#d72c0d] hover:bg-red-50 flex items-center gap-2.5"
                                >
                                    Delete zone
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Warning Bar (Markets) - Only for International patterns */}
            {isInternational && (
                <div className="px-4 py-3 bg-[#FFF4E5] border-b border-[#FFEBCC]/50 flex items-start gap-3">
                    <AlertTriangle size={16} className="shrink-0 text-[#916A00] mt-0.5" />
                    <span className="text-[13px] text-[#202223] leading-relaxed">
                        To start selling to <span className="font-bold border-b border-black">{Array.isArray(zone.countries) ? zone.countries.length : 28} countries/regions</span> in this zone, include them in a <span className="underline cursor-pointer">market</span>
                    </span>
                </div>
            )}

            {/* Rates List */}
            <div className="divide-y divide-[#E1E3E5]">
                {zone.rates?.map((rate) => (
                    <div key={rate.id} className="px-4 py-3.5 flex items-center justify-between group hover:bg-[#F9FAFB] transition-all">
                        <div className="flex items-center gap-3">
                            <Truck size={16} className="text-[#6d7175]" />
                            <div className="space-y-0.5">
                                <h5 className="text-[13px] font-medium text-[#202223]">{rate.name}</h5>
                                {rate.type !== 'FLAT' && (
                                    <p className="text-[11px] text-[#6d7175]">
                                        {rate.type === 'WEIGHT_BASED' 
                                            ? `${rate.minWeight || 0} kg ${rate.maxWeight ? `– ${rate.maxWeight} kg` : 'and up'}`
                                            : `₹${rate.minPrice || 0} ${rate.maxPrice ? `– ₹${rate.maxPrice}` : 'and up'}`
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {rate.price === 0 ? (
                                <span className="text-[11px] font-bold text-[#6d7175] bg-[#eceef0] px-2 py-0.5 rounded-md">Free</span>
                            ) : (
                                <span className="text-[11px] font-bold text-[#6d7175] bg-[#eceef0] px-2 py-0.5 rounded-md">
                                    ₹{rate.price.toLocaleString('en-IN')}
                                </span>
                            )}
                            <div className="relative">
                                <button 
                                    onClick={() => setEditingRateMenuId(editingRateMenuId === rate.id ? null : rate.id)}
                                    className="p-1 hover:bg-[#ebebeb] rounded-md text-[#6d7175]"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                
                                {editingRateMenuId === rate.id && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setEditingRateMenuId(null)}></div>
                                        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#D1D1D1] rounded-lg shadow-xl z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                                            <button 
                                                onClick={() => { setEditingRateMenuId(null); onEditRate(rate); }}
                                                className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-[#202223] hover:bg-[#F6F6F7]"
                                            >
                                                Edit rate
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button 
                                                onClick={() => { setEditingRateMenuId(null); onDeleteRate(rate.id); }}
                                                className="w-full text-left px-3.5 py-2 text-[13px] font-medium text-[#d72c0d] hover:bg-red-50"
                                            >
                                                Delete rate
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => onAddRate(zone.id)}
                    className="w-full text-left px-4 py-4 text-[13px] font-medium text-[#005BD3] hover:bg-[#F9FAFB] transition-all flex items-center gap-2 border-t border-[#E1E3E5] group"
                >
                    <div className="w-5 h-5 bg-white border border-[#005BD3] rounded-full flex items-center justify-center group-hover:bg-[#005BD3]/5">
                        <Plus size={12} className="text-[#005BD3]" strokeWidth={3} />
                    </div>
                    <span>Add shipping option</span>
                </button>
            </div>
        </div>
    );
}
