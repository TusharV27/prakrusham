'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit3, Trash2, X, Package, Warehouse, Boxes, 
    AlertTriangle, CheckCircle2, Loader2, Save, RefreshCw, History, 
    TrendingUp, BarChart3, Layers, Languages, LayoutGrid, LayoutList,
    ArrowLeft, UploadCloud, ChevronRight, Tag
} from 'lucide-react';

export default function InventoryManagementPage() {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [language, setLanguage] = useState('en');

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ totalQuantity: 0, activeProducts: 0, totalWarehouses: 0, alerts: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');


    const [form, setForm] = useState({
        productId: '',
        variantId: '',
        warehouseId: '',
        quantity: '',
    });

    // ─── TRANSLATIONS ─────────────────────────────────────────────
    const translations = {
        en: {
            eyebrow: 'Warehouse Control',
            pageTitle: 'Inventory',
            pageDesc: 'Monitor stock levels across multiple locations with real-time analytics and predictive tracking.',
            addStock: 'Add Stock',
            stats: { live: 'Live Inventory', active: 'Active Products', warehouses: 'Warehouses', alerts: 'Alert Signals' },
            filters: { all: 'All', instock: 'In Stock', low: 'Low Stock', out: 'Out of Stock' },
            searchPlaceholder: 'Search by product name, SKU or location...',
            table: { portfolio: 'Product', node: 'Warehouse', availability: 'Availability', status: 'Status', commands: 'Actions' },
            statusLabels: { instock: 'In Stock', low: 'Low Stock', out: 'Out of Stock' },
            units: 'Units',
            noSku: 'NO-SKU',
            noWarehouse: 'Unknown',
            noProduct: 'Untitled',
            syncing: 'Syncing Data...',
            zeroTitle: 'Zero Records Found',
            zeroDesc: 'Try adjusted filters or add a new stock entry.',
            deleteConfirm: 'Are you sure you want to delete this record?',
            modal: {
                adjust: 'Adjust Stock',
                register: 'Add Inventory',
                syncDesc: 'Synchronize levels for',
                newBatch: 'new batch',
                targetProduct: 'Product *',
                chooseListing: 'Select Product...',
                targetVariant: 'Variant',
                chooseVariant: 'Select Variant...',
                terminal: 'Warehouse *',
                selectNode: 'Select Warehouse...',
                count: 'Quantity *',
                discard: 'Discard',
                update: 'Update Stock',
                seal: 'Add Stock',
            },
        },
        hi: {
            eyebrow: 'वेयरहाउस कंट्रोल',
            pageTitle: 'इन्वेंट्री',
            pageDesc: 'रीयल-टाइम एनालिटिक्स और प्रेडिक्टिव ट्रैकिंग के साथ कई स्थानों पर स्टॉक स्तरों की निगरानी करें।',
            addStock: 'स्टॉक जोड़ें',
            stats: { live: 'लाइव इन्वेंट्री', active: 'सक्रिय उत्पाद', warehouses: 'वेयरहाउस', alerts: 'अलर्ट संकेत' },
            filters: { all: 'सभी', instock: 'स्टॉक में', low: 'कम स्टॉक', out: 'स्टॉक खत्म' },
            searchPlaceholder: 'उत्पाद का नाम, SKU या स्थान से खोजें...',
            table: { portfolio: 'उत्पाद', node: 'वेयरहाउस', availability: 'उपलब्धता', status: 'स्थिति', commands: 'क्रियाएं' },
            statusLabels: { instock: 'स्टॉक में', low: 'कम स्टॉक', out: 'स्टॉक खत्म' },
            units: 'यूनिट',
            noSku: 'NO-SKU',
            noWarehouse: 'अज्ञात',
            noProduct: 'शीर्षकहीन',
            syncing: 'डेटा लोड हो रहा है...',
            zeroTitle: 'कोई रिकॉर्ड नहीं मिला',
            zeroDesc: 'फ़िल्टर बदलें या नई स्टॉक प्रविष्टि जोड़ें।',
            deleteConfirm: 'क्या आप इस रिकॉर्ड को हटाना चाहते हैं?',
            modal: {
                adjust: 'स्टॉक समायोजित करें',
                register: 'इन्वेंट्री जोड़ें',
                syncDesc: 'स्तर सिंक्रनाइज़ करें',
                newBatch: 'नया बैच',
                targetProduct: 'उत्पाद *',
                chooseListing: 'उत्पाद चुनें...',
                targetVariant: 'वेरिएंट',
                chooseVariant: 'वेरिएंट चुनें...',
                terminal: 'वेयरहाउस *',
                selectNode: 'वेयरहाउस चुनें...',
                count: 'संख्या *',
                discard: 'रद्द करें',
                update: 'स्टॉक अपडेट करें',
                seal: 'स्टॉक जोड़ें',
            },
        },
        gu: {
            eyebrow: 'વેરહાઉસ કન્ટ્રોલ',
            pageTitle: 'ઇન્વેન્ટરી',
            pageDesc: 'રીઅલ-ટાઇમ એનાલિટિક્સ અને પ્રિડિક્ટિવ ટ્રેકિંગ સાથે બહુવિધ સ્થાનો પર સ્ટોક સ્તરનું નિરીક્ષણ કરો.',
            addStock: 'સ્ટોક ઉમેરો',
            stats: { live: 'લાઇવ ઇન્વેન્ટરી', active: 'સક્રિય ઉત્પાદનો', warehouses: 'વેરહાઉસ', alerts: 'એલર્ટ સિગ્નલ' },
            filters: { all: 'બધી', instock: 'સ્ટોકમાં છે', low: 'ઓછો સ્ટોક', out: 'સ્ટોક નથી' },
            searchPlaceholder: 'પ્રોડક્ટ નામ, SKU અથવા સ્થાન દ્વારા શોધો...',
            table: { portfolio: 'પ્રોડક્ટ', node: 'વેરહાઉસ', availability: 'ઉપલબ્ધતા', status: 'સ્થિતિ', commands: 'ક્રિયાઓ' },
            statusLabels: { instock: 'સ્ટોકમાં છે', low: 'ઓછો સ્ટોક', out: 'સ્ટોક નથી' },
            units: 'એકમ',
            noSku: 'NO-SKU',
            noWarehouse: 'અજ્ઞાત',
            noProduct: 'શીર્ષક વિનાનું',
            syncing: 'ડેટા લોડ થઈ રહ્યો છે...',
            zeroTitle: 'કોઈ રેકોર્ડ મળ્યો નહીં',
            zeroDesc: 'ફિલ્ટર બદલો અથવા નવી સ્ટોક એન્ટ્રી ઉમેરો.',
            deleteConfirm: 'શું તમે આ રેકોર્ડ કાઢી નાખવા માંગો છો?',
            modal: {
                adjust: 'સ્ટોક એડજસ્ટ કરો',
                register: 'ઇન્વેન્ટરી ઉમેરો',
                syncDesc: 'લેવલ સિંક્રનાઇઝ કરો',
                newBatch: 'નવી બેચ',
                targetProduct: 'પ્રોડક્ટ *',
                chooseListing: 'પ્રોડક્ટ પસંદ કરો...',
                targetVariant: 'વેરિયન્ટ',
                chooseVariant: 'વેરિયન્ટ પસંદ કરો...',
                terminal: 'વેરહાઉસ *',
                selectNode: 'વેરહાઉસ પસંદ કરો...',
                count: 'સંખ્યા *',
                discard: 'રદ કરો',
                update: 'સ્ટોક અપડેટ કરો',
                seal: 'સ્ટોક ઉમેરો',
            },
        },
    };

    const t = translations[language];

    // ─── TRANSLATION HELPER ───────────────
    const getTranslated = (obj, field = 'name', currentLang = language) => {
    if (!obj) return '';
    let val = obj[field];
    if (typeof val === 'string') {
        try {
            val = JSON.parse(val);
        } catch(e) {}
    }
    if (typeof val === 'object' && val !== null) {
        const v = val[currentLang] || val.en || val.hi || val.gu || Object.values(val)[0];
        return v !== undefined && v !== null ? v : '';
    }
    if (currentLang === 'hi' && obj[`${field}Hi`]) return obj[`${field}Hi`];
    if (currentLang === 'gu' && obj[`${field}Gu`]) return obj[`${field}Gu`];
    return typeof val === 'string' || typeof val === 'number' ? val : '';
  };

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === form.productId);
    }, [products, form.productId]);

    const variants = useMemo(() => {
        return selectedProduct?.variants || [];
    }, [selectedProduct]);

    // ─── FETCH DATA ────────────────────────────────────────────────
    const fetchInventory = async (currentPage = page, searchQuery = debouncedSearch, filter = statusFilter) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: searchQuery,
                statusFilter: filter
            });
            const res = await fetch(`/api/admin/inventory?${queryParams.toString()}`);
            const data = await res.json();
            
            setInventory(data?.data || []);
            if (data.pagination) setPagination(data.pagination);
            if (data.stats) setGlobalStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownData = async () => {
        if (products.length > 0 && warehouses.length > 0) return; // Prevent unnecessary refetches of giant lists
        try {
            const [productsRes, warehousesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/admin/warehouses'),
            ]);
            const productsData = await productsRes.json();
            const warehousesData = await warehousesRes.json();
            setProducts(productsData?.products || productsData?.data || []);
            setWarehouses(warehousesData?.data || []);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
        }
    };

    const fetchAllData = async () => {
        await Promise.all([fetchInventory(), fetchDropdownData()]);
    };

    // Initial load
    useEffect(() => { 
        fetchAllData(); 
    }, []);

    // Handle Page changes
    useEffect(() => {
        if (page > 1 || debouncedSearch || statusFilter !== 'all') { // Prevent double fetch on initial mount
           fetchInventory(page, debouncedSearch, statusFilter);
        }
    }, [page]);

    // Handle Status Filtering
    useEffect(() => {
        setPage(1);
        fetchInventory(1, debouncedSearch, statusFilter);
    }, [statusFilter]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            if (search !== '') { // Only fetch if user typed something
                setPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch when debounced search actually changes
    useEffect(() => {
        if (debouncedSearch !== '') {
            fetchInventory(1, debouncedSearch, statusFilter);
        } else if (page === 1) {
            fetchInventory(1, '', statusFilter); // fetch without search on clear
        }
    }, [debouncedSearch]);

    // ─── FILTER & SEARCH ───────────────────────────────────────────
    const filteredInventory = inventory; // Now using server-paginated list directly

    // ─── STATS ────────────────────────────────────────────────────
    const statsData = globalStats;

    const statsConfig = [
        { label: t.stats.live, value: statsData.totalQuantity || 0, icon: <Boxes /> },
        { label: t.stats.active, value: statsData.activeProducts || 0, icon: <Package /> },
        { label: t.stats.warehouses, value: statsData.totalWarehouses || 0, icon: <Warehouse /> },
        { label: t.stats.alerts, value: statsData.alerts || 0, icon: <AlertTriangle /> },
    ];

    // ─── MODAL ────────────────────────────────────────────────────
    const openAddModal = () => {
        fetchDropdownData(); // ensure we have products/warehouses loaded
        setEditingItem(null);
        setForm({ productId: '', variantId: '', warehouseId: '', quantity: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        fetchDropdownData(); // ensure we have products/warehouses loaded
        setEditingItem(item);
        setForm({ 
            productId: item.productId || '', 
            variantId: item.variantId || '',
            warehouseId: item.warehouseId || '', 
            quantity: item.quantity ?? '' 
        });
        setIsModalOpen(true);
    };

    const closeModal = () => { if (actionLoading) return; setIsModalOpen(false); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'productId') {
            setForm(prev => ({ ...prev, productId: value, variantId: '' }));
        } else {
            setForm(prev => ({ ...prev, [name]: name === 'quantity' ? value.replace(/[^0-9]/g, '') : value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.productId || !form.warehouseId || form.quantity === '') return;
        try {
            setActionLoading(true);
            const payload = { ...form, quantity: Number(form.quantity) };
            const url = editingItem ? `/api/admin/inventory/${editingItem.id}` : '/api/admin/inventory';
            const method = editingItem ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (res.ok) { await fetchAllData(); closeModal(); }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.deleteConfirm)) return;
        try {
            setActionLoading(true);
            const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchAllData();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // ─── BADGE HELPER ─────────────────────────────────────────────
    const getStockBadge = (qty) => {
        if (qty <= 0) return {
            label: t.statusLabels.out,
            color: 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]',
        };
        if (qty <= 10) return {
            label: t.statusLabels.low,
            color: 'bg-[#fff5ea] text-[#8a6116] border-[#f9ead3]',
        };
        return {
            label: t.statusLabels.instock,
            color: 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]',
        };
    };


    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#202223]">{t.pageTitle}</h1>
                        <p className="text-[#6d7175] text-sm mt-1">{t.pageDesc}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#6d7175] uppercase">Lang:</span>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white border border-[#c9cccf] rounded text-sm px-2 py-1.5 outline-none focus:border-[#008060] shadow-sm text-[#202223] cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="gu">ગુજરાતી</option>
                            </select>
                        </div>
                        <button
                            onClick={fetchAllData}
                            className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            {t.addStock}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsConfig.map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#6d7175] mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-[#202223]">{stat.value}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]">
                                {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
                    {/* Search & Tabs */}
                    <div className="p-3 border-b border-[#c9cccf] flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input 
                                type="text" 
                                placeholder={t.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-inner"
                            />
                        </div>

                        <div className="flex bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: t.filters.all },
                                { id: 'instock', label: t.filters.instock },
                                { id: 'low', label: t.filters.low },
                                { id: 'out', label: t.filters.out },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`px-4 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-all flex-1 md:flex-none ${
                                        statusFilter === tab.id
                                            ? 'bg-white text-[#202223] shadow-sm'
                                            : 'text-[#6d7175] hover:text-[#202223]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#008060]" />
                                <p className="text-sm">{t.syncing}</p>
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Boxes className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">{t.zeroTitle}</h3>
                                <p className="text-sm">{t.zeroDesc}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.portfolio}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.node}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.availability}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.status}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.commands}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {filteredInventory.map((item) => {
                                            const badge = getStockBadge(item.quantity);
                                            return (
                                                <tr key={item.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openEditModal(item)}>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                                <Package className="w-5 h-5 text-[#8c9196]" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[#202223]">{getTranslated(item?.product, 'name') || t.noProduct}</div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    {item.variant && (
                                                                        <div className="text-sm bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase border border-slate-200">
                                                                            {item.variant.title}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-sm font-bold text-[#6d7175] uppercase tracking-wider">
                                                                        {item.variant?.sku || item?.product?.sku || t.noSku}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-[#6d7175]">
                                                        <div className="flex items-center gap-2">
                                                            <Warehouse className="w-3.5 h-3.5 opacity-60" />
                                                            <span>{getTranslated(item?.warehouse, 'name') || t.noWarehouse}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-semibold text-[#202223]">
                                                        {item.quantity} <span className="text-sm font-medium text-[#6d7175] uppercase ml-0.5">{t.units}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1.5">
                                                            <button onClick={() => openEditModal(item)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Edit3 size={14} /></button>
                                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Trash2 size={14} /></button>
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

                    {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                            <p className="text-sm text-[#6d7175]">
                                Showing <span className="font-semibold text-[#202223]">{(page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${page === 1 ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                                >
                                    <ChevronRight size={16} className="rotate-180" />
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {[...Array(pagination.totalPages)].map((_, i) => {
                                        const pNum = i + 1;
                                        if (pNum === 1 || pNum === pagination.totalPages || (pNum >= page - 1 && pNum <= page + 1)) {
                                            return (
                                                <button
                                                    key={pNum}
                                                    onClick={() => setPage(pNum)}
                                                    className={`w-8 h-8 rounded border text-sm font-medium transition-all ${page === pNum ? 'bg-[#008060] text-white border-[#008060] shadow-sm' : 'bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f4f6f8]'}`}
                                                >
                                                    {pNum}
                                                </button>
                                            );
                                        }
                                        if (pNum === page - 2 || pNum === page + 2) {
                                            return <span key={pNum} className="text-[#6d7175]">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    disabled={page === pagination.totalPages}
                                    onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                    className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${page === pagination.totalPages ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal (Adjust/Add) */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white z-10 shrink-0">
                                    <h3 className="text-lg font-bold text-[#202223]">{editingItem ? t.modal.adjust : t.modal.register}</h3>
                                    <button onClick={closeModal} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <form onSubmit={handleSubmit} className="p-6 bg-[#f4f6f8]">
                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-[#202223] mb-1 block">{t.modal.targetProduct}</label>
                                            <select
                                                name="productId"
                                                value={form.productId}
                                                onChange={handleChange}
                                                disabled={!!editingItem}
                                                required
                                                className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer disabled:bg-[#fafbfb] disabled:text-[#6d7175]"
                                            >
                                                <option value="">{t.modal.chooseListing}</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {getTranslated(p, 'name') || t.noProduct}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {variants.length > 0 && (
                                            <div>
                                                <label className="text-sm font-semibold text-[#202223] mb-1 block">{t.modal.targetVariant}</label>
                                                <select
                                                    name="variantId"
                                                    value={form.variantId}
                                                    onChange={handleChange}
                                                    disabled={!!editingItem}
                                                    className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer disabled:bg-[#fafbfb] disabled:text-[#6d7175]"
                                                >
                                                    <option value="">{t.modal.chooseVariant}</option>
                                                    {variants.map(v => (
                                                        <option key={v.id} value={v.id}>
                                                            {v.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-sm font-semibold text-[#202223] mb-1 block">{t.modal.terminal}</label>
                                            <select
                                                name="warehouseId"
                                                value={form.warehouseId}
                                                onChange={handleChange}
                                                disabled={!!editingItem}
                                                required
                                                className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer disabled:bg-[#fafbfb] disabled:text-[#6d7175]"
                                            >
                                                <option value="">{t.modal.selectNode}</option>
                                                {warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>
                                                        {getTranslated(w, 'name') || t.noWarehouse}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-[#202223] mb-1 block">{t.modal.count}</label>
                                            <div className="flex items-center border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 focus-within:border-[#008060] bg-white text-sm text-[#202223]">
                                                <input
                                                    required
                                                    type="text"
                                                    name="quantity"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    value={form.quantity}
                                                    onChange={handleChange}
                                                    className="flex-1 outline-none w-full tabular-nums"
                                                />
                                                <span className="text-[#6d7175] font-medium ml-2 uppercase text-sm tracking-wider">{t.units}</span>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors"
                                    >
                                        {t.modal.discard}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={actionLoading}
                                        className="px-4 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[100px] justify-center"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? t.modal.update : t.modal.seal)}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </div>
    );
}