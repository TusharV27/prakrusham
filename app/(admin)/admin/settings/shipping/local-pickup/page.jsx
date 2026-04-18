'use client';

import React, { useState, useEffect } from 'react';
import { Store, ArrowLeft, Save, AlertCircle, Loader2, MapPin, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LocalPickupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        isActive: false,
        locationName: '',
        instructions: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/shipping/local-pickup');
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
            const res = await fetch('/api/admin/shipping/local-pickup', {
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
                    <h1 className="text-[20px] font-bold text-[#202223]">Pickup in store</h1>
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
                            <h3 className="text-[14px] font-bold text-[#202223]">Enable local pickup</h3>
                            <p className="text-[12px] text-[#6D7175] font-medium tracking-tight">Allow customers to pick up orders directly from your store or warehouse.</p>
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
                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-purple-600 shadow-sm">
                            <Store size={16} />
                        </div>
                        <h2 className="text-[13px] font-bold text-[#202223] uppercase tracking-wider opacity-80">Pickup locations</h2>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[12px] font-bold text-[#202223] uppercase tracking-widest ml-0.5">Location name</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    value={formData.locationName}
                                    onChange={(e) => setFormData({...formData, locationName: e.target.value})}
                                    placeholder="e.g. Main Warehouse, Downtown Outlet"
                                    className="w-full border border-[#BABFC3] rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#008060] outline-none shadow-inner transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-0.5">
                                <label className="text-[12px] font-bold text-[#202223] uppercase tracking-widest">Instructions for customer</label>
                                <Info size={14} className="text-[#6D7175]" />
                            </div>
                            <textarea 
                                value={formData.instructions}
                                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                                placeholder="e.g. Please bring your order confirmation email and a valid ID."
                                className="w-full border border-[#BABFC3] rounded-lg px-4 py-2 text-sm focus:border-[#008060] outline-none shadow-inner min-h-[150px] transition-all"
                            />
                            <div className="flex gap-2 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                                <Info size={14} className="text-purple-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-purple-700 leading-relaxed font-medium">These instructions will be displayed to customers at checkout and in their order confirmation email when pickup is selected.</p>
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
