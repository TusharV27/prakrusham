'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit3, Trash2, X, Tag, Ticket, Calendar,
    Percent, Banknote, CheckCircle2, Clock, AlertCircle, Loader2,
    RefreshCw, ShoppingBag, UploadCloud, ImageIcon, Download, 
    Gift, Zap, MousePointer2, ChevronDown, ChevronRight, Truck, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DiscountsManagementPage() {
    const router = useRouter();
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [language, setLanguage] = useState('en');

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ active: 0, upcoming: 0, avg: 0, totalValue: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [sidebarLoading, setSidebarLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const initialForm = {
        name: '', nameHi: '', nameGu: '',
        description: '', descriptionHi: '', descriptionGu: '',
        discountType: 'PERCENTAGE',
        value: '',
        startTime: '',
        endTime: '',
        isActive: true,
        showInHero: false,
        slug: '',
        productIds: [],
        
        // Shopify Style Additions
        method: 'CODE', // CODE or AUTOMATIC
        eligibility: 'ALL', // ALL, SEGMENT, CUSTOMER
        minRequirements: 'NONE', // NONE, AMOUNT, QUANTITY
        minAmount: '',
        minQuantity: '',
        usageLimitTotal: false,
        totalUsageCount: '',
        usageLimitPerCustomer: false,
        combinations: {
            product: false,
            order: false,
            shipping: false
        },
        tags: []
    };

    const [form, setForm] = useState(initialForm);

    // ─── TRANSLATIONS ─────────────────────────────────────────────
    const translations = {
        en: {
            pageTitle: 'Offers & Promotions',
            pageDesc: 'Manage discount codes, offers, and promotional campaigns.',
            manager: 'Campaign Manager',
            createCampaign: 'Create offer',
            liveOffers: 'Live Offers',
            campaigns: 'Campaigns',
            searchPlaceholder: 'Search by offer name or code...',
            stats: { active: 'Active', upcoming: 'Upcoming', off: 'Avg Value', products: 'Products', totalValue: 'Total Portfolio' },
            table: { campaign: 'Offer', value: 'Value', timeline: 'Timeline', reach: 'Impact', status: 'Status', actions: 'Actions' },
            status: { active: 'Active', disabled: 'Disabled', upcoming: 'Upcoming', expired: 'Expired' },
            modal: {
                modify: 'Edit offer',
                init: 'New offer',
                subtitle: 'Explicit Multilingual Configuration',
                discard: 'Cancel',
                deploy: 'Save offer',
                scope: 'Scope Assignment',
                scopeDesc: 'Select products to include',
            },
            empty: { title: 'Manage offers and promotions', desc: 'Add discount codes, offers, and automatic discounts that apply at checkout.' }
        },
        hi: {
            pageTitle: 'छूट और प्रचार (Offers & Promotions)',
            pageDesc: 'डिस्काउंट कोड, ऑफर और प्रचार अभियान प्रबंधित करें।',
            manager: 'अभियान प्रबंधक',
            createCampaign: 'ऑफर बनाएं',
            liveOffers: 'लाइव ऑफ़र',
            campaigns: 'अभियान',
            searchPlaceholder: 'ऑफर के नाम से खोजें...',
            stats: { active: 'सक्रिय', upcoming: 'आगामी', off: 'औसत मूल्य', products: 'उत्पाद' },
            table: { campaign: 'ऑफर', value: 'मूल्य', timeline: 'समय सीमा', reach: 'पहुंच', status: 'स्थिति', actions: 'क्रियाएं' },
            status: { active: 'सक्रिय', disabled: 'विकलांग', upcoming: 'आगामी', expired: 'expired' },
            modal: {
                modify: 'ऑफर संपादित करें',
                init: 'नई ऑफर',
                subtitle: 'स्पष्ट बहुभाषी विन्यास',
                discard: 'रद्द करें',
                deploy: 'ऑफर सहेजें',
                scope: 'दायरा असाइनमेंट',
                scopeDesc: 'शामिल करने के लिए उत्पाद चुनें',
            },
            empty: { title: 'ऑफर और प्रचार प्रबंधित करें', desc: 'डिस्काउंट कोड, ऑफर और स्वचालित छूट जोड़ें।' }
        },
        gu: {
            pageTitle: 'ઓફર્સ અને પ્રોમોશન્સ (Offers & Promotions)',
            pageDesc: 'ડિસ્કાઉન્ટ કોડ્સ, ઓફર્સ અને પ્રોમોશનલ કેમ્પેઇન્સ મેનેજ કરો.',
            manager: 'ઝુંબેશ મેનેજર',
            createCampaign: 'ઓફર બનાવો',
            liveOffers: 'લાઇવ ઓફર',
            campaigns: 'ઝુંબેશ',
            searchPlaceholder: 'ઓફરના નામ દ્વારા શોધો...',
            stats: { active: 'સક્રિય', upcoming: 'આગામી', off: 'સરેરાશ મૂલ્ય', products: 'પ્રોડક્ટ્સ' },
            table: { campaign: 'ઓફર', value: 'મૂલ્ય', timeline: 'સમયરેખા', reach: 'પહોંચ', status: 'સ્થિતિ', actions: 'ક્રિયાઓ' },
            status: { active: 'સક્રિય', disabled: 'અક્ષમ', upcoming: 'આગામી', expired: 'expired' },
            modal: {
                modify: 'ઓફર ફેરફાર કરો',
                init: 'નવી ઓફર',
                subtitle: 'સ્પષ્ટ બહુભાષી રૂપરેખાંકન',
                discard: 'રદ કરો',
                deploy: 'ઓફર સાચવો',
                scope: 'સ્કોપ અસાઇનમેન્ટ',
                scopeDesc: 'શામેલ કરવા માટે પ્રોડક્ટ્સ પસંદ કરો',
            },
            empty: { title: 'ઓફર્સ અને પ્રોમોશન્સ મેનેજ કરો', desc: 'ડિસ્કાઉન્ટ કોડ્સ, ઓફર્સ અને ઓટોમેટિક ડિસ્કાઉન્ટ ઉમેરો.' }
        }
    };

    const t = translations[language];

    const getTranslated = (obj, field = 'name', currentLang = language) => {
        if (!obj) return '';
        let val = obj[field];
        if (typeof val === 'string') {
            try {
                val = JSON.parse(val);
            } catch (e) { }
        }
        if (typeof val === 'object' && val !== null) {
            const v = val[currentLang] || val.en || val.hi || val.gu || Object.values(val)[0];
            return v !== undefined && v !== null ? v : '';
        }
        if (currentLang === 'hi' && obj[`${field}Hi`]) return obj[`${field}Hi`];
        if (currentLang === 'gu' && obj[`${field}Gu`]) return obj[`${field}Gu`];
        return typeof val === 'string' || typeof val === 'number' ? val : '';
    };

    const fetchOffers = async (currentPage = page, query = debouncedSearch) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: query
            });
            const res = await fetch(`/api/admin/offers?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setOffers(data?.data || []);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllData = async () => {
        try {
            const categoriesRes = await fetch('/api/categories?limit=100');
            const categoriesData = await categoriesRes.json();
            if (categoriesData.success) {
                setCategories(categoriesData.data || []);
            }
            if (products.length === 0) {
                await fetchSidebarProducts('');
            }
            await fetchOffers(page, debouncedSearch);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSidebarProducts = async (catId = selectedCategoryId, searchQ = sidebarSearch) => {
        try {
            setSidebarLoading(true);
            const queryParams = new URLSearchParams({
                limit: 100,
                categoryId: catId,
                search: searchQ,
                status: 'ACTIVE'
            });
            const res = await fetch(`/api/products?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data || []);
            }
        } catch (error) {
            console.error('Sidebar Products Fetch Error:', error);
        } finally {
            setSidebarLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            fetchSidebarProducts(selectedCategoryId, sidebarSearch);
        }
    }, [selectedCategoryId, sidebarSearch, isModalOpen]);

    useEffect(() => { fetchAllData(); }, []);

    useEffect(() => {
        if (page > 1 || debouncedSearch) {
            fetchOffers(page, debouncedSearch);
        }
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            if (search !== '') setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== '') {
            fetchOffers(1, debouncedSearch);
        } else if (page === 1) {
            fetchOffers(1, '');
        }
    }, [debouncedSearch]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        const previews = files.map(f => ({ url: URL.createObjectURL(f), isExisting: false }));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const openModal = (initData = null) => {
        setSelectedImages([]);
        if (initData && (initData.id || initData.discountType)) {
            if (initData.id) {
                setEditingOffer(initData);
                setForm({
                    name: initData.name || '', 
                    nameHi: initData.nameHi || '', 
                    nameGu: initData.nameGu || '',
                    description: initData.description || '', 
                    descriptionHi: initData.descriptionHi || '', 
                    descriptionGu: initData.descriptionGu || '',
                    discountType: initData.discountType,
                    value: initData.value,
                    startTime: initData.startTime?.split('T')[0] || '',
                    endTime: initData.endTime?.split('T')[0] || '',
                    isActive: initData.isActive ?? true,
                    showInHero: initData.showInHero || false,
                    slug: initData.slug || '',
                    productIds: initData.products?.map(p => p.id) || []
                });
                setImagePreviews((initData.images || []).map(img => ({ url: img.url, isExisting: true })));
            } else {
                setEditingOffer(null);
                setForm({ 
                    ...initialForm, 
                    discountType: initData.discountType,
                    startTime: new Date().toISOString().split('T')[0] 
                });
                setImagePreviews([]);
            }
        } else {
            setEditingOffer(null);
            setForm({ ...initialForm, startTime: new Date().toISOString().split('T')[0] });
            setImagePreviews([]);
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            const formData = new FormData();
            formData.append('name', JSON.stringify({ en: form.name, hi: form.nameHi, gu: form.nameGu }));
            formData.append('description', JSON.stringify({ en: form.description, hi: form.descriptionHi, gu: form.descriptionGu }));
            formData.append('discountType', form.discountType);
            formData.append('value', form.value);
            formData.append('startTime', form.startTime);
            formData.append('endTime', form.endTime);
            formData.append('isActive', form.isActive);
            formData.append('showInHero', form.showInHero);
            formData.append('slug', form.slug);
            formData.append('productIds', JSON.stringify(form.productIds));

            selectedImages.forEach(file => { formData.append('images', file); });
            const existingImages = imagePreviews.filter(img => img.isExisting).map(img => img.url);
            formData.append('existingImages', JSON.stringify(existingImages));

            const url = editingOffer ? `/api/admin/offers/${editingOffer.id}` : '/api/admin/offers';
            const res = await fetch(url, {
                method: editingOffer ? 'PUT' : 'POST',
                body: formData
            });

            if (res.ok) {
                await fetchOffers();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save discount');
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this discount?')) return;
        try {
            const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchOffers();
        } catch (error) { console.error(error); }
    };

    const getStatusInfo = (offer) => {
        const now = new Date(); const start = new Date(offer.startTime); const end = new Date(offer.endTime);
        if (!offer.isActive) return { label: t.status.disabled, color: 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]', icon: <AlertCircle className="w-3 h-3" /> };
        if (now < start) return { label: t.status.upcoming, color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Clock className="w-3 h-3" /> };
        if (now > end) return { label: t.status.expired, color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <AlertCircle className="w-3 h-3" /> };
        return { label: t.status.active, color: 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]', icon: <CheckCircle2 className="w-3 h-3" /> };
    };

    const summary = useMemo(() => {
        const points = [];
        const typeLabel = form.discountType === 'PERCENTAGE' ? 'Percentage' : (form.discountType === 'FIXED_AMOUNT' ? 'Amount off' : 'Combo');
        
        if (form.value) {
            points.push(`${form.value}${form.discountType === 'PERCENTAGE' ? '%' : ' ₹'} off ${form.productIds.length > 0 ? form.productIds.length + ' products' : 'all products'}`);
        }

        if (form.eligibility === 'ALL') points.push('All customers');
        else points.push('Specific customers/segments');

        if (form.minRequirements === 'NONE') points.push('No minimum purchase requirement');
        else if (form.minRequirements === 'AMOUNT') points.push(`Minimum purchase of ₹${form.minAmount || 0}`);
        else points.push(`Minimum quantity of ${form.minQuantity || 0} items`);

        if (form.usageLimitPerCustomer) points.push('One use per customer');
        
        points.push(`Active from ${form.startTime || 'today'}`);
        if (form.endTime) points.push(`Ends at ${form.endTime}`);

        return points;
    }, [form]);

    const statsData = globalStats;

    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/admin/settings')} className="p-1.5 hover:bg-white rounded-md transition-colors text-[#6d7175]">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <Percent className="w-5 h-5 text-[#202223]" />
                        </div>
                        <h1 className="text-xl font-bold text-[#202223]">{t.pageTitle}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 mr-4">
                            <span className="text-[10px] font-bold text-[#6d7175] uppercase tracking-widest">Lang:</span>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white border border-[#c9cccf] rounded text-[11px] font-bold px-2 py-1 outline-none focus:border-[#008060] shadow-sm text-[#202223] cursor-pointer"
                            >
                                <option value="en">EN</option>
                                <option value="hi">HI</option>
                                <option value="gu">GU</option>
                            </select>
                        </div>

                        <button
                            className="flex items-center gap-2 bg-white text-[#202223] border border-[#c9cccf] px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#f6f6f7] shadow-sm transition-colors"
                        >
                            <Download size={16} />
                            Export
                        </button>
                        
                        <button 
                            onClick={() => setIsTypeModalOpen(true)}
                            className="flex items-center gap-2 bg-[#202223] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#323232] shadow-sm transition-colors whitespace-nowrap"
                        >
                            {t.createCampaign}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {offers.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.active}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.active}</h3></div>
                            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Ticket className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.upcoming}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.upcoming}</h3></div>
                            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Clock className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.off}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.avg}%</h3></div>
                            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Percent className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.totalValue}</p><h3 className="text-2xl font-bold text-[#202223]">₹{statsData.totalValue.toLocaleString()}</h3></div>
                            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Banknote className="w-6 h-6" /></div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#008060]" />
                            <p className="text-sm">Accessing Marketing Hub...</p>
                        </div>
                    ) : offers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-white border border-transparent rounded-lg">
                            <div className="mb-8 relative">
                                <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto bg-[#f6f6f7] rounded-full flex items-center justify-center overflow-hidden">
                                    <img 
                                        src="/images/illustrations/discount-empty.png" 
                                        alt="Manage discounts" 
                                        className="w-full h-full object-contain mix-blend-multiply opacity-90 scale-125 translate-y-2"
                                    />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-[#202223] mb-2">{t.empty.title}</h3>
                            <p className="text-sm text-[#6d7175] max-w-md mx-auto mb-8 font-medium">
                                {t.empty.desc} You can also use discounts with <span className="text-[#008060] hover:underline cursor-pointer">compare at prices</span>.
                            </p>
                            <button 
                                onClick={() => setIsTypeModalOpen(true)}
                                className="px-6 py-2.5 bg-[#202223] text-white rounded-md font-bold text-sm hover:bg-[#323232] shadow-sm transition-all"
                            >
                                {t.createCampaign}
                            </button>
                            
                            <div className="mt-12 pt-8 border-t border-[#f1f1f1] w-full">
                                <p className="text-xs text-[#6d7175] font-medium hover:underline cursor-pointer">Learn more about discounts</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 border-b border-[#c9cccf]">
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                                    <input
                                        type="text"
                                        placeholder={t.searchPlaceholder}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#202223]/20 focus:ring-1 focus:ring-[#202223]/20 shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f6f6f7] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold w-[60px]">Thumbnail</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.campaign}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.value}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.timeline}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.reach}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.status}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {offers.map((offer) => {
                                            const status = getStatusInfo(offer);
                                            const image = offer.image || (offer.images?.[0]?.url);
                                            return (
                                                <tr key={offer.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openModal(offer)}>
                                                    <td className="px-5 py-3">
                                                        <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                            {image ? (
                                                                <img src={image} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <Ticket className="w-5 h-5 text-[#8c9196]" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div>
                                                            <div className="font-semibold text-[#202223] uppercase tracking-tight underline-offset-2 group-hover:underline">{getTranslated(offer, 'name')}</div>
                                                            <div className="text-xs text-[#6d7175] font-medium opacity-80 line-clamp-1 max-w-[200px]">{getTranslated(offer, 'description') || 'Discount code'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-1.5 font-bold text-[#202223]">
                                                            <span>{offer.value}{offer.discountType === 'PERCENTAGE' ? '%' : ''} off</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-[#6d7175]">
                                                        <div className="flex flex-col text-xs font-bold uppercase tracking-tight">
                                                            <span className="flex items-center gap-1 opacity-60"><Clock size={10} /> {new Date(offer.startTime).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1 text-[#d82c0d]"><AlertCircle size={10} /> {new Date(offer.endTime).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#202223] bg-[#f4f6f8] px-2 py-0.5 rounded border border-[#c9cccf]">
                                                                <ShoppingBag size={10} /> {offer.products?.length || 0}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openModal(offer)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><Edit3 size={14} /></button>
                                                            <button onClick={() => handleDelete(offer.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors"><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Type Selection Modal */}
                <AnimatePresence>
                    {isTypeModalOpen && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTypeModalOpen(false)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                                <div className="px-5 py-4 flex items-center justify-between border-b border-[#f1f1f1]">
                                    <h3 className="text-base font-bold text-[#202223]">Select discount type</h3>
                                    <button onClick={() => setIsTypeModalOpen(false)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto">
                                    <div className="divide-y divide-[#f1f1f1]">
                                        {[
                                            { id: 'PERCENTAGE', label: 'Amount off products', icon: <Tag className="w-5 h-5" />, desc: 'Discount specific products or collections of products' },
                                            { id: 'COMBO', label: 'Buy X get Y', icon: <Tag className="w-5 h-5" />, desc: 'Discount specific products or collections of products' },
                                            { id: 'FIXED_AMOUNT', label: 'Amount off order', icon: <ShoppingBag className="w-5 h-5" />, desc: 'Discount the total order amount' },
                                            { id: 'SHIPPING', label: 'Free shipping', icon: <Truck className="w-5 h-5" />, desc: 'Offer free shipping on an order', disabled: true },
                                        ].map((type) => (
                                            <button 
                                                key={type.id}
                                                disabled={type.disabled}
                                                onClick={() => {
                                                    setIsTypeModalOpen(false);
                                                    openModal({ discountType: type.id });
                                                }}
                                                className={`w-full flex items-center gap-4 p-5 text-left transition-all group ${type.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f6f6f7]'}`}
                                            >
                                                <div className="text-[#6d7175]">
                                                    {type.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[15px] font-bold text-[#202223]">{type.label}</span>
                                                        <ChevronRight size={18} className="text-[#c9cccf] group-hover:text-[#202223] transition-colors" />
                                                    </div>
                                                    <p className="text-sm text-[#6d7175] mt-0.5">{type.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="px-5 py-4 border-t border-[#f1f1f1] flex items-center justify-end bg-white shrink-0">
                                    <button type="button" onClick={() => setIsTypeModalOpen(false)} className="px-5 py-1.5 rounded-lg border border-[#c9cccf] bg-white text-[#202223] text-sm font-bold hover:bg-[#fafbfb] shadow-sm transition-colors">Cancel</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-6xl bg-[#f1f2f3] rounded-lg shadow-xl overflow-hidden flex flex-col h-[95vh]">
                                <div className="px-5 py-3 bg-white border-b border-[#ebebeb] flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-[#f4f6f8] rounded transition-colors text-[#6d7175]">
                                            <ArrowLeft size={16} />
                                        </button>
                                        <h3 className="text-sm font-bold text-[#202223]">{editingOffer ? t.modal.modify : t.modal.init}</h3>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>

                                <form id="offer-form" onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f1f2f3] space-y-6 scrollbar-hide">
                                    <div className="max-w-6xl mx-auto">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                            
                                            {/* Main Column */}
                                            <div className="lg:col-span-8 space-y-4">
                                                
                                                {/* Method & Code Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden">
                                                    <div className="p-5 space-y-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-[13px] font-bold text-[#202223]">{t.translations?.[language]?.discountType || 'Amount off products'}</h4>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-medium text-[#202223]">Method</label>
                                                                <div className="flex p-0.5 bg-[#f6f6f7] border border-[#d1d1d1] rounded-lg w-fit">
                                                                    <button type="button" onClick={() => setForm({...form, method: 'CODE'})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${form.method === 'CODE' ? 'bg-white shadow-sm text-[#202223]' : 'text-[#637381] hover:bg-black/5'}`}>Discount code</button>
                                                                    <button type="button" onClick={() => setForm({...form, method: 'AUTOMATIC'})} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${form.method === 'AUTOMATIC' ? 'bg-white shadow-sm text-[#202223]' : 'text-[#637381] hover:bg-black/5'}`}>Automatic discount</button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {form.method === 'CODE' && (
                                                            <div className="space-y-3 pt-2">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-xs font-medium text-[#202223]">Discount code</label>
                                                                    <button type="button" onClick={() => setForm({...form, name: Math.random().toString(36).substring(2, 10).toUpperCase()})} className="text-xs font-bold text-[#008060] hover:underline">Generate random code</button>
                                                                </div>
                                                                <input required type="text" className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223] font-bold uppercase transition-all" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase().replace(/\s+/g, '') })} placeholder="E.G. SUMMER2026" />
                                                                <p className="text-[11px] text-[#637381]">Customers must enter this code at checkout.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Value Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                    <h4 className="text-[13px] font-bold text-[#202223]">Value</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full bg-[#f6f6f7] border border-[#d1d1d1] rounded-md px-3 py-2 text-sm outline-none font-medium">
                                                                <option value="PERCENTAGE">Percentage</option>
                                                                <option value="FIXED_AMOUNT">Fixed amount</option>
                                                            </select>
                                                        </div>
                                                        <div className="relative">
                                                            <input required type="number" className="w-full border border-[#c9cccf] rounded-md pl-3 pr-8 py-2 text-sm outline-none focus:border-[#202223]" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="0" />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#637381] text-sm font-bold">{form.discountType === 'PERCENTAGE' ? '%' : '₹'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3 pt-2">
                                                        <label className="text-xs font-medium text-[#202223]">Applies to</label>
                                                        <select className="w-full bg-[#f6f6f7] border border-[#d1d1d1] rounded-md px-3 py-2 text-sm outline-none font-medium">
                                                            <option>Specific products</option>
                                                            <option>Specific collections</option>
                                                        </select>
                                                        <div className="relative">
                                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#637381]" />
                                                            <input type="text" placeholder="Search products" className="w-full border border-[#c9cccf] rounded-l-md pl-9 pr-3 py-2 text-sm outline-none focus:border-[#202223]" value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)} />
                                                            <button type="button" className="absolute right-0 top-0 bottom-0 px-4 border border-l-0 border-[#c9cccf] rounded-r-md bg-white text-sm font-bold text-[#202223] hover:bg-[#f6f6f7]">Browse</button>
                                                        </div>
                                                        {form.productIds.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 pt-1">
                                                                {products.filter(p => form.productIds.includes(p.id)).map(p => (
                                                                    <div key={p.id} className="flex items-center gap-2 bg-[#f6f6f7] px-3 py-1 rounded-full border border-[#d1d1d1] text-[11px] font-bold">
                                                                        <span>{getTranslated(p)}</span>
                                                                        <button type="button" onClick={() => setForm({...form, productIds: form.productIds.filter(id => id !== p.id)})}><X size={12}/></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Eligibility Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                    <h4 className="text-[13px] font-bold text-[#202223]">Customer eligibility</h4>
                                                    <div className="space-y-3">
                                                        {[
                                                            { id: 'ALL', label: 'All customers' },
                                                            { id: 'SEGMENT', label: 'Specific customer segments' },
                                                            { id: 'CUSTOMER', label: 'Specific customers' },
                                                        ].map(item => (
                                                            <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center mt-0.5">
                                                                    <input type="radio" name="eligibility" checked={form.eligibility === item.id} onChange={() => setForm({...form, eligibility: item.id})} className="sr-only" />
                                                                    <div className={`w-4 h-4 rounded-full border transition-all ${form.eligibility === item.id ? 'border-[#008060] border-[5px]' : 'border-[#d1d1d1] bg-white group-hover:border-[#637381]'}`} />
                                                                </div>
                                                                <span className="text-sm font-medium text-[#202223]">{item.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Requirements Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                    <h4 className="text-[13px] font-bold text-[#202223]">Minimum purchase requirements</h4>
                                                    <div className="space-y-3">
                                                        <label className="flex items-start gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center mt-0.5">
                                                                <input type="radio" name="minReq" checked={form.minRequirements === 'NONE'} onChange={() => setForm({...form, minRequirements: 'NONE'})} className="sr-only" />
                                                                <div className={`w-4 h-4 rounded-full border transition-all ${form.minRequirements === 'NONE' ? 'border-[#008060] border-[5px]' : 'border-[#d1d1d1] bg-white group-hover:border-[#637381]'}`} />
                                                            </div>
                                                            <span className="text-sm font-medium text-[#202223]">No minimum requirements</span>
                                                        </label>
                                                        <div className="space-y-2">
                                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center mt-0.5">
                                                                    <input type="radio" name="minReq" checked={form.minRequirements === 'AMOUNT'} onChange={() => setForm({...form, minRequirements: 'AMOUNT'})} className="sr-only" />
                                                                    <div className={`w-4 h-4 rounded-full border transition-all ${form.minRequirements === 'AMOUNT' ? 'border-[#008060] border-[5px]' : 'border-[#d1d1d1] bg-white group-hover:border-[#637381]'}`} />
                                                                </div>
                                                                <span className="text-sm font-medium text-[#202223]">Minimum purchase amount (₹)</span>
                                                            </label>
                                                            {form.minRequirements === 'AMOUNT' && (
                                                                <div className="ml-7 pl-1">
                                                                    <input type="number" className="w-48 border border-[#c9cccf] rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#202223]" value={form.minAmount} onChange={e => setForm({...form, minAmount: e.target.value})} placeholder="0.00" />
                                                                    <p className="text-[11px] text-[#637381] mt-1.5">Applies to all products</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center mt-0.5">
                                                                    <input type="radio" name="minReq" checked={form.minRequirements === 'QUANTITY'} onChange={() => setForm({...form, minRequirements: 'QUANTITY'})} className="sr-only" />
                                                                    <div className={`w-4 h-4 rounded-full border transition-all ${form.minRequirements === 'QUANTITY' ? 'border-[#008060] border-[5px]' : 'border-[#d1d1d1] bg-white group-hover:border-[#637381]'}`} />
                                                                </div>
                                                                <span className="text-sm font-medium text-[#202223]">Minimum quantity of items</span>
                                                            </label>
                                                            {form.minRequirements === 'QUANTITY' && (
                                                                <div className="ml-7 pl-1">
                                                                    <input type="number" className="w-48 border border-[#c9cccf] rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#202223]" value={form.minQuantity} onChange={e => setForm({...form, minQuantity: e.target.value})} placeholder="0" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Active Dates Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                    <h4 className="text-[13px] font-bold text-[#202223]">Active dates</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-[#202223]">Start date</label>
                                                            <input required type="date" className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223]" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-[#202223]">End date</label>
                                                            <input type="date" className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223]" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Sidebar Column */}
                                            <div className="lg:col-span-4 space-y-4 sticky top-0">
                                                
                                                {/* Summary Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-4">
                                                    <div className="space-y-1">
                                                        <h4 className="text-[13px] font-bold text-[#202223]">{form.name || 'No discount code yet'}</h4>
                                                        {form.method === 'CODE' && <p className="text-xs text-[#637381]">Code</p>}
                                                    </div>
                                                    
                                                    <div className="space-y-2 pt-2 border-t border-[#f1f1f1]">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-[#202223]">Type</p>
                                                            <p className="text-xs text-[#637381]">{t.translations?.[language]?.discountType || 'Amount off products'}</p>
                                                        </div>
                                                        <div className="space-y-1.5 pt-2">
                                                            <p className="text-xs font-bold text-[#202223]">Details</p>
                                                            <ul className="list-disc ml-4 space-y-1">
                                                                {summary.map((point, i) => (
                                                                    <li key={i} className="text-xs text-[#637381]">{point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tags Card */}
                                                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-5 space-y-3">
                                                    <h4 className="text-[13px] font-bold text-[#202223]">Tags</h4>
                                                    <div className="flex flex-wrap gap-2 border border-[#c9cccf] rounded-md px-3 py-2 focus-within:border-[#202223] transition-all">
                                                        <input type="text" placeholder="Add tags" className="flex-1 outline-none text-sm min-w-[60px]" />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white shrink-0">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-bold hover:bg-[#fafbfb] shadow-sm transition-all focus:ring-2 focus:ring-black">Cancel</button>
                                    <button type="submit" form="offer-form" disabled={actionLoading} className="px-8 py-2 rounded-md bg-[#202223] text-white text-sm font-bold hover:bg-[#323232] shadow-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center focus:ring-2 focus:ring-black">
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6d7175; }
                `}</style>
            </div>
        </div>
    );
}
