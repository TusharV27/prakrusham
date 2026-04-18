'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit3, Trash2, X, Warehouse as WarehouseIcon,
    MapPin, Navigation, Building2, Save, RefreshCw, Loader2,
    Boxes, ArrowRight, Map, Languages, LayoutGrid, LayoutList,
    ChevronLeft, ChevronRight, Tag
} from 'lucide-react';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function WarehousesManagementPage() {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [language, setLanguage] = useState('en');

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ total: 0, regions: 0, pins: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ─── TRANSLATIONS ─────────────────────────────────────────────
    const translations = {
        en: {
            pageTitle: 'Warehouses',
            pageDesc: 'Manage your distribution centers and strategic storage locations across the country.',
            addWarehouse: 'Add Warehouse',
            searchPlaceholder: 'Search by center name, pincode or location...',
            postalCode: 'Postal Code',
            stats: { total: 'Total Hubs', regions: 'Active Regions', reach: 'PIN Reach', active: 'Live Nodes' },
            table: { hub: 'Distribution Hub', location: 'Region', pincode: 'Pincode', address: 'Address', actions: 'Actions' },
            modal: {
                updateTitle: 'Update Hub',
                newTitle: 'New Hub',
                subtitle: 'Warehouse Node Configuration',
                name: 'Center Name *',
                region: 'Region *',
                pincode: 'Pincode *',
                address: 'Physical Address',
                deploy: 'Save Node',
                discard: 'Cancel'
            },
        },
        hi: {
            pageTitle: 'वेयरहाउस',
            pageDesc: 'देश भर में अपने वितरण केंद्रों और रणनीतिक भंडारण स्थानों का प्रबंधन करें।',
            addWarehouse: 'वेयरहाउस जोड़ें',
            searchPlaceholder: 'केंद्र का नाम, पिनकोड या स्थान से खोजें...',
            postalCode: 'पिनकोड',
            stats: { total: 'कुल हब', regions: 'सक्रिय क्षेत्र', reach: 'पिन पहुंच', active: 'लाइव नोड्स' },
            table: { hub: 'वितरण हब', location: 'क्षेत्र', pincode: 'पिनकोड', address: 'पता', actions: 'क्रियाएं' },
            modal: {
                updateTitle: 'हब अपडेट करें',
                newTitle: 'नया हब',
                subtitle: 'वेयरहाउस नोड कॉन्फ़िगरेशन',
                name: 'केंद्र का नाम *',
                region: 'क्षेत्र *',
                pincode: 'पिनकोड *',
                address: 'पता',
                deploy: 'नोड सहेजें',
                discard: 'रद्द करें'
            },
        },
        gu: {
            pageTitle: 'વેરહાઉસ',
            pageDesc: 'દેશભરમાં તમારા વિતરણ કેન્દ્રો અને વ્યૂહાત્મક સ્ટોરેજ સ્થાનો મેનેજ કરો.',
            addWarehouse: 'વેરહાઉસ ઉમેરો',
            searchPlaceholder: 'કેન્દ્રનું નામ, પિનકોડ અથવા સ્થાન દ્વારા શોધો...',
            postalCode: 'પિનકોડ',
            stats: { total: 'કુલ હબ', regions: 'સક્રિય પ્રદેશો', reach: 'પિન પહોંચ', active: 'લાઇવ નોડ્સ' },
            table: { hub: 'વિતરણ હબ', location: 'પ્રદેશ', pincode: 'પિનકોડ', address: 'સરનામું', actions: 'ક્રિયાઓ' },
            modal: {
                updateTitle: 'હબ અપડેટ કરો',
                newTitle: 'નવું હબ',
                subtitle: 'વેરહાઉસ નોડ કોન્ફિગરેશન',
                name: 'કેન્દ્રનું નામ *',
                region: 'પ્રદેશ *',
                pincode: 'પિનકોડ *',
                address: 'સરનામું',
                deploy: 'નોડ સાચવો',
                discard: 'રદ કરો'
            },
        }
    };

    const t = translations[language];

    const [form, setForm] = useState({
        name: '', nameHi: '', nameGu: '',
        locationName: '', locationNameHi: '', locationNameGu: '',
        pincode: '',
        address: '', addressHi: '', addressGu: '',
        metafields: []
    });

    const fetchWarehouses = async (currentPage = page, query = debouncedSearch) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: query
            });
            const res = await fetch(`/api/admin/warehouses?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setWarehouses(data?.data || []);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWarehouses(page, debouncedSearch); }, [page]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            if (search !== '') setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== '') {
            fetchWarehouses(1, debouncedSearch);
        } else if (page === 1) {
            fetchWarehouses(1, '');
        }
    }, [debouncedSearch]);

    const filteredWarehouses = warehouses;

    const statsData = globalStats;

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setForm({
                name: item.name || '', nameHi: item.nameHi || '', nameGu: item.nameGu || '',
                locationName: item.locationName || '', locationNameHi: item.locationNameHi || '', locationNameGu: item.locationNameGu || '',
                pincode: item.pincode || '',
                address: item.address || '', addressHi: item.addressHi || '', addressGu: item.addressGu || '',
                metafields: item.metafields || []
            });
        } else {
            setEditingItem(null);
            setForm({
                name: '', nameHi: '', nameGu: '',
                locationName: '', locationNameHi: '', locationNameGu: '',
                pincode: '',
                address: '', addressHi: '', addressGu: '',
                metafields: []
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this warehouse node?')) return;
        try {
            setActionLoading(true);
            const res = await fetch(`/api/admin/warehouses/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchWarehouses();
        } catch (error) { console.error(error); } finally { setActionLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            const url = editingItem ? `/api/admin/warehouses/${editingItem.id}` : '/api/admin/warehouses';
            const method = editingItem ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            if (res.ok) { await fetchWarehouses(); setIsModalOpen(false); }
        } catch (error) { console.error(error); } finally { setActionLoading(false); }
    };

    const getName = (w) => {
        if (!w) return '';
        if (language === 'hi') return w.nameHi || w.name;
        if (language === 'gu') return w.nameGu || w.name;
        return w.name;
    };

    const getLocation = (w) => {
        if (!w) return '';
        if (language === 'hi') return w.locationNameHi || w.locationName;
        if (language === 'gu') return w.locationNameGu || w.locationName;
        return w.locationName;
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
                            onClick={fetchWarehouses}
                            className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            {t.addWarehouse}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.total}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.total}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Building2 className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.regions}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.regions}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Map className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.reach}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.pins}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><MapPin className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.active}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.total}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Navigation className="w-6 h-6" /></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-[#c9cccf]">
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
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#008060]" />
                                <p className="text-sm">Mapping Network...</p>
                            </div>
                        ) : warehouses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <WarehouseIcon className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Hubs Registered</h3>
                                <p className="text-sm">Add your first distribution node to begin.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.hub}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.location}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.pincode}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {filteredWarehouses.map((w) => (
                                            <tr key={w.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openModal(w)}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                            <WarehouseIcon className="w-5 h-5 text-[#8c9196]" />
                                                        </div>
                                                        <div className="font-semibold text-[#202223]">{getName(w)}</div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-[#6d7175]">{getLocation(w)}</td>
                                                <td className="px-5 py-3 font-mono text-[#202223]">{w.pincode}</td>
                                                <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5">
                                                        <button onClick={() => openModal(w)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDelete(w.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                            <p className="text-sm text-[#6d7175]">
                                Showing <span className="font-semibold text-[#202223]">{(page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
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
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${page === pagination.totalPages ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white shrink-0">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#202223]">{editingItem ? t.modal.updateTitle : t.modal.newTitle}</h3>
                                        <p className="text-xs text-[#6d7175]">{t.modal.subtitle}</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="p-6 bg-[#f4f6f8] overflow-y-auto custom-scrollbar">
                                    <form id="warehouseForm" onSubmit={handleSubmit} className="space-y-6">
                                        {/* Identification */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <h4 className="text-xs font-bold text-[#6d7175] uppercase tracking-wider border-b border-[#f4f6f8] pb-2">Center Identification</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">Name (English) *</label>
                                                    <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">नाम (हिंदी)</label>
                                                    <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.nameHi} onChange={e => setForm({...form, nameHi: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">નામ (ગુજરાતી)</label>
                                                    <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.nameGu} onChange={e => setForm({...form, nameGu: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Regional mapping */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <h4 className="text-xs font-bold text-[#6d7175] uppercase tracking-wider border-b border-[#f4f6f8] pb-2">Regional Mapping</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">Region (English) *</label>
                                                    <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.locationName} onChange={e => setForm({...form, locationName: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">क्षेत्र (हिंदी)</label>
                                                    <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.locationNameHi} onChange={e => setForm({...form, locationNameHi: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">પ્રદેશ (ગુજરાતી)</label>
                                                    <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.locationNameGu} onChange={e => setForm({...form, locationNameGu: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="max-w-[200px]">
                                                <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">Pincode *</label>
                                                <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} />
                                            </div>
                                        </div>

                                        {/* Physical Address */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <h4 className="text-xs font-bold text-[#6d7175] uppercase tracking-wider border-b border-[#f4f6f8] pb-2">Physical Address Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">Address (English)</label>
                                                    <textarea rows="3" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060] resize-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">पता (हिंदी)</label>
                                                    <textarea rows="3" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060] resize-none" value={form.addressHi} onChange={e => setForm({...form, addressHi: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-[#6d7175] mb-1 block uppercase tracking-wide">સરનામું (ગુજરાતી)</label>
                                                    <textarea rows="3" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060] resize-none" value={form.addressGu} onChange={e => setForm({...form, addressGu: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metafields Section */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                                                <Tag size={16} className="text-[#008060]" />
                                                <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Warehouse Metafields</h4>
                                            </div>
                                            
                                            <MetafieldValueEditor 
                                                ownerType="WAREHOUSES"
                                                value={form.metafields}
                                                onChange={(newMetafields) => setForm(prev => ({ ...prev, metafields: newMetafields }))}
                                            />
                                        </div>
                                    </form>
                                </div>

                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.modal.discard}</button>
                                    <button type="submit" form="warehouseForm" disabled={actionLoading} className="px-5 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[120px] justify-center">
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.modal.deploy}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8c9196; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </div>
        </div>
    );
}
