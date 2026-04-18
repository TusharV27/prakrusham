'use client';

import React, { useState, useEffect } from 'react';
import { Truck, ArrowLeft, Save, AlertCircle, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LocalDeliveryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        isActive: false,
        deliveryRadius: 10,
        minOrderAmount: 0,
        deliveryCharge: 0,
        pincodes: []
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/shipping/local-delivery');
            const result = await res.json();
            if (result.success) {
                setFormData(result.data);
            }
        } catch (err) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await fetch('/api/admin/shipping/local-delivery', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            if (result.success) {
                router.push('/admin/settings/shipping');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#F6F6F7] font-sans pb-32">
            <div className="max-w-[700px] mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header with Back Button */}
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => router.push('/admin/settings/shipping')} className="text-[#6d7175] hover:text-[#202223] transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[20px] font-bold text-[#202223]">Local delivery</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-3 text-red-800 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Status Card */}
                <div className="bg-white border border-[#D1D1D1] rounded-xl shadow-sm overflow-hidden hover:border-[#BABFC3] transition-colors group">
                    <div className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-[14px] font-bold text-[#202223]">Offer local delivery</h3>
                            <p className="text-[12px] text-[#6D7175] font-medium tracking-tight">Allow customers near your location to choose delivery instead of shipping.</p>
                        </div>
                        <button 
                            onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-inner ${formData.isActive ? 'bg-[#008060]' : 'bg-[#D1D1D1]'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all shadow-md ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Settings Card */}
                <div className={`bg-white border border-[#D1D1D1] rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${formData.isActive ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <div className="p-4 border-b border-[#F1F2F3] flex items-center gap-3 bg-[#F9FAFB]/50">
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm">
                            <Truck size={16} />
                        </div>
                        <h2 className="text-[13px] font-bold text-[#202223] uppercase tracking-wider opacity-80">Delivery configuration</h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-[#202223] uppercase tracking-widest ml-0.5">Delivery radius (km)</label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        value={formData.deliveryRadius}
                                        onChange={(e) => setFormData({...formData, deliveryRadius: e.target.value})}
                                        className="w-full border border-[#BABFC3] rounded-lg px-4 py-2 text-sm focus:border-[#008060] outline-none shadow-inner transition-all"
                                        placeholder="10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">km</span>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-bold text-[#202223] uppercase tracking-widest ml-0.5">Delivery charge (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                    <input 
                                        type="number"
                                        value={formData.deliveryCharge}
                                        onChange={(e) => setFormData({...formData, deliveryCharge: e.target.value})}
                                        className="w-full border border-[#BABFC3] rounded-lg pl-7 pr-4 py-2 text-sm focus:border-[#008060] outline-none shadow-inner transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-0.5">
                                <label className="text-[12px] font-bold text-[#202223] uppercase tracking-widest">Minimum order amount (₹)</label>
                                <Info size={14} className="text-[#6D7175]" />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                                <input 
                                    type="number"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                                    className="w-full border border-[#BABFC3] rounded-lg pl-7 pr-4 py-2 text-sm focus:border-[#008060] outline-none shadow-inner transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-[#F1F2F3]">
                            <label className="text-[12px] font-bold text-[#202223] uppercase tracking-widest ml-0.5">Service area pincodes</label>
                            <textarea 
                                value={formData.pincodes.join(', ')}
                                onChange={(e) => setFormData({...formData, pincodes: e.target.value.split(',').map(p => p.trim()).filter(p => p !== '')})}
                                className="w-full border border-[#BABFC3] rounded-lg px-4 py-2 text-sm focus:border-[#008060] outline-none shadow-inner min-h-[120px] transition-all"
                                placeholder="Enter pincodes separated by commas (e.g. 382010, 380001)"
                            />
                            <div className="flex gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Local delivery will only be offered to customers whose shipping pincode matches one of the entries above.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end pt-6 border-t border-[#D1D1D1]">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => router.push('/admin/settings/shipping')}
                            className="px-6 py-2 border border-[#BABFC3] rounded-xl text-sm font-bold text-[#202223] hover:bg-white transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-2 bg-[#008060] text-white rounded-xl text-sm font-black hover:bg-[#006e52] shadow-md transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
