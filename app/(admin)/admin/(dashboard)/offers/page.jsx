'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Edit3, Trash2, Search, X, Check, Eye, RefreshCw, 
    Zap, Calendar, Clock, Image as ImageIcon, ShoppingBag, 
    CheckCircle2, AlertCircle, Loader2, ArrowRight, LayoutGrid, 
    Gift, Timer, Globe, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeListTab, setActiveListTab] = useState('ALL'); // ALL, HERO, COMBO
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [activeTab, setActiveTab] = useState('en');
    const [language, setLanguage] = useState('en');

    // For product selection
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: { en: '', hi: '', gu: '' },
        description: { en: '', hi: '', gu: '' },
        discountType: 'PERCENTAGE',
        value: '',
        startTime: '',
        endTime: '',
        isActive: true,
        showInHero: false,
        slug: '',
        productIds: [],
        images: []
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [newImages, setNewImages] = useState([]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/offers');
            const data = await res.json();
            if (data.success) {
                setOffers(data.data);
            }
        } catch (error) {
            console.error('Fetch offers error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?limit=1000&status=ACTIVE');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Fetch products error:', error);
        }
    };

    useEffect(() => {
        fetchOffers();
        fetchProducts();
    }, []);

    const resetForm = () => {
        setFormData({
            name: { en: '', hi: '', gu: '' },
            description: { en: '', hi: '', gu: '' },
            discountType: 'PERCENTAGE',
            value: '',
            startTime: new Date().toISOString().split('T')[0],
            endTime: '',
            isActive: true,
            showInHero: false,
            slug: '',
            productIds: [],
            images: []
        });
        setImagePreviews([]);
        setNewImages([]);
        setIsEdit(false);
        setSelectedOffer(null);
        setActiveTab('en');
    };

    const handleEdit = (offer) => {
        setIsEdit(true);
        setSelectedOffer(offer);
        setFormData({
            name: offer.name || { en: '', hi: '', gu: '' },
            description: offer.description || { en: '', hi: '', gu: '' },
            discountType: offer.discountType,
            value: offer.value,
            startTime: offer.startTime?.split('T')[0] || '',
            endTime: offer.endTime?.split('T')[0] || '',
            isActive: offer.isActive,
            showInHero: offer.showInHero,
            slug: offer.slug || '',
            productIds: offer.products?.map(p => p.id) || [],
            images: offer.images || []
        });
        setImagePreviews(offer.images?.map(img => img.url) || []);
        setShowFormModal(true);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        // Also need to handle removing from newImages or existing images logic on submit
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const url = isEdit ? `/api/admin/offers/${selectedOffer.id}` : '/api/admin/offers';
            const method = isEdit ? 'PUT' : 'POST';

            const payload = new FormData();
            payload.append('name', JSON.stringify(formData.name));
            payload.append('description', JSON.stringify(formData.description));
            payload.append('discountType', formData.discountType);
            payload.append('value', formData.value);
            payload.append('startTime', formData.startTime);
            payload.append('endTime', formData.endTime);
            payload.append('isActive', formData.isActive);
            payload.append('showInHero', formData.showInHero);
            payload.append('slug', formData.slug);
            payload.append('productIds', JSON.stringify(formData.productIds));

            newImages.forEach(file => {
                payload.append('images', file);
            });

            // For existing images in edit mode
            if (isEdit) {
                const existingImages = imagePreviews.filter(url => !url.startsWith('blob:'));
                payload.append('existingImages', JSON.stringify(existingImages));
            }

            const res = await fetch(url, {
                method,
                body: payload,
            });

            const result = await res.json();

            if (result.success) {
                await fetchOffers();
                setShowFormModal(false);
                resetForm();
            } else {
                alert('Error: ' + (result.error || result.message));
            }
        } catch (error) {
            console.error('Submit offer error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this promotional offer?')) return;
        try {
            const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) await fetchOffers();
        } catch (error) {
            console.error('Delete offer error:', error);
        }
    };

    const filteredOffers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return offers.filter(o => {
            const name = (o.name?.[language] || o.name?.en || o.name || '').toLowerCase();
            return name.includes(q) || (o.slug || '').toLowerCase().includes(q);
        });
    }, [offers, searchQuery, language]);

    const getStatusInfo = (offer) => {
        const now = new Date();
        const start = new Date(offer.startTime);
        const end = new Date(offer.endTime);

        if (!offer.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: AlertCircle };
        if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: Clock };
        if (now > end) return { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertCircle };
        return { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
    };

    const displayOffers = useMemo(() => {
        let list = filteredOffers;
        if (activeListTab === 'HERO') {
            list = list.filter(o => o.showInHero);
        } else if (activeListTab === 'COMBO') {
            list = list.filter(o => o.discountType === 'COMBO' || (o.products && o.products.length >= 2));
        }
        return list;
    }, [filteredOffers, activeListTab]);

    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#202223]">Promotional Offers</h1>
                        <p className="text-[#6d7175] text-sm mt-1">Manage time-bound deals, hero banners, and product combo offers.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-white border border-[#c9cccf] rounded text-sm px-3 py-1.5 outline-none focus:border-[#008060] shadow-sm font-medium"
                        >
                            <option value="en">English View</option>
                            <option value="hi">Hindi View</option>
                            <option value="gu">Gujarati View</option>
                        </select>
                        <button 
                            onClick={() => { resetForm(); setShowFormModal(true); }}
                            className="flex items-center gap-2 bg-[#202223] text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-[#333] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Create Offer
                        </button>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-[#c9cccf] bg-[#fafbfb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex bg-[#f4f6f8] p-1 rounded-lg border border-[#c9cccf] w-fit">
                            {[
                                { id: 'ALL', label: 'All Promotions' },
                                { id: 'HERO', label: 'Hero Banners' },
                                { id: 'COMBO', label: 'Combo Deals' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveListTab(tab.id)}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeListTab === tab.id ? 'bg-[#202223] text-white shadow-md' : 'text-[#6d7175] hover:text-[#202223]'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input 
                                type="text" 
                                placeholder="Filter items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm outline-none focus:border-[#008060]"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#008060]" />
                            <p className="font-medium">Synchronizing Offers...</p>
                        </div>
                    ) : filteredOffers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <Zap className="w-12 h-12 mb-4 text-[#c9cccf]" />
                            <h3 className="text-lg font-bold text-[#202223]">No Offers Found</h3>
                            <p className="text-sm text-[#6d7175] mt-1">Start by creating a new promotional banner or combo deal.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                    <tr>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest">Promotion</th>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest">Type & Impact</th>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest">Products</th>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest">Timeline</th>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest text-center">Flags</th>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest text-center">Status</th>
                                        <th className="px-5 py-3 font-bold uppercase text-[10px] tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ebebeb]">
                                    {displayOffers.map((offer) => {
                                        const status = getStatusInfo(offer);
                                        const StatusIcon = status.icon;
                                        const isCombo = offer.discountType === 'COMBO' || (offer.products?.length >= 2);
                                        return (
                                            <tr key={offer.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => handleEdit(offer)}>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-10 rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden flex-shrink-0">
                                                            {offer.images?.[0]?.url ? (
                                                                <img src={offer.images[0].url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#babfc3]">
                                                                    <ImageIcon size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#202223] uppercase">{offer.name?.[language] || offer.name?.en || offer.name}</div>
                                                            <div className="text-xs font-mono text-[#6d7175]">/{offer.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-[#202223] uppercase text-xs">
                                                        {offer.discountType === 'PERCENTAGE' ? `${offer.value}% OFF` : offer.discountType === 'FIXED_AMOUNT' ? `₹${offer.value} OFF` : 'COMBO PRICE'}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-[#6d7175] mt-1 uppercase tracking-tight">
                                                        {offer.discountType.replace('_', ' ')}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] font-black text-[#202223]">{offer.products?.length || 0}</span>
                                                        <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-tighter">Items linked</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-xs font-bold text-[#202223]">
                                                        {new Date(offer.startTime).toLocaleDateString()} - {new Date(offer.endTime).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {offer.showInHero && (
                                                            <div className="w-5 h-5 rounded bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center" title="Hero Banner">
                                                                <Star size={10} fill="currentColor" />
                                                            </div>
                                                        )}
                                                        {isCombo && (
                                                            <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center" title="Combo Deal">
                                                                <LayoutGrid size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                                                        <StatusIcon size={10} />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => handleEdit(offer)} className="p-1.5 text-[#8c9196] hover:text-[#202223] hover:bg-white border border-transparent hover:border-[#c9cccf] rounded transition-all"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDelete(offer.id)} className="p-1.5 text-[#8c9196] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded transition-all"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Form Modal */}
                <AnimatePresence>
                    {showFormModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-6xl bg-[#f4f6f8] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                                {/* Modal Header */}
                                <div className="px-6 py-4 bg-white border-b border-[#ebebeb] flex items-center justify-between shrink-0">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{isEdit ? 'Modify Offer' : 'Initialize New Offer'}</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#6d7175] opacity-60">Visual & Logical Configuration</p>
                                    </div>
                                    <button onClick={() => setShowFormModal(false)} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-lg hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                        
                                        {/* Configuration Left */}
                                        <div className="lg:col-span-8 space-y-6">
                                            
                                            {/* Name & Desc Card */}
                                            <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-6 space-y-5">
                                                <div className="flex bg-[#f4f6f8] p-1 rounded-lg border border-[#c9cccf] w-fit">
                                                    {['en', 'hi', 'gu'].map(lang => (
                                                        <button 
                                                            key={lang} type="button"
                                                            onClick={() => setActiveTab(lang)}
                                                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === lang ? 'bg-[#202223] text-white shadow-md' : 'text-[#6d7175] hover:text-[#202223]'}`}
                                                        >
                                                            {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Gujarati'}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">Offer Headline ({activeTab}) *</label>
                                                        <input 
                                                            required type="text"
                                                            className="w-full border border-[#c9cccf] rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:border-[#008060] transition-all"
                                                            value={formData.name[activeTab]}
                                                            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, [activeTab]: e.target.value } })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">Subtext / Description ({activeTab})</label>
                                                        <textarea 
                                                            rows="2"
                                                            className="w-full border border-[#c9cccf] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#008060] transition-all resize-none"
                                                            value={formData.description[activeTab]}
                                                            onChange={(e) => setFormData({ ...formData, description: { ...formData.description, [activeTab]: e.target.value } })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Logic & Value Card */}
                                            <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-6 space-y-5">
                                                <h4 className="text-sm font-bold text-[#202223] uppercase border-b border-[#f4f6f8] pb-3 flex items-center gap-2">
                                                    <Timer size={16} className="text-[#008060]" />
                                                    Financial & Timing Logic
                                                </h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">Reduction Type</label>
                                                        <select 
                                                            className="w-full border border-[#c9cccf] rounded-lg px-4 py-2.5 text-sm font-bold outline-none focus:border-[#008060] bg-white"
                                                            value={formData.discountType}
                                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                                        >
                                                            <option value="PERCENTAGE">Percentage Reduction (%)</option>
                                                            <option value="FIXED_AMOUNT">Fixed Value Reduction (₹)</option>
                                                            <option value="COMBO">Bundle / Combo Price (Custom)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">Discount Magnitude *</label>
                                                        <div className="relative">
                                                            <input 
                                                                required type="number"
                                                                className="w-full border border-[#c9cccf] rounded-lg pl-4 pr-10 py-2.5 text-sm font-bold outline-none focus:border-[#008060]"
                                                                value={formData.value}
                                                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6d7175]">
                                                                {formData.discountType === 'PERCENTAGE' ? '%' : '₹'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">Commencement Date *</label>
                                                        <input 
                                                            required type="date"
                                                            className="w-full border border-[#c9cccf] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#008060]"
                                                            value={formData.startTime}
                                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">Termination Date *</label>
                                                        <input 
                                                            required type="date"
                                                            className="w-full border border-[#c9cccf] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#008060]"
                                                            value={formData.endTime}
                                                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-6 pt-2 border-t border-[#f4f6f8] pt-5">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-10 h-5 rounded-full relative transition-all ${formData.showInHero ? 'bg-amber-400' : 'bg-[#babfc3]'}`} onClick={() => setFormData({...formData, showInHero: !formData.showInHero})}>
                                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.showInHero ? 'left-6' : 'left-1'}`} />
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-[#202223]">Feature in Hero Slider</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isActive ? 'bg-[#008060]' : 'bg-[#babfc3]'}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? 'left-6' : 'left-1'}`} />
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-[#202223]">Live Deployment Status</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meta & Media Right */}
                                        <div className="lg:col-span-4 space-y-6">
                                            
                                            {/* Media Hub */}
                                            <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                <h4 className="text-xs font-bold text-[#6d7175] uppercase tracking-widest border-b pb-3">Media Hub</h4>
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    {imagePreviews.map((url, i) => (
                                                        <div key={i} className="relative aspect-video rounded-lg border border-[#ebebeb] overflow-hidden group">
                                                            <img src={url} className="w-full h-full object-cover" />
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeImage(i)}
                                                                className="absolute top-1 right-1 p-1 bg-white/80 rounded-md text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className="aspect-video rounded-lg border-2 border-dashed border-[#c9cccf] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#fafbfb] transition-colors">
                                                        <ImageIcon size={18} className="text-[#8c9196]" />
                                                        <span className="text-[10px] font-bold uppercase text-[#6d7175]">Upload</span>
                                                        <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Product Connector */}
                                            <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                <div className="flex items-center justify-between border-b pb-3">
                                                    <h4 className="text-xs font-bold text-[#6d7175] uppercase tracking-widest">Product Links</h4>
                                                    <span className="text-[10px] bg-[#f4f6f8] px-1.5 py-0.5 rounded border font-black">{formData.productIds.length} Linked</span>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c9196]" />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Quick add product..."
                                                            className="w-full pl-9 pr-3 py-1.5 border border-[#c9cccf] rounded-lg text-xs outline-none focus:border-[#202223]"
                                                            value={sidebarSearch}
                                                            onChange={(e) => setSidebarSearch(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                                        {products
                                                            .filter(p => (p.name?.en || '').toLowerCase().includes(sidebarSearch.toLowerCase()))
                                                            .slice(0, 50)
                                                            .map(p => {
                                                                const isSelected = formData.productIds.includes(p.id);
                                                                return (
                                                                    <div 
                                                                        key={p.id} 
                                                                        onClick={() => {
                                                                            const newIds = isSelected 
                                                                                ? formData.productIds.filter(id => id !== p.id)
                                                                                : [...formData.productIds, p.id];
                                                                            setFormData({...formData, productIds: newIds});
                                                                        }}
                                                                        className={`flex items-center gap-3 p-1.5 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-green-50/50 border-green-200' : 'hover:bg-[#f4f6f8] border-transparent'}`}
                                                                    >
                                                                        <div className="w-8 h-8 rounded bg-[#f4f6f8] overflow-hidden border">
                                                                            {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <ShoppingBag size={12} className="m-2 text-[# babfc3]" />}
                                                                        </div>
                                                                        <span className="text-[11px] font-bold text-[#202223] flex-1 line-clamp-1 truncate">{p.name?.[language] || p.name?.en}</span>
                                                                        {isSelected && <CheckCircle size={14} className="text-[#008060]" />}
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Slug Control */}
                                            <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-3">
                                                <label className="text-xs font-bold text-[#6d7175] uppercase tracking-tight">URL Permanent-Link</label>
                                                <input 
                                                    type="text"
                                                    placeholder="e.g. summer-flash-sale"
                                                    className="w-full border border-[#c9cccf] rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#202223]"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                />
                                                <p className="text-[10px] text-[#6d7175] opacity-60">Leave blank to auto-generate based on timestamp.</p>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Modal Footer */}
                                <div className="px-6 py-4 bg-white border-t border-[#ebebeb] flex items-center justify-end gap-3 shrink-0">
                                    <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 rounded-lg border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#f4f6f8] transition-colors">Discard</button>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={actionLoading}
                                        className="bg-[#202223] text-white px-8 py-2 rounded-lg font-bold text-sm hover:bg-black shadow-lg shadow-black/10 transition-all disabled:opacity-50 flex items-center gap-2 min-w-[180px] justify-center"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? <><Check size={16} /> Deploy Changes</> : <><Check size={16} /> Finalize Offer</>)}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 10px; }
                `}</style>
            </div>
        </div>
    );
};

export default OffersPage;
