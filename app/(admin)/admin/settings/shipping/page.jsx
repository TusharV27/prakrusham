'use client';

import React, { useState, useEffect } from 'react';
import {
    Truck,
    Plus,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
    Package,
    AlertCircle,
    Loader2,
    MapPin,
    Globe,
    Tag,
    Info,
    Store,
    Settings,
    ArrowLeft,
    FileText,
    Layout,
    Split,
    UserCheck,
    Navigation,
    Calendar,
    Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ShippingPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState([]);
    const [packages, setPackages] = useState([]);
    const [localDelivery, setLocalDelivery] = useState(null);
    const [localPickup, setLocalPickup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Accordion / Section Expand States
    const [expandedSections, setExpandedSections] = useState({
        profiles: true,
        packages: false,
        labels: false,
        expectations: false,
        routing: false,
        accounts: false
    });

    // Modal & Form States
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [packageForm, setPackageForm] = useState({
        name: '', width: '', height: '', length: '',
        weight: '0', unit: 'in', weightUnit: 'lb', isDefault: false
    });
    const [savingPackage, setSavingPackage] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [profilesRes, deliveryRes, pickupRes, packagesRes] = await Promise.all([
                fetch('/api/admin/shipping/profiles'),
                fetch('/api/admin/shipping/local-delivery'),
                fetch('/api/admin/shipping/local-pickup'),
                fetch('/api/admin/shipping/packages')
            ]);

            const profilesData = await profilesRes.json();
            const deliveryData = await deliveryRes.json();
            const pickupData = await pickupRes.json();
            const packagesData = await packagesRes.json();

            if (profilesData.success) setProfiles(profilesData.data);
            if (deliveryData.success) setLocalDelivery(deliveryData.data);
            if (pickupRes.ok && pickupData.success) setLocalPickup(pickupData.data);
            if (packagesData.success) setPackages(packagesData.data);

        } catch (err) {
            setError('Failed to fetch shipping data');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSavePackage = async () => {
        try {
            setSavingPackage(true);
            const res = await fetch('/api/admin/shipping/packages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(packageForm)
            });
            const data = await res.json();
            if (data.success) {
                setPackages([data.data, ...packages.map(p => data.data.isDefault ? { ...p, isDefault: false } : p)]);
                setIsPackageModalOpen(false);
                setPackageForm({ name: '', width: '', height: '', length: '', weight: '0', unit: 'in', weightUnit: 'lb', isDefault: false });
            }
        } catch (err) {
            alert('Failed to save package');
        } finally {
            setSavingPackage(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#008060]" /></div>;

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6]/50 font-sans pb-40">
            <div className="max-w-[700px] mx-auto p-4 md:p-8 space-y-4">

                {/* Header (Simplified to match image) */}
                <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => router.push('/admin/settings')} className="text-[#6d7175] hover:text-[#202223] transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-[20px] font-bold text-[#202223]">Shipping and delivery</h1>
                </div>

                {/* Main Shipping Card (Accordions) */}
                <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm divide-y divide-[#ebebeb] overflow-hidden">
                    
                    {/* Header Item */}
                    <div className="p-4 flex items-center gap-3 bg-white">
                        <Truck size={17} className="text-[#6d7175]" />
                        <h2 className="text-[13px] font-semibold text-[#202223]">Shipping</h2>
                    </div>

                    {/* Shipping Profiles Section */}
                    <div className="bg-white">
                        <div 
                            onClick={() => toggleSection('profiles')}
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#f9fafb] transition-colors"
                        >
                            <div className="space-y-0.5">
                                <h3 className="text-[13px] font-semibold text-[#202223]">Shipping profiles</h3>
                                <div className="flex items-center gap-1.5 text-[12px] text-[#6d7175] font-medium">
                                    Manage shipping rates and zones for your products <Info size={13} className="opacity-60" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] text-[#6d7175] font-medium">{profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}</span>
                                <ChevronRight size={16} className={`text-[#6d7175] transition-transform ${expandedSections.profiles ? 'rotate-90' : ''}`} />
                            </div>
                        </div>

                        {expandedSections.profiles && (
                            <div className="px-4 pb-4 space-y-3">
                                <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-4 py-2 bg-[#f9fafb] border-b border-[#ebebeb]">
                                        <span className="text-[11px] font-semibold text-[#6d7175]">Store default</span>
                                    </div>
                                    <div className="divide-y divide-[#ebebeb]">
                                        {/* General Profile Row */}
                                        <Link href={`/admin/settings/shipping/${profiles.find(p => p.isDefault)?.id || ''}`} className="p-4 flex items-center justify-between hover:bg-[#f9fafb] transition-colors group">
                                            <div className="flex items-center gap-6 flex-1">
                                                <span className="text-[14px] font-bold text-[#202223] shrink-0">General profile</span>
                                                <div className="flex items-center gap-6 text-[12px] text-[#6d7175] font-medium">
                                                    <span className="flex items-center gap-1.5"><Package size={16} className="text-[#6d7175]" /> All products</span>
                                                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#6d7175]" /> 0 of 3 locations</span>
                                                    <span className="flex items-center gap-1.5"><Globe size={16} className="text-[#6d7175]" /> 0 zones</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-all" />
                                        </Link>

                                        {/* Custom Profiles List */}
                                        {profiles.filter(p => !p.isDefault).map(p => (
                                            <Link key={p.id} href={`/admin/settings/shipping/${p.id}`} className="p-4 flex items-center justify-between hover:bg-[#f9fafb] transition-colors group">
                                                <div className="flex items-center gap-6 flex-1">
                                                    <span className="text-[14px] font-bold text-[#202223] shrink-0 truncate max-w-[150px]">{p.name}</span>
                                                    <div className="flex items-center gap-6 text-[12px] text-[#6d7175] font-medium">
                                                        <span className="flex items-center gap-1.5"><Tag size={16} className="text-[#6d7175]" /> {p.productCount || 0} products</span>
                                                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#6d7175]" /> 0 of 3 locations</span>
                                                        <span className="flex items-center gap-1.5"><Globe size={16} className="text-[#6d7175]" /> {p.zones?.length || 0} zones</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-all" />
                                            </Link>
                                        ))}
                                        
                                        {/* Add Custom Profile Button */}
                                        <Link href="/admin/settings/shipping/new" className="w-full text-left p-4 text-[14px] font-bold text-[#202223] hover:bg-[#f9fafb] transition-colors flex items-center gap-3">
                                            <div className="w-6 h-6 bg-white border border-[#d1d1d1] rounded-full flex items-center justify-center">
                                                <Plus size={12} strokeWidth={3} className="text-[#6d7175]" />
                                            </div>
                                            Add custom profile
                                        </Link>
                                    </div>
                                </div>

                                {/* Split Shipping Banner */}
                                <div className="p-3 border border-[#ebebeb] rounded-lg flex items-center justify-between bg-white hover:bg-[#f9fafb] cursor-pointer transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] font-medium text-[#202223]">Manage <span className="underline underline-offset-2">split shipping</span></span>
                                    </div>
                                    <span className="bg-[#e4e4e6] text-[#202223] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">On</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Packages Section */}
                    {['Packages', 'Shipping labels', 'Delivery expectations', 'Order routing', 'Carrier accounts'].map((item) => {
                        const key = item.toLowerCase().replace(' ', '');
                        const val = key === 'packages' ? `${packages.length} box` : (key === 'deliveryexpectations' ? 'Automated dates' : (key === 'orderrouting' ? '3 rules' : 'None'));
                        
                        return (
                            <div key={item} className="bg-white">
                                <div 
                                    onClick={() => toggleSection(key)}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#f9fafb] transition-colors"
                                >
                                    <span className="text-[13px] font-semibold text-[#202223]">{item}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] text-[#6d7175] font-medium">{val}</span>
                                        <ChevronRight size={16} className={`text-[#6d7175] transition-transform ${expandedSections[key] ? 'rotate-90' : ''}`} />
                                    </div>
                                </div>
                                {expandedSections[key] && (
                                    <div className="px-4 pb-4">
                                        <div className="p-4 border border-[#ebebeb] rounded-lg border-dashed text-center text-[12px] text-[#6d7175] font-medium">
                                            Manage {item.toLowerCase()} settings here.
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Additional Delivery Methods Section */}
                <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-3 bg-white">
                        <h2 className="text-[13px] font-semibold text-[#202223]">Additional delivery methods</h2>
                    </div>
                    <div className="divide-y divide-[#ebebeb] border-t border-[#ebebeb]">
                        <Link href="/admin/settings/shipping/local-delivery" className="p-4 flex items-center justify-between hover:bg-[#f9fafb] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 flex items-center justify-center text-[#6d7175]">
                                    <Navigation size={18} />
                                </div>
                                <span className="text-[13px] font-medium text-[#202223]">Local delivery</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${localDelivery?.isActive ? 'bg-[#e7f4f0] text-[#008060]' : 'bg-[#e4e4e6] text-[#202223]'}`}>
                                    {localDelivery?.isActive ? 'On' : 'Off'}
                                </span>
                                <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </Link>
                        <Link href="/admin/settings/shipping/local-pickup" className="p-4 flex items-center justify-between hover:bg-[#f9fafb] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 flex items-center justify-center text-[#6d7175]">
                                    <Store size={18} />
                                </div>
                                <span className="text-[13px] font-medium text-[#202223]">Pickup in store</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${localPickup?.isActive ? 'bg-[#e7f4f0] text-[#008060]' : 'bg-[#e4e4e6] text-[#202223]'}`}>
                                    {localPickup?.isActive ? 'On' : 'Off'}
                                </span>
                                <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-all" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center gap-3 bg-white">
                        <h2 className="text-[13px] font-semibold text-[#202223]">Documents</h2>
                    </div>
                    <div className="divide-y divide-[#ebebeb] border-t border-[#ebebeb]">
                        <div className="p-4 flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer transition-colors group">
                            <span className="text-[13px] font-medium text-[#202223] ml-1">Sender name on shipping labels</span>
                            <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-[#f9fafb] cursor-pointer transition-colors group">
                            <span className="text-[13px] font-medium text-[#202223] ml-1">Packing slip template</span>
                            <ChevronRight size={16} className="text-[#6d7175] group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </div>
                </div>

                {/* Delivery Customizations Section */}
                <div className="space-y-3">
                    <div className="px-1">
                        <h2 className="text-[13px] font-semibold text-[#202223]">Delivery customizations</h2>
                        <p className="text-[11px] text-[#6d7175] font-medium mt-1 leading-relaxed">
                            Customizations control how delivery options appear to buyers at checkout. You can hide, reorder, and rename delivery options.
                        </p>
                    </div>
                    <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm p-4">
                        <button className="w-full text-left p-3 text-[13px] font-medium text-[#202223] hover:bg-[#f9fafb] transition-colors flex items-center gap-2 border border-[#ebebeb] rounded-lg">
                            <div className="w-5 h-5 bg-gray-100 border border-[#d1d1d1] rounded-full flex items-center justify-center">
                                <Plus size={10} strokeWidth={4} />
                            </div>
                            Add delivery customization
                        </button>
                    </div>
                </div>

                {/* Custom Order Fulfillment Section */}
                <div className="space-y-3 pb-20">
                    <div className="px-1">
                        <h2 className="text-[13px] font-semibold text-[#202223]">Custom order fulfillment</h2>
                        <p className="text-[11px] text-[#6d7175] font-medium mt-1 leading-relaxed">
                            Add an email for a custom fulfillment service that fulfills orders for you
                        </p>
                    </div>
                    <div className="bg-white border border-[#ebebeb] rounded-xl shadow-sm p-4">
                        <button className="w-full text-left p-3 text-[13px] font-medium text-[#202223] hover:bg-[#f9fafb] transition-colors flex items-center gap-2 border border-[#ebebeb] rounded-lg">
                            <div className="w-5 h-5 bg-gray-100 border border-[#d1d1d1] rounded-full flex items-center justify-center">
                                <Plus size={10} strokeWidth={4} />
                            </div>
                            Add fulfillment service
                        </button>
                    </div>
                </div>
            </div>

            {/* Existing Package Modal logic remains for functionality */}
        </div>
    );
}
