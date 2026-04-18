'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Eye, Trash2, Star, Filter, ChevronLeft, ChevronRight,
    MessageSquare, User, Package, Calendar, CheckCircle2, XCircle,
    AlertCircle, Store, Languages, RefreshCw, Loader2, LayoutGrid,
    LayoutList, ArrowLeft, MoreHorizontal, X, Clock
} from 'lucide-react';

export default function ReviewsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [selectedReview, setSelectedReview] = useState(null);
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [globalStats, setGlobalStats] = useState({ total: 0, pendingCount: 0, approvedCount: 0, avgRating: 0 });
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

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

    // ─── TRANSLATIONS ─────────────────────────────────────────────
    const translations = {
        en: {
            pageTitle: 'Reviews',
            pageDesc: 'Manage customer feedback for products and farmers to maintain high service standards.',
            totalReviews: 'Total Reviews',
            productReviews: 'Product Feedback',
            farmerReviews: 'Farmer Feedback',
            approved: 'Approved',
            pending: 'Pending',
            avgRating: 'Avg Rating',
            searchPlaceholder: 'Search by customer, product, farmer or order ID...',
            allTypes: 'All Types',
            allStatus: 'All Status',
            rejected: 'Rejected',
            allRatings: 'All Ratings',
            star: 'Star',
            table: { customer: 'Customer', type: 'Type', subject: 'Subject', rating: 'Rating', status: 'Status', date: 'Date', actions: 'Actions' },
            modal: { title: 'Review Dossier', feedback: 'Customer Feedback', approval: 'Set Approval Status', approve: 'Approve', pending: 'Pending', reject: 'Reject', close: 'Close' },
            productBadge: 'Product',
            farmerBadge: 'Farmer',
            noReviews: 'No feedback found matching your filters.'
        },
        hi: {
            pageTitle: 'समीक्षाएं',
            pageDesc: 'उच्च सेवा मानकों को बनाए रखने के लिए उत्पादों और किसानों के लिए ग्राहक प्रतिक्रिया प्रबंधित करें।',
            totalReviews: 'कुल समीक्षाएं',
            productReviews: 'उत्पाद प्रतिक्रिया',
            farmerReviews: 'किसान प्रतिक्रिया',
            approved: 'स्वीकृत',
            pending: 'लंबित',
            avgRating: 'औसत रेटिंग',
            searchPlaceholder: 'ग्राहक, उत्पाद, किसान या ऑर्डर आईडी से खोजें...',
            allTypes: 'सभी प्रकार',
            allStatus: 'सभी स्थिति',
            rejected: 'अस्वीकृत',
            allRatings: 'सभी रेटिंग',
            star: 'सितारा',
            table: { customer: 'ग्राहक', type: 'प्रकार', subject: 'विषय', rating: 'रेटिंग', status: 'स्थिति', date: 'तारीख', actions: 'क्रियाएं' },
            modal: { title: 'समीक्षा डोजियर', feedback: 'ग्राहक प्रतिक्रिया', approval: 'स्वीकृति स्थिति सेट करें', approve: 'स्वीकृत', pending: 'लंबित', reject: 'अस्वीकृत', close: 'बंद करें' },
            productBadge: 'उत्पाद',
            farmerBadge: 'किसान',
            noReviews: 'आपके फ़िल्टर से मेल खाने वाली कोई प्रतिक्रिया नहीं मिली।'
        },
        gu: {
            pageTitle: 'સમીક્ષાઓ',
            pageDesc: 'સેવાના ઉચ્ચ ધોરણો જાળવવા માટે ઉત્પાદનો અને ખેડૂતો માટે ગ્રાહક પ્રતિસાદ મેનેજ કરો.',
            totalReviews: 'કુલ સમીક્ષાઓ',
            productReviews: 'પ્રોડક્ટ પ્રતિસાદ',
            farmerReviews: 'ખેડૂત પ્રતિસાદ',
            approved: 'મંજૂર',
            pending: 'બાકી',
            avgRating: 'સરેરાશ રેટિંગ',
            searchPlaceholder: 'ગ્રાહક, પ્રોડક્ટ, ખેડૂત અથવા ઓર્ડર આઈડી દ્વારા શોધો...',
            allTypes: 'બધા પ્રકારો',
            allStatus: 'બધી સ્થિતિ',
            rejected: 'અસ્વીકાર',
            allRatings: 'બધી રેટિંગ્સ',
            star: 'તારો',
            table: { customer: 'ગ્રાહક', type: 'પ્રકાર', subject: 'વિષય', rating: 'રેટિંગ', status: 'સ્થિતિ', date: 'તારીખ', actions: 'ક્રિયાઓ' },
            modal: { title: 'સમીક્ષા ડોઝિયર', feedback: 'ગ્રાહક પ્રતિસાદ', approval: 'મંજૂરીની સ્થિતિ સેટ કરો', approve: 'મંજૂર', pending: 'બાકી', reject: 'અસ્વીકાર', close: 'બંધ કરો' },
            productBadge: 'પ્રોડક્ટ',
            farmerBadge: 'ખેડૂત',
            noReviews: 'તમારા ફિલ્ટર્સ સાથે મેળ ખાતો કોઈ પ્રતિસાદ મળ્યો નથી.'
        }
    };

    const t = translations[language];

    const [reviews, setReviews] = useState([]);

    const fetchReviews = async (page = currentPage, query = debouncedSearch, status = statusFilter, type = typeFilter, rating = ratingFilter) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page,
                limit: 10,
                search: query,
                statusFilter: status,
                typeFilter: type,
                ratingFilter: rating
            });
            const res = await fetch(`/api/admin/reviews?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.data || []);
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
        // Prevent double fetch on initial render if using debounced effect below.
        if (currentPage > 1 || debouncedSearch || statusFilter !== 'all' || typeFilter !== 'all' || ratingFilter !== 'all') {
            fetchReviews(currentPage, debouncedSearch, statusFilter, typeFilter, ratingFilter);
        }
    }, [currentPage, statusFilter, typeFilter, ratingFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            if (searchTerm !== '') setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearch !== '') {
            fetchReviews(1, debouncedSearch, statusFilter, typeFilter, ratingFilter);
        } else {
            fetchReviews(1, '', statusFilter, typeFilter, ratingFilter);
        }
    }, [debouncedSearch]);

    const currentReviews = reviews;

    const statsData = globalStats;

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review permanently?')) return;
        try {
            setActionLoading(true);
            const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== id));
                if (selectedReview?.id === id) setSelectedReview(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            setActionLoading(true);
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus.toUpperCase() })
            });
            if (res.ok) {
                setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus.toUpperCase() } : r));
                if (selectedReview?.id === id) setSelectedReview(prev => ({ ...prev, status: newStatus.toUpperCase() }));
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={12} className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#c9cccf]'}`} />
            ))}
        </div>
    );

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'approved') return { label: t.approved, color: 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' };
        if (s === 'pending') return { label: t.pending, color: 'bg-[#fff5ea] text-[#8a6116] border-[#f9ead3]' };
        return { label: t.rejected, color: 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]' };
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

                    <div className="flex items-center gap-3">
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
                        <button onClick={fetchReviews} className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.totalReviews}</p><h3 className="text-2xl font-bold text-[#202223]">{statsData.total}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><MessageSquare className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.pending}</p><h3 className="text-2xl font-bold text-[#f29339]">{statsData.pendingCount}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Clock className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.avgRating}</p><h3 className="text-2xl font-bold text-[#e0b833]">{statsData.avgRating} ★</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Star className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.approved}</p><h3 className="text-2xl font-bold text-[#008060]">{statsData.approvedCount}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><CheckCircle2 className="w-6 h-6" /></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-3 border-b border-[#c9cccf] bg-[#fafbfb] space-y-3 md:space-y-0 md:flex md:items-center md:gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] shadow-inner" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 bg-white border border-[#c9cccf] rounded text-xs font-semibold text-[#202223] outline-none focus:border-[#008060] cursor-pointer">
                                <option value="all">{t.allTypes}</option>
                                <option value="product">{t.productReviews}</option>
                                <option value="farmer">{t.farmerReviews}</option>
                            </select>
                            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 bg-white border border-[#c9cccf] rounded text-xs font-semibold text-[#202223] outline-none focus:border-[#008060] cursor-pointer">
                                <option value="all">{t.allStatus}</option>
                                <option value="approved">{t.approved}</option>
                                <option value="pending">{t.pending}</option>
                                <option value="rejected">{t.rejected}</option>
                            </select>
                            <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 bg-white border border-[#c9cccf] rounded text-xs font-semibold text-[#202223] outline-none focus:border-[#008060] cursor-pointer">
                                <option value="all">{t.allRatings}</option>
                                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} {t.star}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#008060]" />
                                <p className="text-sm">Fetching feedback analytics...</p>
                            </div>
                        ) : currentReviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <MessageSquare className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Feedback Found</h3>
                                <p className="text-sm">{t.noReviews}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">{t.table.customer}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.type}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.subject}</th>
                                            <th className="px-5 py-3 font-semibold">{t.table.rating}</th>
                                            <th className="px-5 py-3 font-semibold text-center">{t.table.status}</th>
                                            <th className="px-5 py-3 font-semibold text-right">{t.table.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {currentReviews.map((review) => {
                                            const badge = getStatusBadge(review.status);
                                            return (
                                                <tr key={review.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => setSelectedReview(review)}>
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full border border-[#c9cccf] bg-[#f4f6f8] flex items-center justify-center shrink-0">
                                                                <User className="w-5 h-5 text-[#8c9196]" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[#202223]">{review.customerName}</div>
                                                                <div className="text-sm font-bold text-[#6d7175] uppercase">{review.orderId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${review.type === 'product' ? 'bg-blue-50 text-blue-700 border-blue-100' : (review.type === 'farmer' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100')}`}>
                                                            {review.type === 'product' ? <Package size={10} /> : (review.type === 'farmer' ? <Store size={10} /> : <User size={10} />)}
                                                            {review.type === 'product' ? t.productBadge : (review.type === 'farmer' ? t.farmerBadge : 'Vendor')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-[#6d7175]">
                                                        <div className="flex flex-col max-w-[200px] min-w-0">
                                                            <span className="font-semibold text-[#202223] truncate">{getTranslated(review, 'subjectName')}</span>
                                                            <span className="text-sm opacity-60 truncate">{getTranslated(review, 'comment')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">{renderStars(review.rating)}</td>
                                                    <td className="px-5 py-3 text-center">
                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-bold uppercase tracking-widest border ${badge.color}`}>
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex justify-end gap-1.5">
                                                            <button onClick={() => setSelectedReview(review)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Eye size={14} /></button>
                                                            <button onClick={() => handleDelete(review.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm"><Trash2 size={14} /></button>
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

                {/* Details Modal */}
                <AnimatePresence>
                    {selectedReview && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReview(null)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white z-10 shrink-0">
                                    <h3 className="text-lg font-bold text-[#202223]">{t.modal.title}</h3>
                                    <button onClick={() => setSelectedReview(null)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>
                                
                                <div className="p-6 bg-[#f4f6f8] space-y-4 overflow-y-auto custom-scrollbar">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm">
                                            <p className="text-sm font-bold text-[#6d7175] uppercase tracking-wider mb-1">Customer</p>
                                            <p className="text-sm font-semibold text-[#202223]">{selectedReview.customerName}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm">
                                            <p className="text-sm font-bold text-[#6d7175] uppercase tracking-wider mb-1">Order Vector</p>
                                            <p className="text-sm font-semibold text-[#202223]">{selectedReview.orderId}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-[#c9cccf] shadow-sm col-span-2 lg:col-span-1">
                                            <p className="text-sm font-bold text-[#6d7175] uppercase tracking-wider mb-1">Source Type</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wider border ${selectedReview.type === 'product' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                    {selectedReview.type === 'product' ? t.productBadge : t.farmerBadge}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject Info */}
                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-3">
                                        <div className="flex justify-between border-b border-[#f4f6f8] pb-1.5">
                                            <span className="text-sm font-bold text-[#6d7175] uppercase tracking-wider">Farmer / Producer</span>
                                            <span className="text-sm font-semibold text-[#202223]">{getTranslated(selectedReview, 'subjectName')}</span>
                                        </div>
                                        {selectedReview.type === 'product' && (
                                            <div className="flex justify-between border-b border-[#f4f6f8] pb-1.5">
                                                <span className="text-sm font-bold text-[#6d7175] uppercase tracking-wider">Product Identifier</span>
                                                <span className="text-sm font-semibold text-[#202223]">{getTranslated(selectedReview, 'subjectName')}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pb-1.5">
                                            <span className="text-sm font-bold text-[#6d7175] uppercase tracking-wider">Submission Date</span>
                                            <span className="text-sm font-semibold text-[#202223]">{selectedReview.date}</span>
                                        </div>
                                    </div>

                                    {/* Feedback Content */}
                                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#f4f6f8] pb-2">
                                            <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-[0.2em]">{t.modal.feedback}</h4>
                                            {renderStars(selectedReview.rating)}
                                        </div>
                                        <p className="text-sm leading-relaxed text-[#202223] italic border-l-4 border-[#008060] pl-4 bg-[#f0f9f6] py-3 rounded-r-md">"{getTranslated(selectedReview, 'comment')}"</p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-5 py-4 bg-white border-t border-[#ebebeb] flex flex-wrap gap-2 items-center justify-end">
                                    <h4 className="mr-auto text-sm font-black text-[#6d7175] uppercase tracking-[0.2em] hidden sm:block">{t.modal.approval}</h4>
                                    <button disabled={actionLoading} onClick={() => updateStatus(selectedReview.id, 'approved')} className="px-4 py-1.5 rounded-md bg-[#008060] text-white text-xs font-bold hover:bg-[#006e52] transition-colors disabled:opacity-50">
                                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : t.modal.approve}
                                    </button>
                                    <button disabled={actionLoading} onClick={() => updateStatus(selectedReview.id, 'pending')} className="px-4 py-1.5 rounded-md bg-[#f29339] text-white text-xs font-bold hover:bg-[#e0822d] transition-colors disabled:opacity-50">
                                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : t.modal.pending}
                                    </button>
                                    <button disabled={actionLoading} onClick={() => updateStatus(selectedReview.id, 'rejected')} className="px-4 py-1.5 rounded-md bg-[#d82c0d] text-white text-xs font-bold hover:bg-[#c0250a] transition-colors disabled:opacity-50">
                                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : t.modal.reject}
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
                `}</style>
            </div>
        </div>
    );
}