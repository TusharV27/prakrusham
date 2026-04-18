'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Eye, Edit3, Trash2, Store, User, Phone, Mail, 
    CheckCircle2, XCircle, X, Lock, Image as ImageIcon, Percent, 
    Globe, Loader2, ArrowUpRight, Building2, ShieldCheck, Briefcase, 
    ChevronRight, Sparkles, LayoutGrid, LayoutList, Languages, 
    UploadCloud, Save, ArrowLeft, MapPin, Tag
} from 'lucide-react';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function VendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [language, setLanguage] = useState('en');
    const [modalLanguage, setModalLanguage] = useState('en');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ globalTotal: 0, activePartners: 0, avgCommission: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [form, setForm] = useState({
        businessName: '', businessNameHi: '', businessNameGu: '',
        businessSlug: '',
        name: '', nameHi: '', nameGu: '',
        description: '', descriptionHi: '', descriptionGu: '',
        serviceArea: '', serviceAreaHi: '', serviceAreaGu: '',
        email: '', password: '', phone: '', commissionRate: '',
        status: 'active', address: '',
        logo: null, logoPreview: null,
        metafields: []
    });

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

    const translations = {
        en: {
            pageTitle: 'Vendors',
            pageDesc: 'Coordinate with retail partners, regional distributors, and store entities.',
            onboardVendor: 'Add Vendor',
            editVendor: 'Edit Vendor',
            stats: {
                active: 'Active Partners',
                presence: 'Market Presence',
                commission: 'Avg Commission',
                verified: 'Total Verified'
            },
            searchPlaceholder: 'Search by registered name, business ID or location...',
            table: {
                portfolio: 'Business Portfolio',
                governance: 'Governance',
                nodeStatus: 'Node Status',
                interface: 'Interface'
            },
            status: {
                active: 'Active',
                inactive: 'Inactive'
            },
            form: {
                business: 'Business Intelligence',
                person: 'Principal Contact',
                businessName: 'Business Name (en) *',
                businessNameHi: 'Business Name (hi)',
                businessNameGu: 'Business Name (gu)',
                principal: 'Principal Name (en) *',
                principalHi: 'Principal Name (hi)',
                principalGu: 'Principal Name (gu)',
                email: 'Corporate Email',
                phone: 'Contact Number *',
                commission: 'Commission Rate (%) *',
                area: 'Service Operation Area',
                address: 'Physical Headquarters',
                logo: 'Brand Identity',
                cancel: 'Discard',
                onboard: 'Save Vendor',
                update: 'Update Alliance'
            },
            actions: {
                analytics: 'Analytics'
            }
        },
        hi: {
            pageTitle: 'विक्रेता',
            pageDesc: 'खुदरा भागीदारों, क्षेत्रीय वितरकों और स्टोर संस्थाओं के साथ समन्वय करें।',
            onboardVendor: 'विक्रेता जोड़ें',
            editVendor: 'विक्रेता संपादित करें',
            stats: {
                active: 'सक्रिय भागीदार',
                presence: 'बाजार उपस्थिति',
                commission: 'औसत कमीशन',
                verified: 'कुल सत्यापित'
            },
            searchPlaceholder: 'पंजीकृत नाम, व्यवसाय आईडी या स्थान से खोजें...',
            table: {
                portfolio: 'व्यवसाय पोर्टफोलियो',
                governance: 'शासन',
                nodeStatus: 'नोड स्थिति',
                interface: 'इंटरफ़ेस'
            },
            status: {
                active: 'सक्रिय',
                inactive: 'निष्क्रिय'
            },
            form: {
                business: 'व्यवसाय जानकारी',
                person: 'मुख्य संपर्क',
                businessName: 'व्यवसाय का नाम (en) *',
                businessNameHi: 'व्यवसाय का नाम (hi)',
                businessNameGu: 'व्यवसाय का नाम (gu)',
                principal: 'मुख्य व्यक्ति का नाम (en) *',
                principalHi: 'मुख्य व्यक्ति का नाम (hi)',
                principalGu: 'मुख्य व्यक्ति का नाम (gu)',
                email: 'कॉर्पोरेट ईमेल',
                phone: 'संपर्क नंबर *',
                commission: 'कमीशन दर (%) *',
                area: 'सेवा संचालन क्षेत्र',
                address: 'भौतिक मुख्यालय',
                logo: 'ब्रांड पहचान',
                cancel: 'रद्द करें',
                onboard: 'गठबंधन अंतिम रूप दें',
                update: 'गठबंधन अपडेट करें'
            },
            actions: {
                analytics: 'विश्लेषण'
            }
        },
        gu: {
            pageTitle: 'વેન્ડર',
            pageDesc: 'રિટેલ ભાગીદારો, પ્રાદેશિક વિતરકો અને સ્ટોર એકમો સાથે સંકલન કરો.',
            onboardVendor: 'વેન્ડર ઉમેરો',
            editVendor: 'વેન્ડર સંપાદિત કરો',
            stats: {
                active: 'સક્રિય ભાગીદારો',
                presence: 'બજાર હાજરી',
                commission: 'સરેરાશ કમિશન',
                verified: 'કુલ વેરિફાઇડ'
            },
            searchPlaceholder: 'રજિસ્ટર્ડ નામ, વ્યવસાય આઈડી અથવા સ્થાન દ્વારા શોધો...',
            table: {
                portfolio: 'બિઝનેસ પોર્ટફોલિયો',
                governance: 'ગવર્નન્સ',
                nodeStatus: 'નોડ સ્થિતિ',
                interface: 'ઇન્ટરફેસ'
            },
            status: {
                active: 'સક્રિય',
                inactive: 'નિષ્ક્રિય'
            },
            form: {
                business: 'વ્યવસાય માહિતી',
                person: 'મુખ્ય સંપર્ક',
                businessName: 'વ્યવસાયનું નામ (en) *',
                businessNameHi: 'વ્યવસાયનું નામ (hi)',
                businessNameGu: 'વ્યવસાયનું નામ (gu)',
                principal: 'મુખ્ય વ્યક્તિનું નામ (en) *',
                principalHi: 'મુખ્ય વ્યક્તિનું નામ (hi)',
                principalGu: 'મુખ્ય વ્યક્તિનું નામ (gu)',
                email: 'કોર્પોરેટ ઈમેલ',
                phone: 'સંપર્ક નંબર *',
                commission: 'કમીશન દર (%) *',
                area: 'સેવા સંચાલન ક્ષેત્ર',
                address: 'મુખ્ય મથક',
                logo: 'બ્રાન્ડ ઓળખ',
                cancel: 'રદ કરો',
                onboard: 'ગઠબંધન નક્કી કરો',
                update: 'ગઠબંધન અપડેટ કરો'
            },
            actions: {
                analytics: 'વિશ્લેષણ'
            }
        }
    };

    const t = translations[language];

    useEffect(() => {
        fetchVendors(page, debouncedSearch);
    }, [page]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch when debounced search actually changes
    useEffect(() => {
        fetchVendors(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchVendors = async (currentPage = page, searchQuery = debouncedSearch) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: searchQuery
            });
            const res = await fetch(`/api/vendors?${queryParams.toString()}`);
            const data = await res.json();

            let list = [];
            if (Array.isArray(data)) list = data;
            else if (data?.vendors && Array.isArray(data.vendors)) list = data.vendors;
            else if (data?.data && Array.isArray(data.data)) list = data.data;

            setVendors(list);
            if (data.pagination) setPagination(data.pagination);
            if (data.stats) setGlobalStats(data.stats);
        } catch (error) {
            console.error('Fetch error:', error);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            businessName: '', businessNameHi: '', businessNameGu: '',
            businessSlug: '',
            name: '', nameHi: '', nameGu: '',
            description: '', descriptionHi: '', descriptionGu: '',
            serviceArea: '', serviceAreaHi: '', serviceAreaGu: '',
            email: '', password: '', phone: '', commissionRate: '',
            status: 'active', address: '',
            logo: null, logoPreview: null,
            metafields: []
        });
        setSubmitting(false);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(prev => ({
                ...prev,
                logo: file,
                logoPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.businessName || !form.name || !form.phone || !form.commissionRate) {
            alert('Please fill required fields');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'logo' && form.logo instanceof File) {
                    formData.append('logo', form.logo);
                } else if (key === 'metafields') {
                    formData.append('metafields', JSON.stringify(form.metafields));
                } else if (key !== 'logoPreview' && key !== 'logo') {
                    formData.append(key, form[key]);
                }
            });

            const url = showEditModal ? `/api/vendors/${selectedVendor.id}` : '/api/vendors';
            const method = showEditModal ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: formData });
            const result = await res.json();

            if (result.success) {
                fetchVendors();
                setShowAddModal(false);
                setShowEditModal(false);
                resetForm();
            } else {
                alert(result.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (vendor) => {
        setSelectedVendor(vendor);
        setForm({
            businessName: String(vendor.businessName?.en || vendor.businessName || ''),
            businessNameHi: String(vendor.businessName?.hi || ''),
            businessNameGu: String(vendor.businessName?.gu || ''),
            businessSlug: String(vendor.businessSlug || ''),
            name: String(vendor.name?.en || vendor.name || ''),
            nameHi: String(vendor.name?.hi || ''),
            nameGu: String(vendor.name?.gu || ''),
            description: String(vendor.description?.en || vendor.description || ''),
            descriptionHi: String(vendor.description?.hi || ''),
            descriptionGu: String(vendor.description?.gu || ''),
            serviceArea: String(vendor.serviceArea?.en || vendor.serviceArea || ''),
            serviceAreaHi: String(vendor.serviceArea?.hi || ''),
            serviceAreaGu: String(vendor.serviceArea?.gu || ''),
            email: String(vendor.email || ''),
            password: '',
            phone: String(vendor.phone || ''),
            commissionRate: vendor.commissionRate || '',
            status: vendor.status || 'active',
            address: String(vendor.address || ''),
            logo: vendor.logo || null,
            logoPreview: vendor.logo || null,
            metafields: vendor.metafields || []
        });
        setModalLanguage('en');
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this vendor alliance?')) return;
        try {
            await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
            fetchVendors();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredVendors = vendors; 

    const statsData = globalStats;

    const statsConfig = [
        { label: t.stats.active, value: statsData.activePartners || 0, icon: <ShieldCheck /> },
        { label: t.stats.presence, value: '4 States', icon: <Globe /> },
        { label: t.stats.commission, value: `${(statsData.avgCommission || 0).toFixed(1)}%`, icon: <Percent /> },
        { label: t.stats.verified, value: statsData.globalTotal || 0, icon: <Briefcase /> },
    ];

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
                        <div className="flex bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm transition-all text-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#202223]' : 'text-[#6d7175] hover:text-[#202223]'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-all text-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-[#202223]' : 'text-[#6d7175] hover:text-[#202223]'}`}><LayoutList className="w-4 h-4" /></button>
                        </div>
                        <button 
                            onClick={() => { resetForm(); setModalLanguage('en'); setShowAddModal(true); }}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            {t.onboardVendor}
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
                    {/* Search */}
                    <div className="p-3 border-b border-[#c9cccf]">
                        <div className="relative max-w-lg">
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
                                <p className="text-sm">Loading vendors...</p>
                            </div>
                        ) : filteredVendors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Store className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Vendors Found</h3>
                                <p className="text-sm">Adjust your search or add a new vendor.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-[#f4f6f8]">
                                {filteredVendors.map((vendor) => (
                                    <div key={vendor.id} className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                                        <div className="p-5 flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="w-16 h-16 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center">
                                                    {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-[#8c9196]" />}
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white ${vendor.status === 'Active' || vendor.status === 'active' ? 'text-[#006e52] border-[#89d6bb]' : 'text-[#8c2626] border-[#e8d5d5]'}`}>
                                                    {vendor.status === 'Active' || vendor.status === 'active' ? t.status.active : t.status.inactive}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#202223] break-words">{getTranslated(vendor.businessName, language) || 'Untitled'}</h3>
                                                <p className="text-sm text-[#6d7175] flex items-center gap-1.5 mt-1"><User className="w-3.5 h-3.5" /> {getTranslated(vendor.name, language)}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="border border-[#ebebeb] rounded p-2 bg-[#fafbfb]">
                                                    <p className="text-xs text-[#6d7175] mb-0.5 tracking-wide">Commission</p>
                                                    <p className="font-semibold text-[#202223]">{vendor.commissionRate || 0}%</p>
                                                </div>
                                                <div className="border border-[#ebebeb] rounded p-2 bg-[#fafbfb] overflow-hidden">
                                                    <p className="text-xs text-[#6d7175] mb-0.5 tracking-wide">Region</p>
                                                    <p className="font-semibold text-[#202223] truncate">{getTranslated(vendor.serviceArea, language) || 'Global'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 pb-4 px-5 border-t border-[#ebebeb] flex justify-end gap-2 bg-[#fafbfb]">
                                            <button onClick={() => openEditModal(vendor)} className="px-3 py-1.5 rounded bg-white border border-[#c9cccf] text-sm text-[#202223] font-medium hover:bg-[#f4f6f8] transition-colors flex items-center gap-1.5"><Edit3 size={14} /> Edit</button>
                                            <button onClick={() => handleDelete(vendor.id)} className="px-3 py-1.5 rounded bg-white border border-[#c9cccf] text-sm text-[#d82c0d] font-medium hover:bg-[#feeeee] transition-colors flex items-center gap-1.5"><Trash2 size={14} /> Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.portfolio}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.governance}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.nodeStatus}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.interface}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {filteredVendors.map((vendor) => (
                                            <tr key={vendor.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openEditModal(vendor)}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                            {vendor.logo ? <img src={vendor.logo} className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-[#8c9196]" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-[#202223]">{getTranslated(vendor.businessName, language) || 'Untitled'}</div>
                                                            <div className="text-xs text-[#6d7175] flex items-center gap-1 mt-0.5">
                                                                <User className="w-3 h-3" /> {getTranslated(vendor.name, language)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="font-semibold text-[#202223]">{vendor.commissionRate || 0}% </span>
                                                    <span className="text-xs text-[#6d7175]">Commission</span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${vendor.status === 'Active' || vendor.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'}`}>
                                                        {vendor.status === 'Active' || vendor.status === 'active' ? t.status.active : t.status.inactive}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5">
                                                        <button onClick={() => openEditModal(vendor)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDelete(vendor.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                            <p className="text-sm text-[#6d7175]">
                                Showing <span className="font-semibold text-[#202223]">{(page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> partners
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

                {/* Add/Edit Modal (Full Screen Overlay) */}
                <AnimatePresence>
                    {(showAddModal || showEditModal) && (
                        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f6f8]">
                            {/* MODAL HEADER */}
                            <div className="px-4 py-3 border-b border-[#c9cccf] flex items-center justify-between bg-white z-20 shrink-0 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors border border-transparent">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="text-lg font-bold text-[#202223]">{showEditModal ? t.editVendor : t.onboardVendor}</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1 bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5">
                                        {['en', 'hi', 'gu'].map(l => (
                                            <button key={l} type="button" onClick={() => setModalLanguage(l)} className={`px-2 py-0.5 rounded-sm text-xs font-medium uppercase transition-colors ${modalLanguage === l ? 'bg-white text-[#202223] shadow-sm' : 'text-[#6d7175] hover:text-[#202223]'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* MODAL BODY */}
                            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                                <form id="vendorForm" onSubmit={handleSubmit} className="p-4 md:p-8 max-w-[1000px] mx-auto pb-32">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* MAIN COLUMN (LEFT) */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Identity Card */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-5">
                                                <h4 className="text-sm font-semibold text-[#202223]">Identity Details</h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-semibold text-[#202223] mb-1 block">Business Name ({modalLanguage}) *</label>
                                                        <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" 
                                                            value={modalLanguage === 'en' ? form.businessName : modalLanguage === 'hi' ? form.businessNameHi : form.businessNameGu} 
                                                            onChange={(e) => {
                                                                if(modalLanguage === 'en') setForm({...form, businessName: e.target.value});
                                                                else if(modalLanguage === 'hi') setForm({...form, businessNameHi: e.target.value});
                                                                else setForm({...form, businessNameGu: e.target.value});
                                                            }} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold text-[#202223] mb-1 block">Principal Name ({modalLanguage}) *</label>
                                                        <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" 
                                                            value={modalLanguage === 'en' ? form.name : modalLanguage === 'hi' ? form.nameHi : form.nameGu} 
                                                            onChange={(e) => {
                                                                if(modalLanguage === 'en') setForm({...form, name: e.target.value});
                                                                else if(modalLanguage === 'hi') setForm({...form, nameHi: e.target.value});
                                                                else setForm({...form, nameGu: e.target.value});
                                                            }} 
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Description ({modalLanguage})</label>
                                                    <textarea rows={3} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060] resize-y" 
                                                        value={modalLanguage === 'en' ? form.description : modalLanguage === 'hi' ? form.descriptionHi : form.descriptionGu} 
                                                        onChange={(e) => {
                                                            if(modalLanguage === 'en') setForm({...form, description: e.target.value});
                                                            else if(modalLanguage === 'hi') setForm({...form, descriptionHi: e.target.value});
                                                            else setForm({...form, descriptionGu: e.target.value});
                                                        }} 
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-semibold text-[#202223] mb-1 block">Service Area ({modalLanguage})</label>
                                                        <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060] bg-white" 
                                                            value={modalLanguage === 'en' ? form.serviceArea : modalLanguage === 'hi' ? form.serviceAreaHi : form.serviceAreaGu} 
                                                            onChange={(e) => {
                                                                if(modalLanguage === 'en') setForm({...form, serviceArea: e.target.value});
                                                                else if(modalLanguage === 'hi') setForm({...form, serviceAreaHi: e.target.value});
                                                                else setForm({...form, serviceAreaGu: e.target.value});
                                                            }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metafields Section */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                                                    <Tag size={16} className="text-[#008060]" />
                                                    <h4 className="text-sm font-semibold text-[#202223] uppercase tracking-wider">Vendor Metafields</h4>
                                                </div>
                                                
                                                <MetafieldValueEditor 
                                                    ownerType="VENDORS"
                                                    value={form.metafields}
                                                    onChange={(newMetafields) => setForm(prev => ({ ...prev, metafields: newMetafields }))}
                                                />
                                            </div>

                                            {/* Governance & Access Card */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Governance & Access</h4>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-semibold text-[#202223] mb-1 block">Corporate Email *</label>
                                                        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold text-[#202223] mb-1 block">Contact Number *</label>
                                                        <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" />
                                                    </div>
                                                    {!showEditModal && (
                                                        <div className="md:col-span-2">
                                                            <label className="text-sm font-semibold text-[#202223] mb-1 block">Password *</label>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                                                                <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-9 pr-3 border border-[#c9cccf] shadow-inner rounded-md py-1.5 text-sm outline-none focus:border-[#008060]" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Physical Headquarters</label>
                                                    <textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060] resize-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SIDEBAR (RIGHT) */}
                                        <div className="lg:col-span-1 space-y-6">
                                            {/* Status Box */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Status & Settings</h4>
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Node Status</label>
                                                    <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                                        <option value="active">{t.status.active}</option>
                                                        <option value="inactive">{t.status.inactive}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Commission Rate *</label>
                                                    <div className="flex items-center border border-[#c9cccf] shadow-inner rounded-md px-2 py-1.5 focus-within:border-[#008060] bg-white text-sm text-[#202223]">
                                                        <input required type="number" step="0.1" value={form.commissionRate} onChange={e => setForm({...form, commissionRate: e.target.value})} className="flex-1 outline-none w-full text-right" />
                                                        <span className="text-[#6d7175] font-medium ml-1">%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media Box */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Corporate Logo</h4>
                                                <div className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group w-full max-w-[200px] mx-auto">
                                                    {form.logoPreview ? (
                                                        <>
                                                            <img src={form.logoPreview} className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => setForm({...form, logo: null, logoPreview: null})} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                                                        </>
                                                    ) : (
                                                        <label className="w-full h-full flex flex-col items-center justify-center text-[#202223] hover:bg-[#fafbfb] cursor-pointer transition-colors gap-2 text-sm font-medium">
                                                            <UploadCloud size={24} className="text-[#6d7175]" />
                                                            <span>Upload Logo</span>
                                                            <input type="file" onChange={handleLogoChange} className="hidden" accept="image/*" />
                                                        </label>
                                                    )}
                                                </div>
                                                <p className="text-xs text-center text-[#6d7175]">Recommended: 400x400px (Max 2MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-4"></div>
                                </form>
                            </div>

                            {/* FIXED ACTION BAR */}
                            <div className="border-t border-[#c9cccf] bg-white p-4 flex items-center justify-end gap-3 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.form.cancel}</button>
                                <button type="submit" form="vendorForm" disabled={submitting} className="px-4 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                                    {showEditModal ? t.form.update : t.form.onboard}
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #c9cccf;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #8c9196;
                    }
                `}</style>
            </div>
        </div>
    );
}