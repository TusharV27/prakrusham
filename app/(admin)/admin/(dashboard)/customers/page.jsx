'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
    Plus, Search, Eye, Edit3, Trash2, Users, MapPin, Phone, Mail, User, X, Home, Building2, CheckCircle2, XCircle, Loader2, Languages, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal, Clock, ArrowLeft, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [language, setLanguage] = useState('en'); 

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ total: 0, active: 0, inactive: 0, addresses: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ---------------- TRANSLATIONS ----------------
    const translations = {
        en: {
            pageTitle: 'Customers',
            pageDesc: 'Manage customer profiles, addresses, and default delivery locations.',
            manager: 'Customer Directory',
            addCustomer: 'Add Customer',
            stats: {
                total: 'Total Profiles',
                active: 'Active Members',
                inactive: 'Inactive',
                addresses: 'Points of Service'
            },
            searchPlaceholder: 'Search by record identity, contact, or location vectors...',
            allStatus: 'All Status',
            table: {
                customer: 'Customer Info',
                phone: 'Contact Vector',
                email: 'Electronic Mail',
                defAddr: 'Primary Service Node',
                addresses: 'Nodes',
                status: 'Status',
                actions: 'Actions',
                noAddr: 'No service nodes assigned'
            },
            modal: {
                edit: 'Modify Profile',
                add: 'Initialize Profile',
                subtitle: 'Explicit configuration for profile and service nodes.',
                info: 'Profile Identity',
                name: 'Full Legal Name *',
                email: 'Contact Email',
                phone: 'Contact Phone *',
                status: 'Membership Status',
                addrTitle: 'Service Nodes',
                addrSubtitle: 'Assigned physical locations for delivery logistics.',
                addAddr: 'Add Node',
                addrType: 'Node Type',
                addrLine1: 'Line 1 *',
                addrLine2: 'Line 2',
                landmark: 'Landmark Descriptor',
                pincode: 'Index Code *',
                city: 'City Terminal *',
                state: 'Regional State *',
                defBadge: 'PRIMARY',
                setDef: 'Set Primary',
                remove: 'Decommission',
                cancel: 'Discard',
                save: 'Deploy Profile',
                update: 'Patch Profile',
                details: 'Profile Dossier'
            },
            badges: {
                active: 'ACTIVE',
                inactive: 'INACTIVE'
            }
        },
        hi: {
            pageTitle: 'ग्राहक',
            pageDesc: 'ग्राहक प्रोफाइल, पते और डिफ़ॉल्ट वितरण स्थानों का प्रबंधन करें।',
            manager: 'ग्राहक निर्देशिका',
            addCustomer: 'ग्राहक जोड़ें',
            stats: {
                total: 'कुल प्रोफाइल',
                active: 'सक्रिय सदस्य',
                inactive: 'निष्क्रिय',
                addresses: 'सेवा बिंदु'
            },
            searchPlaceholder: 'रिकॉर्ड पहचान, संपर्क या स्थान वैक्टर द्वारा खोजें...',
            allStatus: 'सभी स्थिति',
            table: {
                customer: 'ग्राहक जानकारी',
                phone: 'संपर्क वेक्टर',
                email: 'इलेक्ट्रॉनिक मेल',
                defAddr: 'प्राथमिक सेवा नोड',
                addresses: 'नोड्स',
                status: 'स्थिति',
                actions: 'क्रियाएं',
                noAddr: 'कोई सेवा नोड असाइन नहीं किया गया'
            },
            modal: {
                edit: 'प्रोफ़ाइल संशोधित करें',
                add: 'प्रोफ़ाइल आरंभ करें',
                subtitle: 'प्रोफ़ाइल और सेवा नोड्स के लिए स्पष्ट कॉन्फ़िगरेशन।',
                info: 'प्रोफ़ाइल पहचान',
                name: 'पूरा कानूनी नाम *',
                email: 'संपर्क ईमेल',
                phone: 'संपर्क फोन *',
                status: 'सदस्यता स्थिति',
                addrTitle: 'सेवा नोड्स',
                addrSubtitle: 'वितरण रसद के लिए निर्धारित भौतिक स्थान।',
                addAddr: 'नोड जोड़ें',
                addrType: 'नोड प्रकार',
                addrLine1: 'लाइन 1 *',
                addrLine2: 'लाइन 2',
                landmark: 'लैंडमार्क विवरणक',
                pincode: 'इंडेक्स कोड *',
                city: 'सिटी टर्मिनल *',
                state: 'क्षेत्रीय राज्य *',
                defBadge: 'प्राथमिक',
                setDef: 'प्राथमिक सेट करें',
                remove: 'हटाएं',
                cancel: 'रद्द करें',
                save: 'प्रोफ़ाइल तैनात करें',
                update: 'प्रोफ़ाइल पैच करें',
                details: 'प्रोफ़ाइल डोजियर'
            },
            badges: {
                active: 'सक्रिय',
                inactive: 'निष्क्रिय'
            }
        },
        gu: {
            pageTitle: 'ગ્રાહકો',
            pageDesc: 'ગ્રાહક પ્રોફાઇલ્સ, સરનામાંઓ અને ડિફોલ્ટ ડિલિવરી સ્થાનો મેનેજ કરો.',
            manager: 'ગ્રાહક નિર્દેશિકા',
            addCustomer: 'ગ્રાહક ઉમેરો',
            stats: {
                total: 'કુલ પ્રોફાઇલ્સ',
                active: 'સક્રિય સભ્યો',
                inactive: 'નિષ્ક્રિય',
                addresses: 'સેવા બિંદુઓ'
            },
            searchPlaceholder: 'રેકોર્ડ ઓળખ, સંપર્ક અથવા સ્થાન વેક્ટર દ્વારા શોધો...',
            allStatus: 'બધી સ્થિતિ',
            table: {
                customer: 'ગ્રાહક માહિતી',
                phone: 'સંપર્ક વેક્ટર',
                email: 'ઇલેક્ટ્રોનિક મેઇલ',
                defAddr: 'પ્રાથમિક સેવા નોડ',
                addresses: 'નોડ્સ',
                status: 'સ્થિતિ',
                actions: 'ક્રિયાઓ',
                noAddr: 'કોઈ સેવા નોડ અસાઇન કરેલ નથી'
            },
            modal: {
                edit: 'પ્રોફાઇલ સંશોધિત કરો',
                add: 'પ્રોફાઇલ પ્રારંભ કરો',
                subtitle: 'પ્રોફાઇલ અને સેવા નોડ્સ માટે સ્પષ્ટ રૂપરેખાંકન.',
                info: 'પ્રોફાઇલ ઓળખ',
                name: 'પૂરું કાનૂની નામ *',
                email: 'સંપર્ક ઇમેઇલ',
                phone: 'સંપર્ક ફોન *',
                status: 'સદસ્યતા સ્થિતિ',
                addrTitle: 'સેવા નોડ્સ',
                addrSubtitle: 'ડિલિવરી લોજિસ્ટિક્સ માટે અસાઇન કરેલ ભૌતિક સ્થાનો.',
                addAddr: 'નોડ ઉમેરો',
                addrType: 'નોડ પ્રકાર',
                addrLine1: 'લાઇન 1 *',
                addrLine2: 'લાઇન 2',
                landmark: 'લેન્ડમાર્ક વર્ણનકર્તા',
                pincode: 'ઇન્ડેક્સ કોડ *',
                city: 'સિટી ટર્મિનલ *',
                state: 'પ્રાદેશિક રાજ્ય *',
                defBadge: 'પ્રાથમિક',
                setDef: 'પ્રાથમિક સેટ કરો',
                remove: 'દૂર કરો',
                cancel: 'રદ કરો',
                save: 'પ્રોફાઇલ સાચવો',
                update: 'પ્રોફાઇલ અપડેટ કરો',
                details: 'પ્રોફાઇલ ડોઝિયર'
            },
            badges: {
                active: 'સક્રિય',
                inactive: 'નિષ્ક્રિય'
            }
        }
    };

    const t = translations[language];

    const getTranslated = (field, fallback = '') => {
    if (!field) return fallback;
    let parsed = field;
    if (typeof field === 'string') {
        try { parsed = JSON.parse(field); } catch (e) { return field; }
    }
    if (typeof parsed === 'object' && parsed !== null) {
        const v = parsed[language] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
        return v !== undefined && v !== null ? v : fallback;
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : fallback;
  };

    const fetchCustomers = async (page = currentPage, query = debouncedSearch) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: query,
            });
            const res = await fetch(`/api/admin/customers?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers || []);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    const [search, setSearch] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [viewingCustomer, setViewingCustomer] = useState(null);

    const emptyAddress = {
        id: '',
        type: 'Home',
        fullName: { en: '', hi: '', gu: '' },
        phoneNumber: '',
        addressLine1: { en: '', hi: '', gu: '' },
        addressLine2: { en: '', hi: '', gu: '' },
        landmark: { en: '', hi: '', gu: '' },
        pincode: '',
        city: { en: '', hi: '', gu: '' },
        state: { en: '', hi: '', gu: '' },
        isDefault: false,
    };

    const [formData, setFormData] = useState({
        fullName: { en: '', hi: '', gu: '' },
        email: '',
        phone: '',
        status: 'active',
        addresses: [
            {
                ...emptyAddress,
                id: `ADDR-${Date.now()}`,
                isDefault: true,
            }
        ],
        metafields: [],
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            if (search !== '') setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const filteredCustomers = customers;

    const resetForm = () => {
        setFormData({
            fullName: { en: '', hi: '', gu: '' },
            email: '',
            phone: '',
            status: 'active',
            addresses: [
                {
                    ...emptyAddress,
                    id: `ADDR-${Date.now()}`,
                    isDefault: true,
                },
            ],
            metafields: [],
        });
        setEditingCustomer(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            fullName: typeof customer.fullName === 'object' ? { ...customer.fullName } : { en: customer.fullName || '', hi: '', gu: '' },
            email: customer.email || '',
            phone: customer.phone || '',
            status: customer.status || 'active',
            addresses: (customer.addresses || []).map((a) => ({
                ...a,
                fullName: typeof a.fullName === 'object' ? { ...a.fullName } : { en: a.fullName || '', hi: '', gu: '' },
                addressLine1: typeof a.addressLine1 === 'object' ? { ...a.addressLine1 } : { en: a.addressLine1 || '', hi: '', gu: '' },
                addressLine2: typeof a.addressLine2 === 'object' ? { ...a.addressLine2 } : { en: a.addressLine2 || '', hi: '', gu: '' },
                landmark: typeof a.landmark === 'object' ? { ...a.landmark } : { en: a.landmark || '', hi: '', gu: '' },
                city: typeof a.city === 'object' ? { ...a.city } : { en: a.city || '', hi: '', gu: '' },
                state: typeof a.state === 'object' ? { ...a.state } : { en: a.state || '', hi: '', gu: '' },
            })),
            metafields: customer.metafields || [],
        });
        setShowFormModal(true);
    };

    const openViewModal = (customer) => {
        setViewingCustomer(customer);
        setShowViewModal(true);
    };

    const closeFormModal = () => {
        setShowFormModal(false);
        resetForm();
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewingCustomer(null);
    };

    const handleCustomerField = (field, value, lang = null) => {
        setFormData((prev) => {
            if (lang) {
                return {
                    ...prev,
                    [field]: { ...prev[field], [lang]: value },
                };
            }
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const handleAddressField = (index, field, value, lang = null) => {
        setFormData((prev) => {
            const updated = [...prev.addresses];
            if (lang) {
                updated[index][field] = { ...updated[index][field], [lang]: value };
            } else {
                updated[index][field] = value;
            }
            return {
                ...prev,
                addresses: updated,
            };
        });
    };

    const addAddress = () => {
        setFormData((prev) => ({
            ...prev,
            addresses: [
                ...prev.addresses,
                {
                    ...emptyAddress,
                    id: `ADDR-${Date.now()}-${prev.addresses.length}`,
                },
            ],
        }));
    };

    const removeAddress = (index) => {
        if (formData.addresses.length === 1) return;
        const updated = formData.addresses.filter((_, i) => i !== index);
        if (!updated.some((a) => a.isDefault) && updated.length > 0) {
            updated[0].isDefault = true;
        }
        setFormData((prev) => ({
            ...prev,
            addresses: updated,
        }));
    };

    const setDefaultAddress = (index) => {
        const updated = formData.addresses.map((addr, i) => ({
            ...addr,
            isDefault: i === index,
        }));
        setFormData((prev) => ({
            ...prev,
            addresses: updated,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName.en || !formData.phone) {
            alert('Customer name (English) and phone are required.');
            return;
        }

        if (formData.addresses.length === 0) {
            alert('At least one address is required.');
            return;
        }

        const hasInvalidAddress = formData.addresses.some(
            (addr) =>
                !addr.fullName.en ||
                !addr.phoneNumber ||
                !addr.addressLine1.en ||
                !addr.pincode ||
                !addr.city.en ||
                !addr.state.en
        );

        if (hasInvalidAddress) {
            alert('Please fill all required address fields (at least in English).');
            return;
        }

        try {
            setSubmitting(true);
            const url = editingCustomer
                ? `/api/admin/customers/${editingCustomer.id}`
                : '/api/admin/customers';
            const method = editingCustomer ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                fetchCustomers();
                closeFormModal();
            } else {
                alert(data.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to save customer');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteCustomer = async (id) => {
        const ok = window.confirm('Are you sure you want to delete this customer? All associated data will be removed.');
        if (!ok) return;

        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setCustomers((prev) => prev.filter((item) => item.id !== id));
            } else {
                alert(data.error || 'Failed to delete customer');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Something went wrong during deletion');
        }
    };

    const stats = globalStats;

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
                            onClick={fetchCustomers}
                            className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            {t.addCustomer}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.total}</p><h3 className="text-2xl font-bold text-[#202223]">{stats.total}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Users className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.active}</p><h3 className="text-2xl font-bold text-[#008060]">{stats.active}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><CheckCircle2 className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.inactive}</p><h3 className="text-2xl font-bold text-[#d82c0d]">{stats.inactive}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><XCircle className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.stats.addresses}</p><h3 className="text-2xl font-bold text-[#202223]">{stats.addresses}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><MapPin className="w-6 h-6" /></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-3 border-b border-[#c9cccf] bg-[#fafbfb]">
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
                                <p className="text-sm font-bold uppercase tracking-wider opacity-60">Synchronizing Dossiers...</p>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Users className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Profiles Identified</h3>
                                <p className="text-sm italic">Adjust parameters or initialize a new record.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.customer}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.phone}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.defAddr}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.addresses}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.status}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {filteredCustomers.map((customer) => {
                                            const defaultAddr = (customer.addresses || []).find(a => a.isDefault) || customer.addresses?.[0];
                                            return (
                                                <tr key={customer.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openViewModal(customer)}>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full border border-[#c9cccf] bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                                <User className="w-5 h-5 text-[#8c9196]" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[#202223] uppercase tracking-tight">{getTranslated(customer.fullName)}</div>
                                                                <div className="text-sm font-bold text-[#6d7175] opacity-60 flex items-center gap-1"><Mail size={8} /> {customer.email || 'NO-EMAIL'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
                                                            <Phone size={10} className="text-[#8c9196]" /> {customer.phone}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {defaultAddr ? (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-[#202223] uppercase tracking-tight">{getTranslated(defaultAddr.city)}, {getTranslated(defaultAddr.state)}</span>
                                                                <span className="text-sm text-[#6d7175] italic opacity-60 line-clamp-1">{getTranslated(defaultAddr.addressLine1)}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm font-bold text-[#babfc3] uppercase tracking-widest italic">{t.table.noAddr}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#f4f6f8] border border-[#c9cccf] text-sm font-bold text-[#202223]">
                                                            {(customer.addresses || []).length}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-sm font-bold uppercase tracking-widest border ${
                                                            customer.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'
                                                        }`}>
                                                            {customer.status === 'active' ? t.badges.active : t.badges.inactive}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openViewModal(customer)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-white border border-transparent hover:border-[#c9cccf] transition-all"><Eye size={14} /></button>
                                                            <button onClick={() => openEditModal(customer)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-white border border-transparent hover:border-[#c9cccf] transition-all"><Edit3 size={14} /></button>
                                                            <button onClick={() => deleteCustomer(customer.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] border border-transparent hover:border-[#f9dada] transition-all"><Trash2 size={14} /></button>
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
                                    <ChevronLeft size={16} />
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

                {/* Form Modal (Add/Edit) */}
                <AnimatePresence>
                    {showFormModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeFormModal} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white shrink-0">
                                    <div className="space-y-0.5">
                                        <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{editingCustomer ? t.modal.edit : t.modal.add}</h3>
                                        <p className="text-sm font-black uppercase tracking-[0.1em] text-[#6d7175] opacity-60">{t.modal.subtitle}</p>
                                    </div>
                                    <button onClick={closeFormModal} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-[#f4f6f8]">
                                    <div className="p-6 space-y-6">
                                        {/* Basic Info */}
                                        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                                            <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                                                <User size={16} className="text-[#008060]" />
                                                <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">{t.modal.info}</h4>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Full Legal Name (EN) *</label>
                                                    <input required type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] transition-colors" value={formData.fullName.en} onChange={e => handleCustomerField('fullName', e.target.value, 'en')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">नाम (हिंदी)</label>
                                                    <input type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] transition-colors" value={formData.fullName.hi} onChange={e => handleCustomerField('fullName', e.target.value, 'hi')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">નામ (ગુજરાતી)</label>
                                                    <input type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] transition-colors" value={formData.fullName.gu} onChange={e => handleCustomerField('fullName', e.target.value, 'gu')} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.phone}</label>
                                                    <div className="relative">
                                                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196]" />
                                                        <input required type="text" className="w-full pl-9 bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] font-mono" value={formData.phone} onChange={e => handleCustomerField('phone', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.email}</label>
                                                    <div className="relative">
                                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196]" />
                                                        <input type="email" className="w-full pl-9 bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={formData.email} onChange={e => handleCustomerField('email', e.target.value)} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.status}</label>
                                                    <select className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] font-bold cursor-pointer" value={formData.status} onChange={e => handleCustomerField('status', e.target.value)}>
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Metafields Section */}
                                        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                                            <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                                                <Tag size={16} className="text-[#008060]" />
                                                <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Customer Metafields</h4>
                                            </div>
                                            
                                            <MetafieldValueEditor 
                                                ownerType="CUSTOMERS"
                                                value={formData.metafields}
                                                onChange={(newMetafields) => setFormData(prev => ({ ...prev, metafields: newMetafields }))}
                                            />
                                        </div>

                                        {/* Addresses Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-[#008060]" />
                                                    <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">{t.modal.addrTitle}</h4>
                                                    <span className="text-sm bg-[#202223] text-white px-1.5 py-0.5 rounded-full">{formData.addresses.length}</span>
                                                </div>
                                                <button type="button" onClick={addAddress} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-black uppercase tracking-widest text-[#008060] bg-white border border-[#008060] rounded-md hover:bg-[#f0f9f6] transition-colors"><Plus size={14} /> {t.modal.addAddr}</button>
                                            </div>

                                            {formData.addresses.map((address, index) => (
                                                <div key={address.id || index} className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-all ${address.isDefault ? 'border-[#008060] ring-1 ring-[#008060]/10' : 'border-[#c9cccf]'}`}>
                                                    <div className={`px-5 py-3 flex items-center justify-between border-b ${address.isDefault ? 'bg-[#f0f9f6] border-[#89d6bb]' : 'bg-[#fafbfb] border-[#ebebeb]'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${address.isDefault ? 'bg-white border-[#89d6bb] text-[#008060]' : 'bg-white border-[#c9cccf] text-[#6d7175]'}`}>
                                                                {address.type === 'Work' ? <Building2 size={16} /> : <Home size={16} />}
                                                            </div>
                                                            <span className="text-[11px] font-black text-[#202223] uppercase tracking-widest">Descriptor Node {index + 1}</span>
                                                            {address.isDefault && <span className="px-1.5 py-0.5 rounded bg-[#008060] text-[#fff] text-[9px] font-black tracking-widest">{t.modal.defBadge}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!address.isDefault && <button type="button" onClick={() => setDefaultAddress(index)} className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#008060] hover:bg-white rounded transition-colors">{t.modal.setDef}</button>}
                                                            {formData.addresses.length > 1 && <button type="button" onClick={() => removeAddress(index)} className="p-1.5 text-[#d82c0d] hover:bg-[#feeeee] rounded transition-colors"><Trash2 size={14} /></button>}
                                                        </div>
                                                    </div>

                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Receiver Identity (EN) *</label>
                                                            <input required type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.fullName.en} onChange={e => handleAddressField(index, 'fullName', e.target.value, 'en')} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">આવનારનું નામ (GU)</label>
                                                            <input type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.fullName.gu} onChange={e => handleAddressField(index, 'fullName', e.target.value, 'gu')} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">प्राप्तकर्ता (HI)</label>
                                                            <input type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.fullName.hi} onChange={e => handleAddressField(index, 'fullName', e.target.value, 'hi')} />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.addrType}</label>
                                                            <select className="w-full bg-[#fcfcfc] border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.type} onChange={e => handleAddressField(index, 'type', e.target.value)}>
                                                                <option value="Home">Home</option>
                                                                <option value="Work">Work</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Contact Phone</label>
                                                            <input type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] font-mono" value={address.phoneNumber} onChange={e => handleAddressField(index, 'phoneNumber', e.target.value)} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.pincode}</label>
                                                            <input required type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060] font-mono font-bold" value={address.pincode} onChange={e => handleAddressField(index, 'pincode', e.target.value)} />
                                                        </div>

                                                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#fafbfb] p-4 rounded border border-[#ebebeb]">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.city} (EN) *</label>
                                                                <input required type="text" className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.city.en} onChange={e => handleAddressField(index, 'city', e.target.value, 'en')} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.state} (EN) *</label>
                                                                <input required type="text" className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.state.en} onChange={e => handleAddressField(index, 'state', e.target.value, 'en')} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.landmark} (EN)</label>
                                                                <input type="text" className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.landmark.en} onChange={e => handleAddressField(index, 'landmark', e.target.value, 'en')} />
                                                            </div>
                                                        </div>

                                                        <div className="md:col-span-3 space-y-2">
                                                            <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">{t.modal.addrLine1} (EN) *</label>
                                                            <input required type="text" className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]" value={address.addressLine1.en} onChange={e => handleAddressField(index, 'addressLine1', e.target.value, 'en')} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white shrink-0">
                                    <button type="button" onClick={closeFormModal} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.modal.cancel}</button>
                                    <button onClick={handleSubmit} disabled={submitting} className="px-5 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[140px] justify-center">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCustomer ? t.modal.update : t.modal.save)}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* View Modal */}
                <AnimatePresence>
                    {showViewModal && viewingCustomer && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeViewModal} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white shrink-0">
                                    <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{t.modal.details}</h3>
                                    <button onClick={closeViewModal} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-[#f4f6f8] p-6 space-y-4 custom-scrollbar">
                                    <div className="flex flex-col items-center justify-center py-6 bg-white rounded-lg border border-[#c9cccf] shadow-sm space-y-2">
                                        <div className="w-20 h-20 rounded-full bg-[#f4f6f8] border-2 border-white shadow-md flex items-center justify-center">
                                            <User size={40} className="text-[#8c9196]" />
                                        </div>
                                        <h2 className="text-xl font-black text-[#202223] uppercase tracking-tighter">{getTranslated(viewingCustomer.fullName)}</h2>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-black uppercase tracking-[0.2em] border ${viewingCustomer.status === 'active' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'}`}>{viewingCustomer.status === 'active' ? t.badges.active : t.badges.inactive}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm">
                                            <p className="text-sm font-black text-[#6d7175] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Phone size={10} /> Call Vector</p>
                                            <p className="text-sm font-bold text-[#202223] font-mono">{viewingCustomer.phone}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm">
                                            <p className="text-sm font-black text-[#6d7175] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Mail size={10} /> Mail Vector</p>
                                            <p className="text-sm font-bold text-[#202223] truncate">{viewingCustomer.email || '—'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 px-1">
                                            <MapPin size={14} className="text-[#008060]" />
                                            <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-[0.2em]">Service Nodes</h4>
                                        </div>
                                        {(viewingCustomer.addresses || []).map((addr, idx) => (
                                            <div key={idx} className={`bg-white p-4 rounded-lg border shadow-sm relative overflow-hidden ${addr.isDefault ? 'border-[#008060] ring-1 ring-[#008060]/10' : 'border-[#c9cccf]'}`}>
                                                {addr.isDefault && <div className="absolute top-0 right-0 bg-[#008060] text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-bl uppercase">Primary</div>}
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded border border-[#f4f6f8] bg-[#fcfcfc] flex items-center justify-center shrink-0">
                                                        {addr.type === 'Work' ? <Building2 size={20} className="text-[#8c9196]" /> : <Home size={20} className="text-[#8c9196]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-black text-[#6d7175] uppercase tracking-widest">{addr.type} Node</span>
                                                            <span className="text-[11px] font-bold text-[#202223] truncate"> — {getTranslated(addr.fullName)}</span>
                                                        </div>
                                                        <p className="text-sm text-[#202223] font-medium leading-relaxed">{getTranslated(addr.addressLine1)}</p>
                                                        {addr.addressLine2 && <p className="text-xs text-[#6d7175]">{getTranslated(addr.addressLine2)}</p>}
                                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
                                                            <span className="text-sm font-bold text-[#202223] bg-[#f4f6f8] px-2 py-0.5 rounded border border-[#c9cccf] uppercase">{getTranslated(addr.city)}</span>
                                                            <span className="text-sm font-bold text-[#202223] bg-[#f4f6f8] px-2 py-0.5 rounded border border-[#c9cccf] uppercase">{getTranslated(addr.state)}</span>
                                                            <span className="text-sm font-bold text-[#202223] bg-[#f4f6f8] px-2 py-0.5 rounded border border-[#c9cccf] font-mono">{addr.pincode}</span>
                                                        </div>
                                                        {addr.phoneNumber && (
                                                            <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[#6d7175]">
                                                                <Phone size={10} /> {addr.phoneNumber}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end bg-white">
                                    <button onClick={() => { closeViewModal(); openEditModal(viewingCustomer); }} className="px-6 py-1.5 rounded-md bg-[#202223] text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-colors">{t.modal.edit}</button>
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
                `}</style>
            </div>
        </div>
    );
}