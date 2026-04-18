'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingBag,
    DollarSign,
    Package,
    ArrowUpRight,
    Clock,
    Plus,
    Activity,
    Zap,
    Tractor,
    Globe,
    ChevronRight,
    Star,
    Layers,
    MousePointer2,
    Languages
} from 'lucide-react';

export default function DashboardPage() {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        customerCount: 0,
        farmerCount: 0,
        dispatchCount: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('en'); // en | hi | gu

    // ---------------- TRANSLATIONS ----------------
    const translations = {
        en: {
            executivePulse: 'Executive Pulse',
            platform: 'Admin',
            core: 'Dashboard',
            pageDesc: 'Monitoring the Prakrushi agricultural ecosystem in real-time.',
            executiveSummary: 'Executive Summary',
            networkRevenue: 'Network Revenue',
            dispatchment: 'Dispatchment',
            certifiedFarmers: 'Certified Farmers',
            marketReach: 'Market Reach',
            totalRevenue: 'Total Revenue',
            totalCustomers: 'Total Customers',
            revenueOverview: 'Revenue Overview (Last 7 Days)',
            trend: 'Trend',
            highVelocityInventory: 'High-Velocity Inventory',
            operationalBenchmarks: 'Operational Benchmarks',
            component: 'Component',
            unitPrice: 'Unit Price',
            stockVelocity: 'Stock Velocity',
            context: 'Context',
            globalStream: 'Global',
            stream: 'Stream',
            liveTransmission: 'Live Transmission',
            monitorFullAudit: 'Monitor Full Audit',
            ago: 'ago',
            states: 'States'
        },
        hi: {
            executivePulse: 'कार्यकारी पल्स',
            platform: 'एडमिन',
            core: 'डैशबोर्ड',
            pageDesc: 'वास्तविक समय में प्राकृषि कृषि पारिस्थितिकी तंत्र की निगरानी।',
            executiveSummary: 'कार्यकारी सारांश',
            networkRevenue: 'नेटवर्क राजस्व',
            dispatchment: 'प्रेषण',
            certifiedFarmers: 'प्रमाणित किसान',
            marketReach: 'बाजार पहुंच',
            totalRevenue: 'कुल राजस्व',
            totalCustomers: 'कुल ग्राहक',
            revenueOverview: 'राजस्व अवलोकन (पिछले 7 दिन)',
            trend: 'रुझान',
            highVelocityInventory: 'हाई-वेलोसिटी इन्वेंट्री',
            operationalBenchmarks: 'परिचालन बेंचमार्क',
            component: 'घटक',
            unitPrice: 'इकाई मूल्य',
            stockVelocity: 'स्टॉक वेग',
            context: 'संदर्भ',
            globalStream: 'ग्लोबल',
            stream: 'स्ट्रीम',
            liveTransmission: 'लाइव ट्रांसमिशन',
            monitorFullAudit: 'पूर्ण ऑडिट देखें',
            ago: 'पहले',
            states: 'राज्य'
        },
        gu: {
            executivePulse: 'એક્ઝિક્યુટિવ પલ્સ',
            platform: 'એડમિન',
            core: 'ડેશબોર્ડ',
            pageDesc: 'રીઅલ-ટાઇમમાં પ્રકૃષિ કૃષિ ઇકોસિસ્ટમનું નિરીક્ષણ.',
            executiveSummary: 'એક્ઝિક્યુટિવ સારાંશ',
            networkRevenue: 'નેટવર્ક આવક',
            dispatchment: 'ડિસ્પેચમેન્ટ',
            certifiedFarmers: 'પ્રમાણિત ખેડૂતો',
            marketReach: 'બજાર પહોંચ',
            totalRevenue: 'કુલ આવક',
            totalCustomers: 'કુલ ગ્રાહકો',
            revenueOverview: 'આવક ઝાંખી (છેલ્લા 7 દિવસ)',
            trend: 'ટ્રેન્ડ',
            highVelocityInventory: 'હાઇ-વેલોસિટી ઇન્વેન્ટરી',
            operationalBenchmarks: 'ઓપરેશનલ બેન્ચમાર્ક',
            component: 'ઘટક',
            unitPrice: 'એકમ કિંમત',
            stockVelocity: 'સ્ટોક વેલોસિટી',
            context: 'સંદર્ભ',
            globalStream: 'ગ્લોબલ',
            stream: 'સ્ટ્રીમ',
            liveTransmission: 'લાઇવ ટ્રાન્સમિશન',
            monitorFullAudit: 'પૂર્ણ ઓડિટ મોનિટર કરો',
            ago: 'પહેલાં',
            states: 'રાજ્યો'
        }
    };

    const t = translations[language];

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                // Fetch products and stats in parallel
                const [prodRes, statsRes] = await Promise.all([
                    fetch('/api/products?limit=5'),
                    fetch('/api/admin/dashboard/stats')
                ]);
                
                const prodData = await prodRes.json();
                const statsData = await statsRes.json();
                
                setProducts(prodData?.products || prodData?.data || []);
                
                if (statsData.success) {
                    setStats(statsData.stats);
                    setChartData(statsData.chartData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const formatCurrency = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
        return `₹${val}`;
    };

    const statsConfig = [
        { label: t.totalRevenue, value: formatCurrency(stats.totalRevenue), trend: '+12%', icon: <DollarSign /> },
        { label: t.totalCustomers, value: stats.customerCount.toString(), trend: '+18%', icon: <Users /> },
        { label: t.certifiedFarmers, value: stats.farmerCount.toString(), trend: '+4%', icon: <Tractor /> },
        { label: t.dispatchment, value: stats.dispatchCount.toString(), trend: '+8%', icon: <Package /> },
    ];

    const activities = [
        { user: 'Rahul Kumar', action: language === 'en' ? 'Order #8241 Confirmed' : language === 'hi' ? 'ऑर्डर #8241 की पुष्टि हुई' : 'ઓર્ડર #8241 કન્ફર્મ થયો', time: `2m ${t.ago}`, type: 'order' },
        { user: 'Sita Devi', action: language === 'en' ? 'Kisan Certification Approved' : language === 'hi' ? 'किसान प्रमाणन स्वीकृत' : 'કિસાન પ્રમાણપત્ર મંજૂર', time: `15m ${t.ago}`, type: 'farmer' },
        { user: 'Kisan Mart', action: language === 'en' ? 'Stock Injection: Organic Wheat' : language === 'hi' ? 'स्टॉक इंजेक्शन: जैविक गेहूं' : 'સ્ટોક ઇન્જેક્શન: ઓર્ગેનિક ઘઉં', time: `1h ${t.ago}`, type: 'inventory' },
        { user: 'Amit Shah', action: language === 'en' ? 'Payout Request Initiated' : language === 'hi' ? 'पेआउट अनुरोध शुरू किया गया' : 'પેઆઉટ વિનંતી શરૂ કરવામાં આવી', time: `3h ${t.ago}`, type: 'payout' },
    ];

    return (
        <div className="min-h-screen bg-[#F4F6F8] p-4 md:p-8 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-xl font-bold text-gray-900">
                            {t.platform} {t.core}
                        </h1>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        {/* Language Switcher */}
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm hover:bg-gray-50 transition-colors h-8">
                            <Languages size={14} className="text-gray-600" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent outline-none text-sm text-gray-800 h-full cursor-pointer focus:ring-0"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="gu">ગુજરાતી</option>
                            </select>
                        </div>

                        {/* <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors h-8">
                            <Plus className="w-4 h-4" />
                            {t.executiveSummary}
                        </button> */}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsConfig.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <div className="p-1 rounded bg-gray-100 text-gray-600">
                                    {React.cloneElement(stat.icon, { className: 'w-4 h-4' })}
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                                {stat.trend.startsWith('+') ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                                <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>{stat.trend}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Sales Graph Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">{t.revenueOverview}</h2>
                            <p className="text-xs text-gray-500 mt-1">Real-time performance metrics</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                <Activity size={12} />
                                LIVE
                             </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full relative group">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-gray-50 rounded-lg">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <RevenueChart data={chartData} />
                        )}
                    </div>
                </motion.div>

                {/* Main Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Performance */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-gray-900">{t.highVelocityInventory}</h2>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200">
                                        <th className="px-5 py-2.5 text-[13px] font-semibold text-gray-600">{t.component}</th>
                                        <th className="px-5 py-2.5 text-[13px] font-semibold text-gray-600">{t.unitPrice}</th>
                                        <th className="px-5 py-2.5 text-[13px] font-semibold text-gray-600">{t.stockVelocity}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <tr key={i}><td colSpan={3} className="px-5 py-4 h-14 animate-pulse bg-gray-50/30"></td></tr>
                                        ))
                                    ) : products.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                                                        {p.images?.[0] ? <img src={p.images[0].url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />}
                                                    </div>
                                                    <div className="font-medium text-gray-900 text-sm">{p.name?.[language] || p.name?.en || p.name || 'Untitled'}</div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-gray-700 text-sm">₹{p.price}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gray-800 rounded-full" style={{ width: '65%' }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">65%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Live Transmission / Activity Stream */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900">{t.liveTransmission}</h2>
                        </div>

                        <div className="flex-1 p-5 space-y-5">
                            {activities.map((a, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold text-xs border border-gray-200">
                                        {a.user.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900"><span className="font-medium">{a.user}</span></p>
                                        <p className="text-sm text-gray-500 mt-0.5">{a.action}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-xs text-gray-500">
                                        {a.time}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-200">
                            <button className="w-full py-1.5 px-4 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm text-center flex justify-center items-center gap-1">
                                {t.monitorFullAudit} <ArrowRightIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowRightIcon(props) {
    return <ChevronRight {...props} />
}

function RevenueChart({ data }) {
    if (!data || data.length === 0) return (
        <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm italic">
            No revenue data available for this period.
        </div>
    );

    const maxVal = Math.max(...data.map(d => d.value), 100);
    const height = 250;
    const width = 1000;
    const padding = 40;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - (d.value / maxVal) * (height - padding * 2) - padding;
        return { x, y, value: d.value, day: d.day };
    });

    const pathData = points.reduce((acc, p, i) => 
        i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, ''
    );

    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="w-full h-full relative cursor-crosshair">
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14532d" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#14532d" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                    <line 
                        key={i} 
                        x1={padding} 
                        y1={padding + (height - padding * 2) * p} 
                        x2={width - padding} 
                        y2={padding + (height - padding * 2) * p} 
                        stroke="#f1f5f9" 
                        strokeWidth="1" 
                    />
                ))}

                {/* Area Fill */}
                <motion.path 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    d={areaData} 
                    fill="url(#areaGradient)" 
                />

                {/* Path Shadow (Subtle) */}
                <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d={pathData} 
                    fill="none" 
                    stroke="#000" 
                    strokeWidth="6" 
                    transform="translate(0, 2)"
                />

                {/* Main Path Line */}
                <motion.path 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={pathData} 
                    fill="none" 
                    stroke="#14532d" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <g key={i} className="group/point">
                        {/* Hover Vertical Line */}
                        <line 
                            x1={p.x} 
                            y1={padding} 
                            x2={p.x} 
                            y2={height - padding} 
                            stroke="#14532d" 
                            strokeWidth="1" 
                            strokeDasharray="4 4"
                            className="opacity-0 group-hover/point:opacity-30 transition-opacity"
                        />
                        
                        <motion.circle 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + (i * 0.1) }}
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            fill="#fff" 
                            stroke="#14532d" 
                            strokeWidth="2.5" 
                            className="filter drop-shadow-sm cursor-pointer"
                        />

                        {/* Better Tooltip */}
                        <foreignObject 
                            x={p.x - 40} 
                            y={p.y - 50} 
                            width="80" 
                            height="40" 
                            className="opacity-0 group-hover/point:opacity-100 transition-all pointer-events-none"
                        >
                            <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm font-black rounded-lg py-1.5 text-center shadow-xl border border-white/10">
                                ₹{p.value.toLocaleString()}
                            </div>
                        </foreignObject>
                    </g>
                ))}

                {/* Day Labels */}
                {points.map((p, i) => (
                    <text 
                        key={i} 
                        x={p.x} 
                        y={height - 10} 
                        textAnchor="middle" 
                        fill="#94a3b8" 
                        className="text-[11px] font-bold uppercase tracking-widest"
                    >
                        {p.day}
                    </text>
                ))}
            </svg>
        </div>
    );
}