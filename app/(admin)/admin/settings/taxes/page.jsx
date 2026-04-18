'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Percent, 
    Save, 
    Loader2, 
    CheckCircle2, 
    AlertCircle,
    Info,
    ChevronRight,
    Search,
    Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminTaxSettings() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [settings, setSettings] = useState({
        defaultTaxRate: 5.0,
        pricesIncludeTax: false,
        chargeTaxOnShipping: false,
        taxCalculationMethod: 'standard'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/settings/taxes');
            const result = await res.json();
            if (result.success) {
                setSettings(result.data);
            } else {
                setError('Failed to load settings');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            const res = await fetch('/api/admin/settings/taxes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const result = await res.json();
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to update settings');
            }
        } catch (err) {
            console.error(err);
            setError('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-32">
            <div className="max-w-[800px] mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button 
                        onClick={() => router.push('/admin/settings')}
                        className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-white border border-transparent hover:border-[#c9cccf] transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#6d7175] uppercase tracking-wider">
                            <Percent size={12} />
                            Settings
                        </div>
                        <h1 className="text-2xl font-bold text-[#202223]">Taxes and duties</h1>
                    </div>
                </div>

                {/* Notifications */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-[#e4f1ed] border border-[#aee9d1] text-[#006e52] p-4 rounded-lg flex items-center gap-3 shadow-sm"
                        >
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-medium">Settings saved successfully</span>
                        </motion.div>
                    )}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-[#faecec] border border-[#fecaca] text-[#8c2626] p-4 rounded-lg flex items-center gap-3 shadow-sm"
                        >
                            <AlertCircle size={18} />
                            <span className="text-sm font-medium">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6">
                    
                    {/* Tax Calculations Section */}
                    <section className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-[#f1f1f1]">
                            <h2 className="font-bold text-[#202223]">Tax calculations</h2>
                            <p className="text-sm text-[#6d7175] mt-1">Manage how taxes are calculated on your store.</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div className="pt-0.5">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060] cursor-pointer"
                                        checked={settings.pricesIncludeTax}
                                        onChange={(e) => setSettings(prev => ({ ...prev, pricesIncludeTax: e.target.checked }))}
                                    />
                                </div>
                                <div>
                                    <span className="text-[14px] font-semibold text-[#202223] group-hover:text-[#008060] transition-colors">All prices include tax</span>
                                    <p className="text-[13px] text-[#6d7175] mt-0.5">If enabled, the listed price of your products will be treated as the final price, with tax being a portion of that price.</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div className="pt-0.5">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060] cursor-pointer"
                                        checked={settings.chargeTaxOnShipping}
                                        onChange={(e) => setSettings(prev => ({ ...prev, chargeTaxOnShipping: e.target.checked }))}
                                    />
                                </div>
                                <div>
                                    <span className="text-[14px] font-semibold text-[#202223] group-hover:text-[#008060] transition-colors">Charge tax on shipping rates</span>
                                    <p className="text-[13px] text-[#6d7175] mt-0.5">Include shipping costs when calculating tax for the total order.</p>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* Default Tax Rates Section */}
                    <section className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-[#f1f1f1]">
                            <h2 className="font-bold text-[#202223]">Global tax settings</h2>
                            <p className="text-sm text-[#6d7175] mt-1">Define the default rules followed for products that don't have specific overrides.</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="max-w-[300px]">
                                <label className="text-xs font-bold text-[#202223] mb-1.5 block uppercase tracking-wider">Default Tax Rate (%)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="w-full border border-[#c9cccf] px-3 py-2 rounded-md text-sm outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-inner transition-all pr-10"
                                        value={settings.defaultTaxRate}
                                        onChange={(e) => setSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) || 0 }))}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6d7175]">%</div>
                                </div>
                                <p className="text-[11px] text-[#6d7175] mt-2 italic">Applied to all taxable products without a specific rate override.</p>
                            </div>
                        </div>
                    </section>

                    {/* Regional Settings Placeholder */}
                    <section className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden opacity-80 group">
                        <div className="p-5 border-b border-[#f1f1f1] flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-[#202223]">Tax regions</h2>
                                <p className="text-sm text-[#6d7175] mt-1">Manage specific tax rates for countries and states.</p>
                            </div>
                            <div className="bg-[#f4f6f8] text-[10px] font-bold px-2 py-0.5 rounded-full text-[#6d7175] uppercase group-hover:bg-[#008060] group-hover:text-white transition-colors">Coming Soon</div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-lg border border-dashed border-[#c9cccf]">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#c9cccf] text-[#6d7175]">
                                    <Globe size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#202223]">Regional tax overrides</p>
                                    <p className="text-xs text-[#6d7175]">Set distinct GST/VAT rates for different geographical zones.</p>
                                </div>
                                <ChevronRight size={16} className="text-[#c9cccf]" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Info Note */}
                <div className="bg-[#e2f1fe] border border-[#b0dcfb] p-4 rounded-xl flex gap-4">
                    <div className="text-[#084e8a] pt-0.5"><Info size={20} /></div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-[#084e8a]">Looking for individual product taxes?</p>
                        <p className="text-[13px] text-[#084e8a]/80">You can still override these global settings by visiting the specific product edit page in the <Link href="/admin/products" className="underline font-semibold hover:text-[#084e8a]">Product Dashboard</Link>.</p>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-white border-t border-[#c9cccf] p-4 flex items-center justify-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-all">
                    <div className="max-w-[800px] w-full flex items-center justify-between">
                        <p className="text-sm text-[#6d7175] italic hidden sm:block">Unsaved changes will be lost.</p>
                        <div className="flex items-center gap-3 ml-auto">
                            <button 
                                onClick={() => router.push('/admin/settings')}
                                className="px-5 py-2 border border-[#c9cccf] rounded-md text-sm font-medium text-[#202223] hover:bg-[#f4f6f8] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2 bg-[#008060] text-white rounded-md text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
