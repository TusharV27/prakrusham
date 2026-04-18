'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Eye, Edit3, Trash2, User, Phone, Mail, MapPin, 
    CheckCircle2, XCircle, X, Image as ImageIcon, Tractor, Wheat, 
    Star, Save, Leaf, Loader2, ArrowUpRight, LandPlot, Users, 
    ChevronRight, Map, Info, LayoutGrid, LayoutList, Languages, 
    UploadCloud, ArrowLeft, Tag
} from 'lucide-react';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function FarmersPage() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('list'); 
    const [language, setLanguage] = useState('en'); // en | hi | gu
    const [modalLanguage, setModalLanguage] = useState('en');
    
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ globalTotal: 0, activePartners: 0, totalLand: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ---------------- TRANSLATIONS ----------------
    const translations = {
        en: {
            pageTitle: 'Farmers',
            pageDesc: 'Manage producer profiles, land certifications, and partnership status.',
            addFarmer: 'Add New Farmer',
            editFarmer: 'Edit Farmer',
            stats: {
                total: 'Registered Farmers',
                active: 'Active Partners',
                landSize: 'Total Land Size',
                reach: 'Network Reach'
            },
            searchPlaceholder: 'Search by name, contact, or farm ID...',
            table: {
                details: 'Partner Details',
                contact: 'Contact',
                land: 'Land Cert.',
                activity: 'Activity Level',
                commands: 'Commands'
            },
            status: {
                active: 'Active',
                inactive: 'Inactive'
            },
            viewModal: {
                title: 'Farmer Dossier',
                subtitle: 'Detailed Operational Analysis',
                presentation: 'Farm Presentation',
                auditStatus: 'Audit Status',
                verified: 'Verified Farmer',
                approved: 'Documents Approved',
                listings: 'Active Listings',
                portfolio: 'Gallery Portfolio'
            },
            form: {
                basic: 'Basic Information',
                name: 'Farmer Name (en) *',
                nameHi: 'Farmer Name (hi)',
                nameGu: 'Farmer Name (gu)',
                email: 'Email Address',
                phone: 'Phone Number *',
                landSize: 'Land Size (Acres) *',
                status: 'Partnership Status',
                farmDetails: 'Farm Presentation (en)',
                farmDetailsHi: 'Farm Presentation (hi)',
                farmDetailsGu: 'Farm Presentation (gu)',
                media: 'Media Portfolio',
                uploadDesc: 'Upload farm images and certificates',
                cancel: 'Discard',
                save: 'Save Partner',
                update: 'Update Profile'
            }
        },
        hi: {
            pageTitle: 'किसान',
            pageDesc: 'उत्पादक प्रोफाइल, भूमि प्रमाणन और साझेदारी की स्थिति प्रबंधित करें।',
            addFarmer: 'नया किसान जोड़ें',
            editFarmer: 'किसान संपादित करें',
            stats: {
                total: 'पंजीकृत किसान',
                active: 'सक्रिय भागीदार',
                landSize: 'कुल भूमि का आकार',
                reach: 'नेटवर्क पहुंच'
            },
            searchPlaceholder: 'नाम, संपर्क या फार्म आईडी से खोजें...',
            table: {
                details: 'भागीदार विवरण',
                contact: 'संपर्क',
                land: 'भूमि प्रमाण पत्र',
                activity: 'गतिविधि स्तर',
                commands: 'कमांड'
            },
            status: {
                active: 'सक्रिय',
                inactive: 'निष्क्रिय'
            },
            viewModal: {
                title: 'किसान डोजियर',
                subtitle: 'विस्तृत परिचालन विश्लेषण',
                presentation: 'फार्म प्रस्तुति',
                auditStatus: 'ऑडिट स्थिति',
                verified: 'सत्यापित किसान',
                approved: 'दस्तावेज अनुमोदित',
                listings: 'सक्रिय लिस्टिंग',
                portfolio: 'गैलरी पोर्टफोलियो'
            },
            form: {
                basic: 'बेसिक जानकारी',
                name: 'किसान का नाम (en) *',
                nameHi: 'किसान का नाम (hi)',
                nameGu: 'किसान का नाम (gu)',
                email: 'ईमेल पता',
                phone: 'फ़ोन नंबर *',
                landSize: 'भूमि का आकार (एकड़) *',
                status: 'साझेदारी की स्थिति',
                farmDetails: 'फार्म प्रस्तुति (en)',
                farmDetailsHi: 'फार्म प्रस्तुति (hi)',
                farmDetailsGu: 'फार्म प्रस्तुति (gu)',
                media: 'मीडिया पोर्टफोलियो',
                uploadDesc: 'फार्म के चित्र और प्रमाण पत्र अपलोड करें',
                cancel: 'रद्द करें',
                save: 'भागीदार सहेजें',
                update: 'प्रोफ़ाइल अपडेट करें'
            }
        },
        gu: {
            pageTitle: 'ખેડૂતો',
            pageDesc: 'ઉત્પાદક પ્રોફાઇલ, જમીન પ્રમાણપત્ર અને ભાગીદારીની સ્થિતિ મેનેજ કરો.',
            addFarmer: 'નવો ખેડૂત ઉમેરો',
            editFarmer: 'ખેડૂત સંપાદિત કરો',
            stats: {
                total: 'રજિસ્ટર્ડ ખેડૂતો',
                active: 'સક્રિય ભાગીદારો',
                landSize: 'કુલ જમીનનું કદ',
                reach: 'નેટવર્ક પહોંચ'
            },
            searchPlaceholder: 'નામ, સંપર્ક અથવા ફાર્મ આઈડી દ્વારા શોધો...',
            table: {
                details: 'ભાગીદારની વિગતો',
                contact: 'સંપર્ક મેટ્રિક્સ',
                land: 'જમીન પ્ર.',
                activity: 'પ્રવૃત્તિ સ્તર',
                commands: 'કમાન્ડ્સ'
            },
            status: {
                active: 'સક્રિય',
                inactive: 'નિષ્ક્રિય'
            },
            viewModal: {
                title: 'ખેડૂત ડોઝિયર',
                subtitle: 'વિગતવાર વિશ્લેષણ',
                presentation: 'ફાર્મ રજૂઆત',
                auditStatus: 'ઓડિટ સ્થિતિ',
                verified: 'ખેડૂત સોંપેલ',
                approved: 'દસ્તાવેજો મંજૂર',
                listings: 'સક્રિય લિસ્ટિંગ',
                portfolio: 'ગેલેરી પોર્ટફોલિયો'
            },
            form: {
                basic: 'મૂળભૂત માહિતી',
                name: 'ખેડૂતનું નામ (en) *',
                nameHi: 'ખેડૂતનું નામ (hi)',
                nameGu: 'ખેડૂતનું નામ (gu)',
                email: 'ઈમેલ સરનામું',
                phone: 'ફોન નંબર *',
                landSize: 'જમીનનું કદ (એકર) *',
                status: 'ભાગીદારીની સ્થિતિ',
                farmDetails: 'ફાર્મ રજૂઆત (en)',
                farmDetailsHi: 'ફાર્મ રજૂઆત (hi)',
                farmDetailsGu: 'ફાર્મ રજૂઆત (gu)',
                media: 'મીડિયા પોર્ટફોલિયો',
                uploadDesc: 'ફાર્મની છબીઓ અને પ્રમાણપત્રો અપલોડ કરો',
                cancel: 'રદ કરો',
                save: 'ભાગીદાર સાચવો',
                update: 'પ્રોફાઇલ અપડેટ કરો'
            }
        }
    };

    const t = translations[language];

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

    const [form, setForm] = useState({
        name: '', nameHi: '', nameGu: '', email: '', phone: '',
        landSize: '', farmDetails: '', farmDetailsHi: '', farmDetailsGu: '',
        status: 'active', existingImages: [], newImages: [], imagePreviews: [],
        metafields: [],
    });

    useEffect(() => {
        fetchFarmers(page, debouncedSearch);
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
        fetchFarmers(1, debouncedSearch);
    }, [debouncedSearch]);

    const fetchFarmers = async (currentPage = page, searchQuery = debouncedSearch) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: searchQuery
            });
            const res = await fetch(`/api/admin/farmers?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setFarmers(data.data || []);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '', nameHi: '', nameGu: '', email: '', phone: '',
            landSize: '', farmDetails: '', farmDetailsHi: '', farmDetailsGu: '',
            status: 'active', existingImages: [], newImages: [], imagePreviews: [],
            metafields: [],
        });
        setSubmitting(false);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map(file => URL.createObjectURL(file));
        setForm(prev => ({
            ...prev,
            newImages: [...prev.newImages, ...files],
            imagePreviews: [...prev.imagePreviews, ...previews]
        }));
    };

    const removeFile = (index, isExisting = false) => {
        if (isExisting) {
            setForm(prev => ({
                ...prev,
                existingImages: prev.existingImages.filter((_, i) => i !== index)
            }));
        } else {
            setForm(prev => {
                const updatedPreviews = [...prev.imagePreviews];
                URL.revokeObjectURL(updatedPreviews[index]);
                updatedPreviews.splice(index, 1);
                return {
                    ...prev,
                    newImages: prev.newImages.filter((_, i) => i !== index),
                    imagePreviews: updatedPreviews
                };
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.landSize) {
            alert('Please fill all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'newImages') {
                    form.newImages.forEach(file => formData.append('images', file));
                } else if (key === 'existingImages') {
                    formData.append('existingImages', JSON.stringify(form.existingImages));
                } else if (key === 'metafields') {
                    formData.append('metafields', JSON.stringify(form.metafields));
                } else if (key !== 'imagePreviews') {
                    formData.append(key, form[key]);
                }
            });

            const url = showEditModal ? `/api/admin/farmers/${selectedFarmer.id}` : '/api/admin/farmers';
            const method = showEditModal ? 'PUT' : 'POST';

            const res = await fetch(url, { method, body: formData });
            const result = await res.json();

            if (result.success) {
                fetchFarmers();
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

    const openEditModal = (farmer) => {
        setSelectedFarmer(farmer);
        setForm({
            name: farmer.name.en || '',
            nameHi: farmer.name.hi || '',
            nameGu: farmer.name.gu || '',
            email: farmer.email || '',
            phone: farmer.phone || '',
            landSize: farmer.landSize || '',
            farmDetails: farmer.farmDetails.en || '',
            farmDetailsHi: farmer.farmDetails.hi || '',
            farmDetailsGu: farmer.farmDetails.gu || '',
            status: farmer.status || 'active',
            existingImages: farmer.images || [],
            metafields: farmer.metafields || [],
            newImages: [],
            imagePreviews: []
        });
        setModalLanguage('en');
        setShowEditModal(true);
    };

    const filteredFarmers = farmers; // Now using server-paginated list directly

    const statsData = globalStats;

    const statsConfig = [
        { label: t.stats.total, value: statsData.globalTotal || 0, icon: <Users /> },
        { label: t.stats.active, value: statsData.activePartners || 0, icon: <Tractor /> },
        { label: t.stats.landSize, value: `${(statsData.totalLand || 0).toFixed(1)} Ac`, icon: <LandPlot /> },
        { label: t.stats.reach, value: '14 Regions', icon: <Map /> },
    ];

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await fetch(`/api/admin/farmers/${id}`, { method: 'DELETE' });
            fetchFarmers();
        } catch (error) {
            console.error('Delete error:', error);
        }
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
                        <div className="flex bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm transition-all text-sm ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#202223]' : 'text-[#6d7175] hover:text-[#202223]'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm transition-all text-sm ${viewMode === 'list' ? 'bg-white shadow-sm text-[#202223]' : 'text-[#6d7175] hover:text-[#202223]'}`}><LayoutList className="w-4 h-4" /></button>
                        </div>
                        <button 
                            onClick={() => { resetForm(); setModalLanguage('en'); setShowAddModal(true); }}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            {t.addFarmer}
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
                                <p className="text-sm">Loading farmers...</p>
                            </div>
                        ) : filteredFarmers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Users className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Farmers Found</h3>
                                <p className="text-sm">Adjust your search or add a new partner.</p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-[#f4f6f8]">
                                {filteredFarmers.map((farmer) => (
                                    <div key={farmer.id} className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="h-40 bg-[#f4f6f8] border-b border-[#c9cccf] relative">
                                            {farmer.images?.[0] ? (
                                                <img src={farmer.images[0].url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#8c9196]">
                                                    <Tractor className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white shadow-sm ${farmer.status === 'active' ? 'text-[#006e52] border-[#89d6bb]' : 'text-[#8c2626] border-[#e8d5d5]'}`}>
                                                    {farmer.status === 'active' ? t.status.active : t.status.inactive}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-[#202223] break-words">{getTranslated(farmer, 'name')}</h3>
                                                    <p className="text-xs text-[#6d7175] mt-0.5 font-mono">ID: {farmer.id.slice(-6)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-[#202223]">{farmer.landSize || 0} <span className="text-xs font-normal text-[#6d7175]">Ac</span></div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-[#6d7175] space-y-1">
                                                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5"/> {farmer.phone || 'N/A'}</div>
                                                <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap"><Mail className="w-3.5 h-3.5"/> {farmer.email || 'N/A'}</div>
                                            </div>
                                            <div className="pt-3 border-t border-[#ebebeb] flex gap-2">
                                                <button onClick={() => { setSelectedFarmer(farmer); setShowViewModal(true); }} className="flex-1 py-1.5 rounded bg-white border border-[#c9cccf] text-sm text-[#202223] font-medium hover:bg-[#fafbfb] transition-colors flex items-center justify-center gap-2"><Eye size={16} /> View</button>
                                                <button onClick={() => openEditModal(farmer)} className="w-9 h-9 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] hover:bg-[#f4f6f8] flex items-center justify-center"><Edit3 size={16} /></button>
                                                <button onClick={() => handleDelete(farmer.id)} className="w-9 h-9 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#d82c0d] hover:bg-[#feeeee] flex items-center justify-center"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.details}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.contact}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.land}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.activity}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.commands}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {filteredFarmers.map((farmer) => (
                                            <tr key={farmer.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openEditModal(farmer)}>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                            {farmer.images?.[0] ? <img src={farmer.images[0].url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[#8c9196]" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-[#202223]">{getTranslated(farmer, 'name')}</div>
                                                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${farmer.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'}`}>{farmer.status === 'active' ? t.status.active : t.status.inactive}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-[#6d7175]">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {farmer.phone || 'N/A'}</div>
                                                        <div className="flex items-center gap-1.5 overflow-hidden"><Mail className="w-3.5 h-3.5" /> <span className="truncate max-w-[150px]">{farmer.email || 'N/A'}</span></div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <span className="font-semibold text-[#202223]">{farmer.landSize || 0}</span> <span className="text-[#6d7175]">Acres</span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className="inline-flex items-center justify-center bg-[#e2f1fe] text-[#004e9c] border border-[#b0dcfb] px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                        {farmer.productsCount || 0} Products
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5">
                                                        <button onClick={() => {
                                                             setSelectedFarmer(farmer); setShowViewModal(true);
                                                              }} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Eye size={14} /></button>
                                                        <button onClick={() => {
                                                            console.log("seletcted framer",farmer)
                                                            openEditModal(farmer)}} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDelete(farmer.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Trash2 size={14} /></button>
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
                                    <h3 className="text-lg font-bold text-[#202223]">{showEditModal ? t.editFarmer : t.addFarmer}</h3>
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
                                <form id="farmerForm" onSubmit={handleSubmit} className="p-4 md:p-8 max-w-[1000px] mx-auto pb-32">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* MAIN COLUMN (LEFT) */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Basic Information */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-5">
                                                <h4 className="text-sm font-semibold text-[#202223]">Identity & Contact</h4>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-semibold text-[#202223] mb-1 block">Full Name ({modalLanguage}) *</label>
                                                        <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none transition-shadow" 
                                                            value={modalLanguage === 'en' ? form.name : modalLanguage === 'hi' ? form.nameHi : form.nameGu} 
                                                            onChange={(e) => {
                                                                if(modalLanguage === 'en') setForm({...form, name: e.target.value});
                                                                else if(modalLanguage === 'hi') setForm({...form, nameHi: e.target.value});
                                                                else setForm({...form, nameGu: e.target.value});
                                                            }} 
                                                        />
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-semibold text-[#202223] mb-1 block">Email</label>
                                                            <input type="email" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-semibold text-[#202223] mb-1 block">Phone *</label>
                                                            <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Farm Details */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">{t.viewModal.presentation}</h4>
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Description ({modalLanguage})</label>
                                                    <textarea rows="4" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none resize-y" 
                                                        value={modalLanguage === 'en' ? form.farmDetails : modalLanguage === 'hi' ? form.farmDetailsHi : form.farmDetailsGu} 
                                                        onChange={(e) => {
                                                            if(modalLanguage === 'en') setForm({...form, farmDetails: e.target.value});
                                                            else if(modalLanguage === 'hi') setForm({...form, farmDetailsHi: e.target.value});
                                                            else setForm({...form, farmDetailsGu: e.target.value});
                                                        }} 
                                                    />
                                                </div>
                                            </div>

                                            {/* Metafields Section */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                                                    <Tag size={16} className="text-[#008060]" />
                                                    <h4 className="text-sm font-semibold text-[#202223] uppercase tracking-wider">Farmer Metafields</h4>
                                                </div>
                                                
                                                <MetafieldValueEditor 
                                                    ownerType="FARMERS"
                                                    value={form.metafields}
                                                    onChange={(newMetafields) => setForm(prev => ({ ...prev, metafields: newMetafields }))}
                                                />
                                            </div>
                                        </div>

                                        {/* SIDEBAR (RIGHT) */}
                                        <div className="lg:col-span-1 space-y-6">
                                            {/* Status Box */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Status & Settings</h4>
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Status</label>
                                                    <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                                        <option value="active">{t.status.active}</option>
                                                        <option value="inactive">{t.status.inactive}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Land Total</label>
                                                    <div className="flex items-center border border-[#c9cccf] shadow-inner rounded-md px-2 py-1.5 focus-within:border-[#008060] focus-within:ring-1 focus-within:ring-[#008060] bg-white text-sm text-[#202223]">
                                                        <input required type="number" step="0.1" value={form.landSize} onChange={e => setForm({...form, landSize: e.target.value})} className="flex-1 outline-none w-full" />
                                                        <span className="text-[#6d7175] font-medium ml-1">Acres</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media Box */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Media</h4>
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    {form.existingImages.map((img, i) => (
                                                        <div key={`e-${i}`} className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group">
                                                            <img src={img.url} className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => removeFile(i, true)} className="absolute top-1 right-1 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                    {form.imagePreviews.map((url, i) => (
                                                        <div key={`n-${i}`} className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group">
                                                            <img src={url} className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <label className="aspect-square rounded border border-dashed border-[#c9cccf] bg-[#fafbfb] flex flex-col items-center justify-center text-[#202223] hover:bg-[#f4f6f8] cursor-pointer transition-colors gap-2 text-sm font-medium">
                                                        <UploadCloud size={20} className="text-[#6d7175]" />
                                                        <span>Upload</span>
                                                        <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-4"></div>
                                </form>
                            </div>

                            {/* FIXED ACTION BAR */}
                            <div className="border-t border-[#c9cccf] bg-white p-4 flex items-center justify-end gap-3 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.form.cancel}</button>
                                <button type="submit" form="farmerForm" disabled={submitting} className="px-4 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                                    {showEditModal ? t.form.update : t.form.save}
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* VIEW MODAL */}
                <AnimatePresence>
                    {showViewModal && selectedFarmer && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowViewModal(false)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white z-10 shrink-0">
                                    <h3 className="text-lg font-bold text-[#202223]">{t.viewModal.title}</h3>
                                    <button onClick={() => setShowViewModal(false)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f4f6f8] custom-scrollbar">
                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex flex-col md:flex-row gap-6">
                                        <div className="w-32 h-32 shrink-0 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8]">
                                            {selectedFarmer.images?.[0] ? <img src={selectedFarmer.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="text-[#8c9196] w-12 h-12" /></div>}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xl font-bold text-[#202223]">{getTranslated(selectedFarmer, 'name')}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-sm font-medium border ${selectedFarmer.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'}`}>{selectedFarmer.status === 'active' ? t.status.active : t.status.inactive}</span>
                                            </div>
                                            <div className="text-sm font-medium text-[#6d7175] space-y-1">
                                                <div className="flex items-center gap-2"><Phone className="w-4 h-4"/> {selectedFarmer.phone || 'N/A'}</div>
                                                <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> {selectedFarmer.email || 'N/A'}</div>
                                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedFarmer.landSize || '0'} Acres</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-3">
                                        <h4 className="text-sm font-semibold text-[#202223]">{t.viewModal.presentation}</h4>
                                        <p className="text-sm text-[#202223] whitespace-pre-wrap">{getTranslated(selectedFarmer, 'farmDetails') || "No details provided."}</p>
                                    </div>
                                    
                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-3">
                                        <h4 className="text-sm font-semibold text-[#202223]">Performance</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border border-[#ebebeb] rounded p-3 text-center bg-[#fafbfb]">
                                                <p className="text-xs text-[#6d7175] font-medium uppercase tracking-wide mb-1">Products Listed</p>
                                                <p className="text-xl font-bold text-[#202223]">{selectedFarmer.productsCount || 0}</p>
                                            </div>
                                            <div className="border border-[#ebebeb] rounded p-3 text-center bg-[#fafbfb]">
                                                <p className="text-xs text-[#6d7175] font-medium uppercase tracking-wide mb-1">Avg Rating</p>
                                                <p className="text-xl font-bold text-[#202223] flex items-center justify-center gap-1"><Star className="w-4 h-4 text-[#FFC453] fill-[#FFC453]" /> {selectedFarmer.avgRating || '0.0'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedFarmer.images?.length > 1 && (
                                        <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-3">
                                            <h4 className="text-sm font-semibold text-[#202223]">{t.viewModal.portfolio}</h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {selectedFarmer.images.slice(1).map((img, i) => (
                                                    <div key={i} className="aspect-square rounded border border-[#ebebeb] overflow-hidden bg-[#fafbfb]">
                                                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}