'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Calendar,
    MapPin,
    X,
    Image as ImageIcon,
    Save,
    Loader2,
    Zap,
    Star,
    LayoutGrid,
    LayoutList,
    Languages,
    UploadCloud,
    Users,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [language, setLanguage] = useState('en');

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ total: 0, upcoming: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const initialForm = {
        title: '', titleHi: '', titleGu: '',
        slug: '',
        shortDesc: '', shortDescHi: '', shortDescGu: '',
        location: '', locationHi: '', locationGu: '',
        description: '', descriptionHi: '', descriptionGu: '',
        date: '',
        images: [],
        imagePreviews: []
    };

    const [form, setForm] = useState(initialForm);

    const translations = {
        en: {
            pageTitle: 'Platform Milestones',
            pageDesc: 'Orchestrate farm visits, sustainable workshops, and seasonal fairs.',
            initiateEvent: 'Initialize Event',
            stats: { registry: 'Event Registry', pulse: 'Upcoming Pulse', attendance: 'Avg Attendance', ranking: 'Global Ranking' },
            searchPlaceholder: 'Scan titles, regional nodes, or descriptions...',
            status: { upcoming: 'Upcoming', past: 'Past' },
            actions: { dashboard: 'Dashboard', terminate: 'Terminate this event record?' },
            modal: { spec: 'Event Specification', name: 'Event Identity', date: 'Deployment Date', location: 'Geographic Node', brief: 'Narrative Brief', assets: 'Gallery Assets', discard: 'Discard', initiate: 'Initiate Phase', update: 'Update Phase' }
        },
        hi: {
            pageTitle: 'प्लेटफ़ॉर्म मील के पत्थर',
            pageDesc: 'फार्म विज़िट, टिकाऊ कार्यशालाओं और मौसमी मेलों का आयोजन करें।',
            initiateEvent: 'ईवेंट शुरू करें',
            stats: { registry: 'ईवेंट रजिस्ट्री', pulse: 'आगामी पल्स', attendance: 'औसत उपस्थिति', ranking: 'ग्लोबल रैंकिंग' },
            searchPlaceholder: 'शीर्षक, क्षेत्रीय नोड्स या विवरण स्कैन करें...',
            status: { upcoming: 'आगामी', past: 'बीता हुआ' },
            actions: { dashboard: 'डैशबोर्ड', terminate: 'क्या इस ईवेंट रिकॉर्ड को समाप्त करना है?' },
            modal: { spec: 'ईवेंट विनिर्देश', name: 'ईवेंट पहचान', date: 'परिनियोजन तिथि', location: 'भौगोलिक नोड', brief: 'कथानक संक्षिप्त विवरण', assets: 'गैलरी एसेट्स', discard: 'खारिज करें', initiate: 'चरण शुरू करें', update: 'चरण अपडेट करें' }
        },
        gu: {
            pageTitle: 'પ્લેટફોર્મ માઈલસ્ટોન્સ',
            pageDesc: 'ફાર્મની મુલાકાતો, ટકાઉ વર્કશોપ અને મોસમી મેળાઓનું આયોજન કરો.',
            initiateEvent: 'ઇવેન્ટ શરૂ કરો',
            stats: { registry: 'ઇવેન્ટ રજીસ્ટ્રી', pulse: 'આગામી પલ્સ', attendance: 'સરેરાશ હાજરી', ranking: 'ગ્લોરલ રેન્કિંગ' },
            searchPlaceholder: 'શીર્ષકો, પ્રાદેશિક નોડ્સ અથવા વર્ણનો સ્કેન કરો...',
            status: { upcoming: 'આગામી', past: 'ભૂતકાળ' },
            actions: { dashboard: 'ડેશબોર્ડ', terminate: 'આ ઇવેન્ટ રેકોર્ડ સમાપ્ત કરવો છે?' },
            modal: { spec: 'ઇવેન્ટ સ્પષ્ટીકરણ', name: 'ઇવેન્ટ ઓળખ', date: 'તૈનાત તારીખ', location: 'ભૌગોલિક નોડ', brief: 'વર્ણનાત્મક સંક્ષિપ્તી', assets: 'ગેલેરી અસેટ્સ', discard: 'રદ કરો', initiate: 'તબક્કો શરૂ કરો', update: 'તબક્કો અપડેટ કરો' }
        }
    };

    const t = translations[language];

    // Improved safe translation getter
    const getTranslated = (field, fallback = '') => {
        if (!field) return fallback;
        if (typeof field === 'string') return field;

        // Handle object with language keys (new backend format)
        if (typeof field === 'object' && field !== null) {
            return field[language] || 
                   field.en || 
                   field.hi || 
                   field.gu || 
                   fallback;
        }
        return fallback;
    };

    const fetchEvents = async (page = currentPage, query = debouncedSearch) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: query,
            });
            const res = await fetch(`/api/admin/events?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setEvents(data.data || []);
                if (data.pagination) setPagination(data.pagination);
                if (data.stats) setGlobalStats(data.stats);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            if (search !== '') setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const filteredEvents = events;

    const statsData = globalStats;

    const statsConfig = [
        { label: t.stats.registry, value: statsData.total, icon: <Calendar />, color: 'emerald' },
        { label: t.stats.pulse, value: statsData.upcoming, icon: <Zap />, color: 'blue' },
        { label: t.stats.attendance, value: '450+', icon: <Users />, color: 'purple' },
        { label: t.stats.ranking, value: 'Elite', icon: <Star />, color: 'amber' },
    ];

    const openEdit = (e) => {
        setIsEditMode(true);
        setEditingEventId(e.id);

        const dateInput = e.date ? new Date(e.date).toISOString().slice(0, 16) : '';

        setForm({
            title: e.title?.en || (typeof e.title === 'string' ? e.title : ''),
            titleHi: e.titleHi || e.title?.hi || '',
            titleGu: e.titleGu || e.title?.gu || '',
            slug: e.slug || '',

            shortDesc: e.shortDesc?.en || (typeof e.shortDesc === 'string' ? e.shortDesc : ''),
            shortDescHi: e.shortDescHi || e.shortDesc?.hi || '',
            shortDescGu: e.shortDescGu || e.shortDesc?.gu || '',

            location: e.location?.en || (typeof e.location === 'string' ? e.location : ''),
            locationHi: e.locationHi || e.location?.hi || '',
            locationGu: e.locationGu || e.location?.gu || '',

            description: e.description?.en || (typeof e.description === 'string' ? e.description : ''),
            descriptionHi: e.descriptionHi || e.description?.hi || '',
            descriptionGu: e.descriptionGu || e.description?.gu || '',

            date: dateInput,
            images: [],
            imagePreviews: (e.images || []).map(img => ({ 
                id: img.id,
                url: img.url, 
                preview: img.url, 
                isExisting: true 
            }))
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t.actions.terminate)) return;
        try {
            const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
            if (res.ok) fetchEvents();
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(file => ({ file, preview: URL.createObjectURL(file), isExisting: false }));
        setForm(prev => ({
            ...prev,
            images: [...prev.images, ...files],
            imagePreviews: [...prev.imagePreviews, ...previews]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // Send individual fields as expected by backend (NO JSON.stringify)
            formData.append('title', form.title);
            formData.append('titleHi', form.titleHi);
            formData.append('titleGu', form.titleGu);
            formData.append('slug', form.slug);

            formData.append('shortDesc', form.shortDesc);
            formData.append('shortDescHi', form.shortDescHi);
            formData.append('shortDescGu', form.shortDescGu);

            formData.append('location', form.location);
            formData.append('locationHi', form.locationHi);
            formData.append('locationGu', form.locationGu);

            formData.append('description', form.description);
            formData.append('descriptionHi', form.descriptionHi);
            formData.append('descriptionGu', form.descriptionGu);

            formData.append('date', form.date);

            // Handle existing images in edit mode
            if (isEditMode) {
                const existing = form.imagePreviews
                    .filter(p => p.isExisting)
                    .map(p => p.id)
                    .filter(Boolean);
                formData.append('existingImages', JSON.stringify(existing));
            }

            // Append new image files
            form.images.forEach(img => formData.append('images', img));

            const res = await fetch(
                isEditMode 
                    ? `/api/admin/events/${editingEventId}` 
                    : '/api/admin/events',
                {
                    method: isEditMode ? 'PUT' : 'POST',
                    body: formData
                }
            );

            if (res.ok) {
                setShowAddModal(false);
                fetchEvents();
                // Reset form after successful submit
                setForm(initialForm);
                setIsEditMode(false);
                setEditingEventId(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F8] p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-xl font-bold text-gray-900">{t.pageTitle}</h1>
                        <p className="text-sm text-gray-500 mt-1">{t.pageDesc}</p>
                    </motion.div>
                    
                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm h-9">
                            <Languages size={14} className="text-gray-500" />
                            <select 
                                value={language} 
                                onChange={e => setLanguage(e.target.value)} 
                                className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer h-full"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="gu">ગુજરાતી</option>
                            </select>
                        </div>
                        
                        {/* View Toggles */}
                        <div className="flex bg-white rounded-lg border border-gray-300 p-0.5 shadow-sm h-9">
                            <button 
                                onClick={() => setViewMode('grid')} 
                                className={`px-2 rounded-md transition-all h-full ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')} 
                                className={`px-2 rounded-md transition-all h-full ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutList size={16} />
                            </button>
                        </div>

                        {/* Add Button */}
                        <button 
                            onClick={() => { 
                                setIsEditMode(false); 
                                setForm(initialForm); 
                                setShowAddModal(true); 
                            }} 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors h-9"
                        >
                            <Plus size={16} /> {t.initiateEvent}
                        </button>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsConfig.map((stat, i) => (
                        <motion.div 
                            key={stat.label} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }} 
                            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <div className="text-gray-400">{stat.icon}</div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </motion.div>
                    ))}
                </div>

                {/* Filter/Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={t.searchPlaceholder} 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm text-gray-900" 
                    />
                </div>

                {/* Event Display Area */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            <p className="text-sm font-medium text-gray-500">Loading events...</p>
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}
                        >
                            {filteredEvents.map((event, idx) => {
                                const status = new Date(event.date) >= new Date() ? t.status.upcoming : t.status.past;
                                return (
                                    <motion.div 
                                        key={event.id} 
                                        layout 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ delay: idx * 0.05 }} 
                                        className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all overflow-hidden ${viewMode === 'list' ? 'flex items-center p-3 gap-4 text-left' : ''}`}
                                    >
                                        <div className={`relative bg-gray-100 shrink-0 ${viewMode === 'grid' ? 'h-48' : 'w-32 h-20 rounded-lg'}`}>
                                            {event.images?.[0] ? (
                                                <img src={event.images[0].url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <ImageIcon size={viewMode === 'grid' ? 32 : 20} />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wider shadow-sm border ${status === t.status.upcoming ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                    {status}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={`flex-grow ${viewMode === 'grid' ? 'p-5' : ''}`}>
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="text-left">
                                                    <h3 className="text-base font-semibold text-gray-900">
                                                        {getTranslated(event.title)}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            {new Date(event.date).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            {getTranslated(event.location)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button 
                                                        onClick={() => openEdit(event)} 
                                                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(event.id)} 
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-white rounded-xl shadow-sm">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> events
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`p-1.5 rounded-lg border border-gray-300 shadow-sm transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed bg-white' : 'text-gray-700 hover:bg-gray-50 bg-white'}`}
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
                                                className={`w-8 h-8 rounded-lg border text-sm font-medium transition-all ${currentPage === pNum ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {pNum}
                                            </button>
                                        );
                                    }
                                    if (pNum === currentPage - 2 || pNum === currentPage + 2) {
                                        return <span key={pNum} className="text-gray-400">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={currentPage === pagination.totalPages}
                                className={`p-1.5 rounded-lg border border-gray-300 shadow-sm transition-all ${currentPage === pagination.totalPages ? 'text-gray-300 cursor-not-allowed bg-white' : 'text-gray-700 hover:bg-gray-50 bg-white'}`}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Creation/Edit Modal */}
                <AnimatePresence>
                    {showAddModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => setShowAddModal(false)} 
                                className="fixed inset-0 bg-gray-900/40 backdrop-blur-[2px]" 
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.98, y: 10 }} 
                                className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        {isEditMode ? t.modal.update : t.modal.initiate}
                                    </h2>
                                    <button 
                                        onClick={() => setShowAddModal(false)} 
                                        className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                {/* Modal Body */}
                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 h-full custom-scrollbar">
                                    {/* Event Identity Fields */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-gray-900 rounded-full" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t.modal.name}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <InputField label="Name (EN)" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="Event Title" required />
                                            <InputField label="नाम (HI)" value={form.titleHi} onChange={v => setForm({...form, titleHi: v})} placeholder="शीर्षक" />
                                            <InputField label="નામ (GU)" value={form.titleGu} onChange={v => setForm({...form, titleGu: v})} placeholder="શીર્ષક" />
                                            <InputField label="Slug" value={form.slug} onChange={v => setForm({...form, slug: v})} placeholder="event-slug" />
                                        </div>
                                    </div>

                                    {/* Short Description */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-gray-900 rounded-full" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Short Description</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <TextareaField label="Short Desc (EN)" value={form.shortDesc} onChange={v => setForm({...form, shortDesc: v})} placeholder="Brief one-liner..." rows={2} />
                                            <TextareaField label="संक्षिप्त विवरण (HI)" value={form.shortDescHi} onChange={v => setForm({...form, shortDescHi: v})} placeholder="संक्षिप्त विवरण..." rows={2} />
                                            <TextareaField label="સંક્ષિપ્ત વર્ણન (GU)" value={form.shortDescGu} onChange={v => setForm({...form, shortDescGu: v})} placeholder="સંક્ષિપ્ત વર્ણન..." rows={2} />
                                        </div>
                                    </div>

                                    {/* Date and Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-gray-900 rounded-full" />
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t.modal.date}</h4>
                                            </div>
                                            <input 
                                                type="datetime-local" 
                                                value={form.date} 
                                                onChange={e => setForm({...form, date: e.target.value})} 
                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-4 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-gray-900 rounded-full" />
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t.modal.location}</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location (EN)" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-all" />
                                                <input type="text" value={form.locationHi} onChange={e => setForm({...form, locationHi: e.target.value})} placeholder="स्थान (HI)" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-all" />
                                                <input type="text" value={form.locationGu} onChange={e => setForm({...form, locationGu: e.target.value})} placeholder="સ્થળ (GU)" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Full Descriptions */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-left">
                                            <div className="w-1 h-4 bg-gray-900 rounded-full" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">{t.modal.brief}</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <TextareaField label="Description (EN)" value={form.description} onChange={v => setForm({...form, description: v})} placeholder="Detailed description..." />
                                            <TextareaField label="विवरण (HI)" value={form.descriptionHi} onChange={v => setForm({...form, descriptionHi: v})} placeholder="विस्तृत विवरण..." />
                                            <TextareaField label="વર્ણન (GU)" value={form.descriptionGu} onChange={v => setForm({...form, descriptionGu: v})} placeholder="વિગતવાર વર્ણન..." />
                                        </div>
                                    </div>

                                    {/* Image Management */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-gray-900 rounded-full" />
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Event Images</h4>
                                            </div>
                                            <label className="cursor-pointer px-3 py-1.5 bg-gray-900 rounded-lg text-xs font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                                                Upload Media
                                                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                            {form.imagePreviews.map((img, i) => (
                                                <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={img.preview} className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setForm(p => {
                                                                const removedPreview = p.imagePreviews[i];
                                                                return {
                                                                    ...p,
                                                                    imagePreviews: p.imagePreviews.filter((_, idx) => idx !== i),
                                                                    images: removedPreview?.isExisting
                                                                        ? p.images
                                                                        : p.images.filter(file => file !== removedPreview.file),
                                                                };
                                                            })} 
                                                            className="p-1.5 bg-white text-red-600 rounded-md shadow-sm hover:scale-105 transition-all"
                                                        >
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {form.imagePreviews.length === 0 && (
                                                <div className="col-span-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                    <UploadCloud size={24} className="opacity-40" />
                                                    <span className="text-sm font-medium uppercase tracking-wider">No images uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>

                                {/* Modal Footer */}
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddModal(false)} 
                                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        {t.modal.discard}
                                    </button>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={isSubmitting} 
                                        className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 shadow-sm transition-colors flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        {isEditMode ? t.modal.update : t.modal.initiate}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Global Style Overrides */}
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #b1b1b1; }
                `}</style>
            </div>
        </div>
    );
}

// Sub-components for Form Fields
function InputField({ label, value, onChange, placeholder, type = 'text', required = false }) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                required={required} 
                placeholder={placeholder} 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-all" 
            />
        </div>
    );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
            <textarea 
                rows={rows} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none min-h-[80px]" 
            />
        </div>
    );
}       