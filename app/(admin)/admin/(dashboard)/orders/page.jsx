'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Eye,
    Edit3,
    Trash2,
    ShoppingBag,
    Calendar,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    X,
    Filter,
    ArrowUpRight,
    Loader2,
    ChevronRight,
    Languages,
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    IndianRupee,
    Briefcase,
    LayoutGrid,
    LayoutList,
    RefreshCw,
    Download,
    Activity,
    Wifi,
    BarChart3,
    TrendingUp,
    FileText,
    ExternalLink,
    Box,
    CreditCard,
    Tag
} from 'lucide-react';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [language, setLanguage] = useState('en'); // en | hi | gu
    const [viewMode, setViewMode] = useState('list');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isLive, setIsLive] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ---------------- TRANSLATIONS ----------------
    const translations = {
        en: {
            pageTitle: 'Orders',
            pageDesc: 'Manage your orders, fulfillment, and returns.',
            stats: {
                total: 'Total Orders',
                pending: 'Pending',
                delivered: 'Delivered',
                revenue: 'Total Revenue'
            },
            searchPlaceholder: 'Search orders, customers...',
            table: {
                order: 'Order',
                customer: 'Customer',
                total: 'Total',
                status: 'Payment status',
                actions: 'Actions'
            },
            status: {
                PENDING: 'Pending',
                PROCESSING: 'Processing',
                SHIPPED: 'Shipped',
                DELIVERED: 'Delivered',
                CANCELLED: 'Cancelled'
            },
            viewModal: {
                title: 'Order Details',
                subtitle: 'Order tracking and fulfillment',
                details: 'Details',
                customer: 'Customer',
                items: 'Products',
                summary: 'Payment',
                changeStatus: 'Status',
                tracking: 'Timeline',
                downloadInvoice: 'Download Invoice'
            }
        },
        hi: {
            pageTitle: 'ऑर्डर',
            pageDesc: 'अपने ऑर्डर, पूर्ति और रिटर्न प्रबंधित करें।',
            stats: {
                total: 'कुल ऑर्डर',
                pending: 'लंबित',
                delivered: 'वितरित',
                revenue: 'कुल राजस्व'
            },
            searchPlaceholder: 'ऑर्डर, ग्राहक खोजें...',
            table: {
                order: 'ऑर्डर',
                customer: 'ग्राहक',
                total: 'कुल',
                status: 'स्थिति',
                actions: 'कार्रवाई'
            },
            status: {
                PENDING: 'लंबित',
                PROCESSING: 'प्रसंस्करण',
                SHIPPED: 'भेज दिया',
                DELIVERED: 'वितरित',
                CANCELLED: 'रद्द'
            },
            viewModal: {
                title: 'ऑर्डर विवरण',
                subtitle: 'ऑर्डर ट्रैकिंग और पूर्ति',
                details: 'विवरण',
                customer: 'ग्राहक',
                items: 'उत्पाद',
                summary: 'भुगतान',
                changeStatus: 'स्थिति',
                tracking: 'टाइमलाइन',
                downloadInvoice: 'इनवॉइस डाउनलोड करें'
            }
        },
        gu: {
            pageTitle: 'ઓર્ડર',
            pageDesc: 'તમારા ઓર્ડરનું સંચાલન કરો.',
            stats: {
                total: 'કુલ ઓર્ડર',
                pending: 'બાકી',
                delivered: 'વિતરિત',
                revenue: 'કુલ આવક'
            },
            searchPlaceholder: 'ઓર્ડર, ગ્રાહક શોધો...',
            table: {
                order: 'ઓર્ડર',
                customer: 'ગ્રાહક',
                total: 'કુલ',
                status: 'સ્થિતિ',
                actions: 'ક્રિયાઓ'
            },
            status: {
                PENDING: 'બાકી',
                PROCESSING: 'પ્રોસેસિંગ',
                SHIPPED: 'રવાના',
                DELIVERED: 'વિતરિત',
                CANCELLED: 'રદ'
            },
            viewModal: {
                title: 'ઓર્ડરની વિગતો',
                subtitle: 'ઓર્ડર ટ્રેકિંગ',
                details: 'વિગતો',
                customer: 'ગ્રાહક',
                items: 'પ્રોડક્ટ્સ',
                summary: 'ચુકવણી',
                changeStatus: 'સ્થિતિ',
                tracking: 'ટાઇમલાઇન',
                downloadInvoice: 'ઇનવોઇસ ડાઉનલોડ કરો'
            }
        }
    };

    const t = translations[language];

    useEffect(() => {
        fetchOrders(page, debouncedSearch, statusFilter);
        // Mock socket.io connection logic
        const interval = setInterval(() => {
            setIsLive(prev => !prev);
            setTimeout(() => setIsLive(true), 100);
        }, 5000);
        return () => clearInterval(interval);
    }, [page, statusFilter]);

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
        fetchOrders(1, debouncedSearch, statusFilter);
    }, [debouncedSearch]);

    const fetchOrders = async (currentPage = page, searchQuery = debouncedSearch, status = statusFilter) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: searchQuery,
                status: status
            });
            const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data || []);
                if (data.pagination) setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, newMetafields = null) => {
        try {
            setUpdatingStatus(true);
            const payload = { status: newStatus };
            if (newMetafields) payload.metafields = newMetafields;

            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, metafields: data.data.metafields || o.metafields } : o));
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus, metafields: data.data.metafields || prev.metafields }));
                }
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this order? This action cannot be undone.')) return;
        try {
            await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
            fetchOrders();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredOrders = orders; // Now using server-paginated list directly

    const statsData = useMemo(() => {
        const pending = orders.filter(o => o.status === 'PENDING').length;
        const delivered = orders.filter(o => o.status === 'DELIVERED').length;
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        return { total: orders.length, pending, delivered, revenue };
    }, [orders]);

    const StatusBadge = ({ status }) => {
        const config = {
            PENDING: 'bg-[#ffea8a] text-[#8a6116] border-[#e6d074]',
            PROCESSING: 'bg-[#e2f1fe] text-[#004e9c] border-[#b0dcfb]',
            SHIPPED: 'bg-[#e4f5e1] text-[#1c6c0d] border-[#c0e6bb]',
            DELIVERED: 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]',
            CANCELLED: 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'
        };
        const styling = config[status] || 'bg-gray-100 text-gray-800 border-gray-200';
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styling}`}>
                {t.status[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 font-sans">
            <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#202223]">{t.pageTitle}</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white rounded-md border border-[#c9cccf] overflow-hidden shadow-sm">
                            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#f4f6f8] text-[#202223]' : 'text-[#6d7175] hover:bg-[#fafbfb]'}`}>
                                <LayoutList size={18} />
                            </button>
                            <div className="w-px bg-[#c9cccf]" />
                            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#f4f6f8] text-[#202223]' : 'text-[#6d7175] hover:bg-[#fafbfb]'}`}>
                                <LayoutGrid size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-white border border-[#c9cccf] rounded-md px-3 py-1.5 shadow-sm">
                            <Languages size={16} className="text-[#6d7175]" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm text-[#202223] font-medium cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="gu">ગુજરાતી</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-[#c9cccf] px-2 flex overflow-x-auto bg-white">
                         {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-[3px] transition-colors focus:outline-none ${statusFilter === status ? 'border-[#008060] text-[#008060]' : 'border-transparent text-[#6d7175] hover:text-[#202223] hover:bg-[#fafbfb]'}`}
                            >
                                {status === 'ALL' ? 'All' : t.status[status]}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-[#c9cccf] bg-white">
                        <div className="relative max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input 
                                type="text" 
                                placeholder={t.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] transition-shadow shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Order List/Grid */}
                    {loading ? (
                         <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#008060]" /></div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-24 text-center bg-white">
                            <p className="text-[#6d7175] text-base">{t.searchPlaceholder.split('.')[0]}...</p>
                            <p className="text-[#8c9196] text-sm mt-1">Try changing the filters or search term</p>
                        </div>
                    ) : viewMode === 'list' ? (
                         <div className="overflow-x-auto bg-white">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">{t.table.order}</th>
                                        <th className="px-5 py-3 font-semibold">Date</th>
                                        <th className="px-5 py-3 font-semibold">{t.table.customer}</th>
                                        <th className="px-5 py-3 font-semibold">{t.table.status}</th>
                                        <th className="px-5 py-3 font-semibold text-right">{t.table.total}</th>
                                        <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ebebeb]">
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => { setSelectedOrder(order); setShowViewModal(true); }}>
                                            <td className="px-5 py-4 font-semibold text-[#202223]">
                                                #{order.id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-5 py-4 text-[#6d7175]">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-[#202223]">
                                                {order.customerName}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-5 py-4 text-right text-[#202223]">
                                                ₹{order.total.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                 <button onClick={() => handleDelete(order.id)} className="text-[#8c9196] hover:text-[#d82c0d] p-1.5 rounded-md hover:bg-[#feeeee] transition-colors">
                                                     <Trash2 size={16} />
                                                 </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    ) : (
                        // Grid Mode
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-[#f4f6f8]">
                            {filteredOrders.map(order => (
                                 <div key={order.id} className="bg-white border border-[#c9cccf] rounded-lg p-5 shadow-sm hover:shadow transition-shadow">
                                     <div className="flex justify-between items-start mb-4">
                                         <span className="font-bold text-[#202223] text-base cursor-pointer hover:underline" onClick={() => { setSelectedOrder(order); setShowViewModal(true); }}>
                                             #{order.id.slice(-6).toUpperCase()}
                                         </span>
                                         <StatusBadge status={order.status} />
                                     </div>
                                     <div className="text-sm text-[#6d7175] mb-5 space-y-1">
                                         <p className="text-[#202223] font-medium">{order.customerName}</p>
                                         <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                     </div>
                                     <div className="flex justify-between items-center pt-4 border-t border-[#ebebeb]">
                                         <span className="font-semibold text-[#202223]">₹{order.total.toLocaleString()}</span>
                                         <div className="flex gap-2">
                                              <button onClick={() => { setSelectedOrder(order); setShowViewModal(true); }} className="p-2 text-[#6d7175] hover:text-[#202223] hover:bg-[#f4f6f8] border border-transparent hover:border-[#c9cccf] rounded-md transition-all shadow-sm">
                                                 <Eye size={16} />
                                             </button>
                                             <button onClick={() => handleDelete(order.id)} className="p-2 text-[#6d7175] hover:text-[#d82c0d] hover:bg-[#feeeee] border border-transparent hover:border-[#fecaca] rounded-md transition-all shadow-sm">
                                                 <Trash2 size={16} />
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                            ))}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                            <p className="text-sm text-[#6d7175]">
                                Showing <span className="font-semibold text-[#202223]">{(page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> orders
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${page === 1 ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                                >
                                    <ChevronLeft size={16} />
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

                {/* Shopify Style View Modal */}
                <AnimatePresence>
                    {showViewModal && selectedOrder && (
                         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowViewModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                             <motion.div 
                                 initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                                 animate={{ opacity: 1, y: 0, scale: 1 }} 
                                 exit={{ opacity: 0, y: 20, scale: 0.98 }} 
                                 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                 className="relative w-full max-w-5xl bg-[#f4f6f8] rounded-xl shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden"
                             >
                                 {/* Modal Header */}
                                 <div className="px-6 py-4 bg-white border-b border-[#c9cccf] flex justify-between items-center z-10 shadow-sm">
                                     <div className="flex items-center gap-4">
                                         <h2 className="text-xl font-bold text-[#202223]">Order #{selectedOrder.id.slice(-6).toUpperCase()}</h2>
                                         <StatusBadge status={selectedOrder.status} />
                                         <span className="text-sm text-[#6d7175] hidden sm:inline-block">• {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                     </div>
                                     <button onClick={() => setShowViewModal(false)} className="text-[#6d7175] hover:text-[#202223] p-1.5 rounded-md hover:bg-[#f4f6f8] transition-colors">
                                         <X size={20} />
                                     </button>
                                 </div>

                                 {/* Modal Content */}
                                 <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                         
                                         {/* Left Column (Main Details) */}
                                         <div className="lg:col-span-2 space-y-6">
                                             
                                             {/* Products Card */}
                                             <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
                                                  <div className="px-5 py-4 border-b border-[#ebebeb]">
                                                      <h3 className="font-semibold text-[#202223]">Products ({selectedOrder.items?.length || 0})</h3>
                                                  </div>
                                                  <div className="p-5 overflow-x-auto">
                                                       <table className="w-full text-left text-sm">
                                                            <thead>
                                                                <tr className="text-[#6d7175] border-b border-[#ebebeb]">
                                                                    <th className="pb-3 font-medium">Product</th>
                                                                    <th className="pb-3 font-medium text-right">Price</th>
                                                                    <th className="pb-3 font-medium text-right">Quantity</th>
                                                                    <th className="pb-3 font-medium text-right">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-[#ebebeb]">
                                                                {selectedOrder.items?.map((item, i) => (
                                                                    <tr key={i}>
                                                                        <td className="py-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-12 h-12 bg-[#f4f6f8] rounded border border-[#e1e3e5] flex items-center justify-center flex-shrink-0">
                                                                                    {item.productImage ? (
                                                                                        <img src={item.productImage} className="w-full h-full object-cover rounded" alt="" />
                                                                                    ) : <Package className="w-6 h-6 text-[#8c9196]" />}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-medium text-[#006fbb] hover:underline cursor-pointer">{item.productName}</p>
                                                                                    <p className="text-xs text-[#6d7175] mt-0.5">SKU: IND-{i+100}</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-4 text-right text-[#202223]">₹{item.price}</td>
                                                                        <td className="py-4 text-right text-[#202223]">{item.quantity}</td>
                                                                        <td className="py-4 text-right text-[#202223] font-medium">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>

                                              {/* Financial Summary */}
                                              <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm">
                                                   <div className="px-5 py-4 border-b border-[#ebebeb]">
                                                       <h3 className="font-semibold text-[#202223]">Payment Summary</h3>
                                                   </div>
                                                   <div className="p-5 space-y-3 text-sm">
                                                       <div className="flex justify-between text-[#6d7175]">
                                                           <span>Subtotal</span>
                                                           <span className="text-[#202223]">₹{selectedOrder.total.toLocaleString()}</span>
                                                       </div>
                                                       <div className="flex justify-between text-[#6d7175]">
                                                           <span>Shipping</span>
                                                           <span className="text-[#202223]">₹0</span>
                                                       </div>
                                                       <div className="flex justify-between text-[#6d7175]">
                                                           <span>Tax</span>
                                                           <span className="text-[#202223]">₹0</span>
                                                       </div>
                                                       <div className="pt-4 mt-2 border-t border-[#ebebeb] flex justify-between items-center">
                                                           <span className="font-semibold text-[#202223]">Total</span>
                                                           <span className="font-bold text-[#202223] text-lg">₹{selectedOrder.total.toLocaleString()}</span>
                                                       </div>
                                                   </div>
                                                   <div className="bg-[#fafbfb] px-5 py-3 border-t border-[#ebebeb] text-[#6d7175] text-xs flex justify-between rounded-b-lg">
                                                        <span>Paid by customer</span>
                                                        <span className="font-medium text-[#202223]">₹{selectedOrder.total.toLocaleString()}</span>
                                                   </div>
                                              </div>

                                              {/* Metafields Card */}
                                              <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                  <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                          <Tag size={16} className="text-[#008060]" />
                                                          <h3 className="font-semibold text-[#202223]">Order Metafields</h3>
                                                      </div>
                                                      {updatingStatus && <Loader2 size={14} className="animate-spin text-[#008060]" />}
                                                  </div>
                                                  <div className="p-5 pt-0">
                                                      <MetafieldValueEditor 
                                                          ownerType="ORDERS"
                                                          value={selectedOrder.metafields || []}
                                                          onChange={(newMetafields) => handleUpdateStatus(selectedOrder.id, selectedOrder.status, newMetafields)}
                                                      />
                                                  </div>
                                              </div>
                                         </div>

                                         {/* Right Column (Customer & Operations) */}
                                         <div className="space-y-6">
                                              
                                              {/* Fulfillment Action */}
                                              <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-5">
                                                  <h3 className="font-semibold text-[#202223] mb-3 text-sm">Fulfillment Status</h3>
                                                  <select 
                                                      disabled={updatingStatus}
                                                      value={selectedOrder.status}
                                                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                                                      className="w-full bg-white border border-[#c9cccf] text-[#202223] text-sm rounded-md focus:ring-1 focus:ring-[#008060] focus:border-[#008060] block p-2 outline-none shadow-inner transition-shadow cursor-pointer"
                                                  >
                                                      {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                                                          <option key={s} value={s}>{t.status[s]}</option>
                                                      ))}
                                                  </select>
                                              </div>

                                              {/* Customer Profile */}
                                              <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm flex flex-col">
                                                  <div className="px-5 py-4 border-b border-[#ebebeb]">
                                                      <h3 className="font-semibold text-[#202223]">Customer</h3>
                                                  </div>
                                                  <div className="p-5 text-sm flex-1">
                                                      <div className="mb-4">
                                                          <p className="font-medium text-[#006fbb] hover:underline cursor-pointer">{selectedOrder.customerName}</p>
                                                          <p className="text-[#6d7175] mt-1">{selectedOrder.customerEmail || 'No email provided'}</p>
                                                          <p className="text-[#6d7175] mt-1">{selectedOrder.customerPhone || 'No phone number'}</p>
                                                      </div>
                                                      <div className="pt-4 border-t border-[#ebebeb]">
                                                          <div className="flex items-center justify-between mb-2">
                                                              <h4 className="font-medium text-[#202223]">Shipping address</h4>
                                                          </div>
                                                          <p className="text-[#6d7175] whitespace-pre-wrap leading-relaxed">{selectedOrder.address || 'No shipping address provided.'}</p>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* Invoice Download */}
                                              <button 
                                                  onClick={() => alert('Downloading Invoice PDF...')}
                                                  className="w-full bg-white border border-[#c9cccf] text-[#202223] hover:bg-[#fafbfb] active:bg-[#f4f6f8] font-medium rounded-md px-4 py-2.5 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                                              >
                                                  <Download size={16} />
                                                  Download invoice
                                              </button>
                                         </div>
                                     </div>
                                 </div>
                             </motion.div>
                         </div>
                    )}
                </AnimatePresence>

            </div>
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
    );
}
