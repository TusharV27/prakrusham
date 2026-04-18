'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Search, Eye, Trash2, Plus, Filter, ChevronLeft, ChevronRight,
    Hash, Loader2, MapPinned, Navigation, Truck, Map, ArrowRight,
    Sparkles, Globe, X, Languages, CheckCircle2, XCircle, RefreshCw,
    LayoutGrid, LayoutList, ArrowLeft, Upload
} from 'lucide-react';
import AreaBulkUploadModal from '@/components/admin/AreaBulkUploadModal';

export default function AreasPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedArea, setSelectedArea] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [language, setLanguage] = useState('en');
    const [modalLanguage, setModalLanguage] = useState('en');

    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);

    // --- Pagination State ---
    const [globalStats, setGlobalStats] = useState({ totalReach: 0, activeZones: 0, avgLogistics: 0, statesCount: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const translations = {
        en: {
            pageTitle: 'Areas',
            pageDesc: 'Define delivery boundaries, logistics fees, and regional eligibility.',
            expandNetwork: 'Add Area',
            stats: { totalReach: 'Total Reach', activeZones: 'Active Zones', avgLogistics: 'Avg Logistics', globalMap: 'Coverage' },
            filter: { all: 'All areas', operational: 'Operational', suspended: 'Suspended' },
            searchPlaceholder: 'Search by city, region or pincode...',
            table: { area: 'Area Details', location: 'Location', financials: 'Financials', status: 'Status', commands: 'Actions' },
            status: { active: 'Active', inactive: 'Inactive' },
            modal: {
                networkHub: 'Add Delivery Area',
                hubDesc: 'Expand your operational reach by provisioning a new delivery node.',
                pincode: 'Pincode *',
                areaIdentity: 'Area Name *',
                city: 'City *',
                district: 'District',
                state: 'State *',
                logisticsFee: 'Delivery Charge (₹) *',
                orderFloor: 'Min Order Amount (₹) *',
                discard: 'Cancel',
                deployNode: 'Save Area',
                fetch: 'Fetch Details'
            },
            detail: { title: 'Area Dossier', close: 'Close' },
            errors: {
                required: 'Please fill all required fields.',
                pincode: 'Please enter a valid 6-digit pincode.',
                fetchFailed: 'Failed to fetch pincode details.',
                noPincodeData: 'No pincode data found.',
                addFailed: 'Failed to add area.',
            },
        },
        hi: {
            pageTitle: 'क्षेत्र',
            pageDesc: 'वितरण सीमाएं, रसद शुल्क और क्षेत्रीय पात्रता परिभाषित करें।',
            expandNetwork: 'क्षेत्र जोड़ें',
            stats: { totalReach: 'कुल पहुंच', activeZones: 'सक्रिय क्षेत्र', avgLogistics: 'औसत रसद', globalMap: 'कवरेज' },
            filter: { all: 'सभी क्षेत्र', operational: 'परिचालन', suspended: 'निलंबित' },
            searchPlaceholder: 'शहर, क्षेत्र या पिनकोड से खोजें...',
            table: { area: 'क्षेत्र विवरण', location: 'स्थान', financials: 'वित्तीय', status: 'स्थिति', commands: 'क्रियाएं' },
            status: { active: 'सक्रिय', inactive: 'निष्क्रिय' },
            modal: {
                networkHub: 'वितरण क्षेत्र जोड़ें',
                hubDesc: 'एक नया वितरण नोड बनाकर अपनी परिचालन पहुंच बढ़ाएं।',
                pincode: 'पिनकोड *',
                areaIdentity: 'क्षेत्र का नाम *',
                city: 'शहर *',
                district: 'ज़िला',
                state: 'राज्य *',
                logisticsFee: 'डिलीवरी शुल्क (₹) *',
                orderFloor: 'न्यूनतम ऑर्डर (₹) *',
                discard: 'रद्द करें',
                deployNode: 'क्षेत्र सहेजें',
                fetch: 'विवरण लाएं'
            },
            detail: { title: 'क्षेत्र डोजियर', close: 'बंद करें' },
            errors: {
                required: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
                pincode: 'कृपया सही 6-अंकों का पिनकोड दर्ज करें।',
                fetchFailed: 'पिनकोड जानकारी लाने में समस्या हुई।',
                noPincodeData: 'पिनकोड जानकारी नहीं मिली।',
                addFailed: 'क्षेत्र जोड़ने में समस्या हुई।',
            },
        },
        gu: {
            pageTitle: 'વિસ્તારો',
            pageDesc: 'ડિલિવરી સીમાઓ, લોજિસ્ટિક્સ ફી અને પ્રાદેશિક પાત્રતા વ્યાખ્યાયિત કરો.',
            expandNetwork: 'વિસ્તાર ઉમેરો',
            stats: { totalReach: 'કુલ પહોંચ', activeZones: 'સક્રિય ઝોન', avgLogistics: 'સરેરાશ લોજિસ્ટિક્સ', globalMap: 'કવરેજ' },
            filter: { all: 'બધા વિસ્તારો', operational: 'કાર્યરત', suspended: 'સ્થગિત' },
            searchPlaceholder: 'શહેર, વિસ્તાર અથવા પિનકોડથી શોધો...',
            table: { area: 'વિસ્તાર વિગત', location: 'સ્થાન', financials: 'નાણાકીય', status: 'સ્થિતિ', commands: 'ક્રિયાઓ' },
            status: { active: 'સક્રિય', inactive: 'નિષ્ક્રિય' },
            modal: {
                networkHub: 'ડિલિવરી વિસ્તાર ઉમેરો',
                hubDesc: 'નવું ડિલિવરી નોડ ઉમેરીને તમારી કામગીરીની પહોંચ વધારો.',
                pincode: 'પિનકોડ *',
                areaIdentity: 'વિસ્તારનું નામ *',
                city: 'શહેર *',
                district: 'જિલ્લો',
                state: 'રાજ્ય *',
                logisticsFee: 'ડિલિવરી ચાર્જ (₹) *',
                orderFloor: 'ન્યૂનતમ ઓર્ડર (₹) *',
                discard: 'રદ કરો',
                deployNode: 'વિસ્તાર સાચવો',
                fetch: 'વિગત મેળવો'
            },
            detail: { title: 'વિસ્તાર ડોઝિયર', close: 'બંધ કરો' },
            errors: {
                required: 'કૃપા કરીને બધી જરૂરી ફીલ્ડ ભરો.',
                pincode: 'કૃપા કરીને માન્ય 6 અંકનો પિનકોડ દાખલ કરો.',
                fetchFailed: 'પિનકોડ વિગતો લાવવામાં સમસ્યા આવી.',
                noPincodeData: 'પિનકોડ માહિતી મળી નથી.',
                addFailed: 'વિસ્તાર ઉમેરવામાં સમસ્યા આવી.',
            },
        },
    };

    const t = translations[language];

    const [newArea, setNewArea] = useState({
        areaName: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        deliveryCharge: '',
        minOrderAmount: '',
        status: 'active',
    });

    useEffect(() => {
        fetchAreas(currentPage, debouncedSearch, statusFilter);
    }, [currentPage, debouncedSearch, statusFilter]);

    // Handle Status Filtering
    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setCurrentPage(1);
    };

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            if (searchTerm !== '') setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getTranslated = (field, lang = language) => {
    if (!field) return "";
    let parsed = field;
    if (typeof field === "string") {
      try {
        parsed = JSON.parse(field);
      } catch (e) {
        return field;
      }
    }
    if (typeof parsed === "object" && parsed !== null) {
      const v = parsed[lang] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
      return v !== undefined && v !== null ? v : "";
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : "";
  };

    const fetchAreas = async (page = currentPage, query = debouncedSearch, filter = statusFilter) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: query,
                statusFilter: filter
            });
            const res = await fetch(`/api/admin/areas?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setAreas(data.data || []);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error('Fetch areas error:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentAreas = areas; // Now using server-paginated data directly

    const statsData = globalStats;

    const statsConfig = [
        { label: t.stats.totalReach, value: statsData.totalReach || 0, icon: <Navigation /> },
        { label: t.stats.activeZones, value: statsData.activeZones || 0, icon: <MapPinned /> },
        { label: t.stats.avgLogistics, value: `₹${(statsData.avgLogistics || 0).toFixed(0)}`, icon: <Truck /> },
        { label: t.stats.globalMap, value: `${statsData.statesCount || 0} States`, icon: <Globe /> },
    ];

    const fetchPincodeData = async () => {
        if (!/^\d{6}$/.test(newArea.pincode)) { alert(t.errors.pincode); return; }
        try {
            setFetchingPincode(true);
            const res = await fetch(`https://api.postalpincode.in/pincode/${newArea.pincode}`);
            const data = await res.json();
            if (data?.[0]?.Status === 'Success' && data?.[0]?.PostOffice?.length > 0) {
                const office = data[0].PostOffice[0];
                setNewArea((prev) => ({
                    ...prev,
                    city: office?.District || prev.city,
                    district: office?.District || prev.district,
                    state: office?.State || prev.state,
                    areaName: office?.Name || prev.areaName,
                }));
            } else { alert(t.errors.noPincodeData); }
        } catch (error) { alert(t.errors.fetchFailed); } finally { setFetchingPincode(false); }
    };

    const handleAddArea = async (e) => {
        e.preventDefault();
        if (!newArea.areaName || !newArea.city || !newArea.state || !newArea.pincode || newArea.deliveryCharge === '' || newArea.minOrderAmount === '') {
            alert(t.errors.required); return;
        }
        try {
            setSubmitting(true);
            const res = await fetch('/api/admin/areas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newArea),
            });
            const data = await res.json();
            if (data.success) { setShowAddModal(false); resetForm(); fetchAreas(); } else { alert(data.message || t.errors.addFailed); }
        } catch (error) { alert(t.errors.addFailed); } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.deleteConfirm)) return;
        try { await fetch(`/api/admin/areas/${id}`, { method: 'DELETE' }); fetchAreas(); } catch (error) { console.error(error); }
    };

    const resetForm = () => setNewArea({ areaName: '', city: '', district: '', state: '', pincode: '', deliveryCharge: '', minOrderAmount: '', status: 'active' });

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
                            onClick={fetchAreas}
                            className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setShowBulkModal(true)}
                                className="flex items-center gap-2 bg-white text-[#202223] border border-[#c9cccf] px-3 py-1.5 rounded-md font-medium text-sm hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap"
                            >
                                <Upload className="w-4 h-4" />
                                Bulk Upload
                            </button>
                            <button 
                                onClick={() => { resetForm(); setShowAddModal(true); }}
                                className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                {t.expandNetwork}
                            </button>
                        </div>
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-inner"
                            />
                        </div>

                        <div className="flex bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: t.filter.all },
                                { id: 'active', label: t.filter.operational },
                                { id: 'inactive', label: t.filter.suspended },
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
                                <p className="text-sm">Accessing Hub...</p>
                            </div>
                        ) : areas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <MapPin className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Zones Found</h3>
                                <p className="text-sm">Adjust filters or provision a new area.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.area}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.location}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.financials}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.status}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.commands}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {currentAreas.map((area) => (
                                            <tr key={area.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => setSelectedArea(area)}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                            <MapPin className="w-5 h-5 text-[#8c9196]" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-[#202223]">{getTranslated(area.areaName)}</div>
                                                            <div className="text-sm font-bold text-[#6d7175] uppercase mt-0.5 tracking-wider">PIN: {area.pincode}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-[#6d7175]">
                                                    <div className="flex flex-col">
                                                        <span>{getTranslated(area.city)}</span>
                                                        <span className="text-sm uppercase font-bold opacity-60">{getTranslated(area.state)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-col text-[#202223]">
                                                        <span className="font-semibold">₹{area.deliveryCharge} <span className="text-sm text-[#6d7175] font-medium uppercase">Charge</span></span>
                                                        <span className="text-sm text-[#6d7175] font-medium uppercase tracking-tight">Min Order: ₹{area.minOrderAmount}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${area.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'}`}>
                                                        {area.status === 'active' ? t.status.active : t.status.inactive}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5">
                                                        <button onClick={() => setSelectedArea(area)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Eye size={14} /></button>
                                                        <button onClick={() => handleDelete(area.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Trash2 size={14} /></button>
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
                                Showing <span className="font-semibold text-[#202223]">{(currentPage - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${currentPage === 1 ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                                >
                                    <ChevronRight size={16} className="rotate-180" />
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(pagination.totalPages)].map((_, i) => {
                                        const pNum = i + 1;
                                        if (pNum === 1 || pNum === pagination.totalPages || (pNum >= currentPage - 1 && pNum <= currentPage + 1)) {
                                            return (
                                                <button
                                                    key={pNum}
                                                    onClick={() => setCurrentPage(pNum)}
                                                    className={`w-8 h-8 rounded border text-sm font-medium transition-all ${currentPage === pNum ? 'bg-[#008060] text-white border-[#008060] shadow-sm' : 'bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f4f6f8]'}`}
                                                >
                                                    {pNum}
                                                </button>
                                            );
                                        }
                                        if (pNum === currentPage - 2 || pNum === currentPage + 2) {
                                            return <span key={pNum} className="text-[#6d7175]">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages}
                                    className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${currentPage === pagination.totalPages ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Area Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white z-10 shrink-0">
                                    <h3 className="text-lg font-bold text-[#202223]">{t.modal.networkHub}</h3>
                                    <button onClick={() => setShowAddModal(false)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                                    <form id="areaForm" onSubmit={handleAddArea} className="p-6 bg-[#f4f6f8] space-y-6">
                                        {/* Pincode Section */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <div className="flex items-center justify-between border-b border-[#f4f6f8] pb-2">
                                                <h4 className="text-sm font-semibold text-[#202223]">Portal Access</h4>
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#008060] bg-[#aee9d1] px-1.5 py-0.5 rounded uppercase">Logic Assisted</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs font-semibold text-[#6d7175] mb-1 block uppercase tracking-wide">{t.modal.pincode}</label>
                                                    <input required type="text" maxLength={6} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" 
                                                        value={newArea.pincode} 
                                                        onChange={(e) => setNewArea({...newArea, pincode: e.target.value.replace(/\D/g, '')})} 
                                                        placeholder="000000"
                                                    />
                                                </div>
                                                <button type="button" onClick={fetchPincodeData} disabled={fetchingPincode} className="self-end h-[34px] px-3 rounded bg-[#202223] text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center gap-2">
                                                    {fetchingPincode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                                    {t.modal.fetch}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mapping Section */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <h4 className="text-sm font-semibold text-[#202223] border-b border-[#f4f6f8] pb-2">Area Mapping</h4>
                                            <div>
                                                <label className="text-xs font-semibold text-[#6d7175] mb-1 block uppercase tracking-wide">{t.modal.areaIdentity}</label>
                                                <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" 
                                                    value={newArea.areaName} onChange={e => setNewArea({...newArea, areaName: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-[#6d7175] mb-1 block uppercase tracking-wide">{t.modal.city}</label>
                                                    <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" 
                                                        value={newArea.city} onChange={e => setNewArea({...newArea, city: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-[#6d7175] mb-1 block uppercase tracking-wide">{t.modal.state}</label>
                                                    <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" 
                                                        value={newArea.state} onChange={e => setNewArea({...newArea, state: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financials Section */}
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                            <h4 className="text-sm font-semibold text-[#202223] border-b border-[#f4f6f8] pb-2">Financial Setup</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-semibold text-[#6d7175] mb-1 block uppercase tracking-wide">{t.modal.logisticsFee}</label>
                                                    <div className="flex items-center border border-[#c9cccf] shadow-inner rounded-md px-2 py-1.5 focus-within:border-[#008060] bg-white text-sm text-[#202223]">
                                                        <span className="text-[#6d7175] mr-1 italic">₹</span>
                                                        <input required type="number" step="1" value={newArea.deliveryCharge} onChange={e => setNewArea({...newArea, deliveryCharge: e.target.value})} className="flex-1 outline-none w-full tabular-nums" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-[#6d7175] mb-1 block uppercase tracking-wide">{t.modal.orderFloor}</label>
                                                    <div className="flex items-center border border-[#c9cccf] shadow-inner rounded-md px-2 py-1.5 focus-within:border-[#008060] bg-white text-sm text-[#202223]">
                                                        <span className="text-[#6d7175] mr-1 italic">₹</span>
                                                        <input required type="number" step="1" value={newArea.minOrderAmount} onChange={e => setNewArea({...newArea, minOrderAmount: e.target.value})} className="flex-1 outline-none w-full tabular-nums" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.modal.discard}</button>
                                    <button type="submit" form="areaForm" disabled={submitting} className="px-5 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[120px] justify-center">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.modal.deployNode}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <AreaBulkUploadModal
                    isOpen={showBulkModal}
                    onClose={() => setShowBulkModal(false)}
                    onUploadSuccess={() => { setShowBulkModal(false); fetchAreas(); }}
                />

                {/* View Details Modal */}
                <AnimatePresence>
                    {selectedArea && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedArea(null)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white z-10 shrink-0">
                                    <h3 className="text-lg font-bold text-[#202223]">{t.detail.title}</h3>
                                    <button onClick={() => setSelectedArea(null)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="p-6 bg-[#f4f6f8] space-y-4">
                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-3">
                                        <div className="flex justify-between border-b border-[#f4f6f8] pb-1.5">
                                            <span className="text-xs font-bold text-[#6d7175] uppercase tracking-wide">Identifier</span>
                                            <span className="text-sm font-semibold text-[#202223]">{getTranslated(selectedArea.areaName)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#f4f6f8] pb-1.5">
                                            <span className="text-xs font-bold text-[#6d7175] uppercase tracking-wide">Metropolis</span>
                                            <span className="text-sm font-semibold text-[#202223]">{getTranslated(selectedArea.city)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#f4f6f8] pb-1.5">
                                            <span className="text-xs font-bold text-[#6d7175] uppercase tracking-wide">State Node</span>
                                            <span className="text-sm font-semibold text-[#202223]">{getTranslated(selectedArea.state)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#f4f6f8] pb-1.5">
                                            <span className="text-xs font-bold text-[#6d7175] uppercase tracking-wide">Pincode Vector</span>
                                            <span className="text-sm font-semibold font-mono text-[#202223]">{selectedArea.pincode}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm text-center">
                                            <p className="text-sm font-bold text-[#6d7175] uppercase mb-1">Fee</p>
                                            <p className="text-lg font-bold text-[#202223]">₹{selectedArea.deliveryCharge}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm text-center">
                                            <p className="text-sm font-bold text-[#6d7175] uppercase mb-1">Floor</p>
                                            <p className="text-lg font-bold text-[#202223]">₹{selectedArea.minOrderAmount}</p>
                                        </div>
                                    </div>

                                    <div className={`p-3 rounded-lg border text-center font-bold text-xs uppercase tracking-widest ${selectedArea.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'}`}>
                                        Status: {selectedArea.status === 'active' ? t.filter.operational : t.filter.suspended}
                                    </div>
                                </div>

                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white">
                                    <button onClick={() => setSelectedArea(null)} className="w-full sm:w-auto px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.detail.close}</button>
                                    <button 
                                        onClick={() => updateAreaStatusHelper(selectedArea, selectedArea.status === 'active' ? 'inactive' : 'active', setSelectedArea, fetchAreas)}
                                        className="w-full sm:w-auto px-5 py-1.5 rounded-md bg-[#202223] text-white text-sm font-medium hover:bg-slate-800 shadow-sm transition-colors whitespace-nowrap"
                                    >
                                        {selectedArea.status === 'active' ? 'Suspend Area' : 'Restore Area'}
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

async function updateAreaStatusHelper(area, newStatus, setSelectedArea, fetchAreas) {
    try {
        const res = await fetch(`/api/admin/areas/${area.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) { setSelectedArea(null); fetchAreas(); }
    } catch (error) { console.error('Update status error:', error); }
}