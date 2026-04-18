'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  MapPin,
  Package,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Heart,
  Settings,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  IndianRupee,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function ProfilePage() {
  const { user, logout, login, saveAddress, selectArea, selectedArea } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  const remoteDebug = (msg) => {
    fetch('/api/browser-debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: `[VERSION 12] ${msg}` })
    }).catch(() => {});
  };

  if (typeof window !== 'undefined') {
    remoteDebug("PAGE LOADED");
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ type: 'Home', phoneNumber: '', pincode: '', houseNumber: '', landmark: '', city: 'Surat', state: 'Gujarat' });

  // Translation Helper
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

  const getInitials = (name) => {
    const translatedName = getTranslated(name);
    if (!translatedName || typeof translatedName !== 'string') return "?";
    return translatedName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Fresh Fetch from DB on Mount
  useEffect(() => {
    if (!user?.id && !user?.phone) return;
    
    const loadProfile = async () => {
      try {
        const res = await fetch(
          user?.id ? `/api/profile?userId=${user.id}` : `/api/profile?phone=${encodeURIComponent(user.phone)}`
        );
        const data = await res.json();
        if (data.success && data.user) {
          // Update global state and localStorage
          login(data.user);
          remoteDebug("SUCCESS: Profile synced with DB");
        }
      } catch (e) { console.error('Profile Load Err:', e); }
      finally { setIsLoadingProfile(false); }
    };
    loadProfile();
  }, [user?.id, user?.phone]);

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch Orders
  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingOrders(true);
    fetch(`/api/customers/${user.id}/orders`)
      .then(res => res.ok ? res.json() : { orders: [] })
      .then(data => setOrders(data.orders || data.data || []))
      .catch(e => console.error('Orders Fetch Error:', e))
      .finally(() => setIsLoadingOrders(false));
  }, [user?.id]);

  // Fetch Addresses reactively (re-fetches when a new address is selected globally!)
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === 'addresses' || activeTab === 'dashboard') {
      setIsLoadingAddresses(true);
      fetch(`/api/customers/addresses?userId=${user.id}`)
        .then(res => res.ok ? res.json() : { addresses: [] })
        .then(data => setAddresses(data.addresses || []))
        .catch(e => console.error('Addresses Fetch Error:', e))
        .finally(() => setIsLoadingAddresses(false));
    }
  }, [user?.id, activeTab, selectedArea]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newName = formData.get('name');
    const newPhone = formData.get('phone');
    const newEmail = formData.get('email');

    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: { ...user.name, [language]: newName },
          phone: newPhone,
          email: newEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user);
        alert('Profile updated successfully!');
      }
    } catch (e) { alert('Failed to update profile'); }
    finally { setIsUpdatingProfile(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    remoteDebug("SUBMIT TRIGGERED");
    setIsSavingAddress(true);
    
    try {
      if (!user?.id) {
        remoteDebug("ERROR: NO USER ID");
        throw new Error("No User Session");
      }

      const isEditing = !!addressForm.id;
      const url = isEditing ? `/api/customers/addresses/${addressForm.id}` : "/api/customers/addresses";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addressForm,
          userId: user.id
        })
      });

      const data = await res.json();
      remoteDebug(`SERVER RESPONSE: ${JSON.stringify(data)}`);

      if (data.success) {
        alert("ADDRESS SAVED SUCCESSFULLY!");
        window.location.reload(); 
      } else {
        if (data.code === 'USER_NOT_FOUND') {
          alert('Session Expired: Please Sign Out and Sign In again!');
          logout();
          router.push('/');
        } else {
          alert("SERVER ERROR: " + (data.message || data.error || "Unknown"));
        }
      }
    } catch (e) {
      remoteDebug(`CATCH ERROR: ${e.message}`);
      alert('Network Error: Could not connect to server.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/customers/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    } catch (e) { alert('Failed to delete address'); }
  };

   const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`/api/customers/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true })
      });
      if (res.ok) {
        setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
        
        // Find the specific address to update global selectedArea
        const targetAddress = addresses.find(a => a.id === id);
        if (targetAddress) {
           selectArea({
             ...targetAddress,
             areaName: targetAddress.addressLine1, // Compatibility mapping
             pincode: targetAddress.pincode
           });
           alert('Address set as default and active for shopping!');
        }
      }
    } catch (e) { alert('Failed to set default'); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fbfcfa] pt-[72px] pb-20">
      
      {/* ─── CINEMATIC HERO ─── */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-80">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14532d] via-[#166534] to-[#15803d]" />
        <div className="absolute inset-0 bg-[url('/grid-white.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbfcfa] to-transparent" />
        
        <div className="mx-auto flex h-full max-w-[1440px] items-end px-4 sm:px-10 lg:px-16 pb-6 lg:pb-8">
          <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="group relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white text-2xl font-black text-[#14532d] shadow-2xl ring-4 ring-white/30 sm:h-32 sm:w-32 sm:text-4xl sm:rounded-[32px]">
                  {getInitials(user.name)}
                </div>
                <button className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-[#14532d] shadow-lg transition-transform hover:scale-110 active:scale-95">
                  <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#14532d]/40">Verified Customer</p>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#14532d] truncate">
                  {getTranslated(user.name)}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-[#14532d]/60">
                  <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {user.phone}</span>
                  <span className="hidden sm:inline h-1 w-1 rounded-full bg-[#14532d]/20" />
                  <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {addresses.find(a => a.isDefault)?.city?.en || "No Address"}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-4">
               <div className="flex flex-col items-center gap-0.5 rounded-3xl bg-white px-6 py-3 shadow-sm border border-[#14532d]/5">
                 <span className="text-2xl font-black text-[#14532d]">{orders.length}</span>
                 <span className="text-[9px] font-black uppercase tracking-widest text-[#14532d]/40">Orders</span>
               </div>
               <div className="flex flex-col items-center gap-0.5 rounded-3xl bg-white px-6 py-3 shadow-sm border border-[#14532d]/5">
                 <span className="text-2xl font-black text-[#14532d]">0</span>
                 <span className="text-[9px] font-black uppercase tracking-widest text-[#14532d]/40">Wishlist</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 sm:mt-8 max-w-[1440px] px-4 sm:px-10 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          
          {/* Sidebar */}
          <div className="hidden lg:block sticky top-24 h-fit">
            <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <button
              onClick={logout}
              className="mt-6 flex w-full items-center gap-4 rounded-3xl border border-red-50 bg-red-50/50 px-6 py-4 text-red-500 transition-all hover:bg-red-50 hover:shadow-md group"
            >
              <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Sign Out</span>
            </button>
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 scrollbar-hide">
             {["dashboard", "orders", "addresses", "settings"].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-shrink-0 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                   activeTab === tab ? "bg-[#14532d] text-white" : "bg-white text-[#14532d]/60 border border-[#14532d]/5"
                 }`}
               >
                 {tab}
               </button>
             ))}
          </div>

          {/* Main Content Area */}
          <main className="min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* Dashboard Section */}
              {activeTab === 'dashboard' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="dashboard"
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  <div className="sm:col-span-2 lg:col-span-2 space-y-6">
                    <div className="rounded-[32px] sm:rounded-[40px] bg-[#14532d] p-6 sm:p-8 text-white shadow-xl">
                       <h2 className="text-xl sm:text-2xl font-black">Freshness Delivered!</h2>
                       <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed font-medium">Thank you for being a part of our organic community. Your support directly helps local farmers and ensures healthy food for your family.</p>
                       <Link href="/products" className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 sm:px-6 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#14532d] shadow-lg transition-transform hover:scale-105 active:scale-95">
                         Start Shopping <ChevronRight className="h-4 w-4" />
                       </Link>
                    </div>

                    <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-sm border border-[#14532d]/5">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-black text-[#14532d] uppercase tracking-tight">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 hover:text-[#14532d]">View All</button>
                      </div>
                      {orders.length > 0 ? (
                        <div className="space-y-4">
                           {orders.slice(0, 2).map(order => (
                             <div key={order.id} className="flex items-center justify-between p-4 rounded-3xl bg-[#fbfcfa] border border-[#14532d]/5">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14532d]/5 text-[#14532d]">
                                    <ShoppingBag className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[#14532d]">Order #{order.id.slice(-6).toUpperCase()}</p>
                                    <p className="text-[10px] text-[#14532d]/40 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-[#14532d]"><IndianRupee className="inline h-3 w-3" />{order.totalAmount || order.total}</span>
                                  <ChevronRight className="h-4 w-4 text-[#14532d]/20" />
                                </div>
                             </div>
                           ))}
                        </div>
                      ) : (
                        <p className="py-8 text-center text-sm font-medium text-[#14532d]/30 italic">No orders found.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[32px] sm:rounded-[40px] bg-white p-6 sm:p-8 shadow-sm border border-[#14532d]/5">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-black text-[#14532d] uppercase tracking-tight">Addresses</h3>
                        <button onClick={() => setActiveTab('addresses')} className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 hover:text-[#14532d]">Manage</button>
                      </div>
                      {addresses.length > 0 ? (
                        <div className="space-y-4">
                           {addresses.slice(0, 1).map(addr => (
                             <div key={addr.id} className="space-y-1">
                               <p className="text-[10px] font-black text-[#14532d]/40 uppercase tracking-widest">{addr.type}</p>
                               <p className="text-sm font-bold text-[#14532d] leading-relaxed line-clamp-2">{getTranslated(addr.addressLine1)}, {getTranslated(addr.city)}</p>
                               <p className="text-[10px] font-bold text-[#14532d]/60">{addr.pincode}</p>
                             </div>
                           ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-xs font-medium text-[#14532d]/30">No address saved.</p>
                      )}
                    </div>

                    <div className="rounded-[32px] sm:rounded-[40px] bg-[#f0fdf4] p-6 sm:p-8 border border-[#dcfce7]">
                      <ShieldCheck className="h-10 w-10 text-[#16a34a] mb-4" />
                      <h4 className="text-sm font-black text-[#14532d] uppercase tracking-widest">Safe & Secure</h4>
                      <p className="mt-2 text-[11px] font-bold text-[#14532d]/60 leading-relaxed">Your data is secured with world-class encryption. Shop with confidence.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Orders Section */}
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key="orders"
                  className="space-y-4"
                >
                   <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-black text-[#14532d] uppercase tracking-tight">Purchase History</h2>
                      <div className="flex gap-2">
                        <button className="rounded-2xl border-2 border-[#14532d]/10 bg-white px-5 py-2 text-[10px] font-black text-[#14532d]">ALL</button>
                        <button className="rounded-2xl border-2 border-transparent bg-white px-5 py-2 text-[10px] font-black text-[#14532d]/40">PENDING</button>
                      </div>
                   </div>

                   {isLoadingOrders ? (
                      <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#14532d]" /></div>
                   ) : orders.length > 0 ? (
                     <div className="grid gap-6">
                        {orders.map(order => (
                          <div key={order.id} className="group relative overflow-hidden rounded-[40px] bg-white p-6 shadow-sm border border-[#14532d]/5 transition-all hover:shadow-xl hover:border-[#14532d]/15">
                             <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-5">
                                   <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f0fdf4] text-[#14532d] group-hover:bg-[#14532d] group-hover:text-white transition-colors">
                                      <Package className="h-8 w-8" />
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-3">
                                         <h3 className="text-lg font-black text-[#14532d]">#{order.id.slice(-8).toUpperCase()}</h3>
                                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {order.status}
                                         </span>
                                      </div>
                                      <p className="text-[12px] font-bold text-[#14532d]/40 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                   </div>
                                </div>
                                <div className="flex items-center justify-between sm:text-right sm:flex-col sm:items-end gap-2 pr-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-[#14532d]/5">
                                   <p className="text-[10px] font-black text-[#14532d]/40 uppercase tracking-[0.2em]">Total Amount</p>
                                   <p className="text-2xl font-black text-[#14532d]"><IndianRupee className="inline h-5 w-5" />{order.totalAmount || order.total}</p>
                                </div>
                             </div>
                             <div className="mt-6 flex items-center justify-between border-t border-[#14532d]/5 pt-6">
                                <div className="flex -space-x-3 overflow-hidden">
                                   {[1, 2, 3].map(i => (
                                     <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 ring-1 ring-[#14532d]/5" />
                                   ))}
                                   <div className="flex h-10 min-w-[40px] items-center justify-center rounded-full border-2 border-white bg-[#fbfcfa] px-3 text-[10px] font-black text-[#14532d]/40">
                                      +{Math.max(0, (order.items?.length || 1) - 3)} More
                                   </div>
                                </div>
                                <button className="flex items-center gap-2 rounded-2xl bg-[#14532d]/5 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#14532d] hover:bg-[#14532d] hover:text-white transition-all">
                                   Track Order <ChevronRight className="h-4 w-4" />
                                </button>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-[#14532d]/20">
                        <ShoppingBag className="h-16 w-16 text-[#14532d]/10 mx-auto mb-4" />
                        <h4 className="text-xl font-black text-[#14532d] mb-2 uppercase">No purchases yet</h4>
                        <p className="text-sm text-[#14532d]/40 font-bold mb-8">Start your journey towards a healthier life today.</p>
                        <Link href="/products" className="bg-[#14532d] text-white px-10 py-4 rounded-3xl text-xs font-black tracking-widest shadow-xl">BROWSE PRODUCTS</Link>
                     </div>
                   )}
                </motion.div>
              )}

              {/* Addresses Section */}
              {activeTab === 'addresses' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key="addresses"
                  className="space-y-8"
                >
                   <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-[#14532d] uppercase tracking-tight">Saved Addresses</h2>
                      <button 
                        onClick={() => {
                          const autofillPincode = selectedArea?.pincode || locationInfo?.postal || '';
                          const autofillCity = selectedArea?.city ? getTranslated(selectedArea.city) : (locationInfo?.city || 'Surat');
                          const autofillState = selectedArea?.state ? getTranslated(selectedArea.state) : (locationInfo?.region || 'Gujarat');
                          
                          setAddressForm({ 
                            type: 'Home', 
                            phoneNumber: user.phone || '', 
                            pincode: autofillPincode.toString().replace(/\s/g, '').slice(0, 6), 
                            houseNumber: '', 
                            landmark: '', 
                            city: autofillCity, 
                            state: autofillState 
                          });
                          setShowAddressForm(!showAddressForm);
                        }}
                        className="flex items-center gap-2 rounded-2xl bg-[#14532d] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-[#114224] transition-all"
                      >
                         <Plus className="h-4 w-4" /> {showAddressForm ? "Close Form" : "Add New Address"}
                      </button>
                   </div>
 
                   {/* Address Form Toggle */}
                   <AnimatePresence>
                     {showAddressForm && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }} 
                         animate={{ height: 'auto', opacity: 1 }} 
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden mb-8"
                       >
                         <form onSubmit={handleAddAddress} className="rounded-[40px] bg-white p-8 shadow-xl border border-[#14532d]/10 space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Address Type</label>
                                  <select 
                                    value={addressForm.type}
                                    onChange={e => setAddressForm({...addressForm, type: e.target.value})}
                                    className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                                  >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                  </select>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Phone Number</label>
                                  <input 
                                    required
                                    type="tel"
                                    value={addressForm.phoneNumber}
                                    onChange={e => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                                    placeholder="Add contact number"
                                    className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Full Address / House No.</label>
                               <input 
                                 required
                                 value={addressForm.houseNumber}
                                 onChange={e => setAddressForm({...addressForm, houseNumber: e.target.value})}
                                 placeholder="Enter building, apartment or house number"
                                 className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                               />
                            </div>
                            <div className="grid gap-6 sm:grid-cols-3">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Pincode</label>
                                  <input 
                                    required
                                    value={addressForm.pincode}
                                    onChange={e => setAddressForm({...addressForm, pincode: e.target.value})}
                                    placeholder="6 digits"
                                    className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">City</label>
                                  <input 
                                    required
                                    value={addressForm.city}
                                    onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                                    placeholder="Enter city"
                                    className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">State</label>
                                  <input 
                                    required
                                    value={addressForm.state}
                                    onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                                    placeholder="Enter state"
                                    className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                                  />
                               </div>
                            </div>
                               <div className="flex gap-4 pt-4">
                                <button 
                                  type="submit" 
                                  disabled={isSavingAddress} 
                                  className={`flex-1 bg-[#14532d] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isSavingAddress ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:bg-[#114224] hover:shadow-[#14532d]/20 active:scale-95'}`}
                                >
                                   {isSavingAddress ? (
                                     <>
                                       <Loader2 className="h-4 w-4 animate-spin" />
                                       <span>SAVING...</span>
                                     </>
                                   ) : (
                                     <span>{addressForm.id ? "UPDATE ADDRESS" : "SAVE ADDRESS"}</span>
                                   )}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setShowAddressForm(false);
                                    setAddressForm({ type: 'Home', phoneNumber: user.phone || '', pincode: '', houseNumber: '', landmark: '', city: 'Surat', state: 'Gujarat' });
                                  }} 
                                  className="px-8 bg-white text-[#14532d]/40 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-[#14532d]/10 hover:bg-gray-50 hover:text-[#14532d] transition-all"
                                >
                                   CANCEL
                                </button>
                             </div>
                         </form>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   {/* Address List */}
                   <div className="grid gap-6 sm:grid-cols-2">
                      {addresses.map(addr => (
                        <div key={addr.id} className={`group relative rounded-[40px] bg-white p-8 shadow-sm border transition-all hover:shadow-xl ${addr.isDefault ? 'border-[#14532d]/30 ring-1 ring-[#14532d]/10' : 'border-[#14532d]/5 hover:border-[#14532d]/20'}`}>
                           <div className="absolute top-8 right-8 flex gap-2">
                             {addr.isDefault && (
                               <span className="bg-[#14532d] text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">DEFAULT</span>
                             )}
                             {/* Check if address is active in current session */}
                             {selectedArea?.id === addr.id && (
                               <span className="bg-[#16a34a] text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg border border-[white]/20">ACTIVE</span>
                             )}
                           </div>
                           <div className="flex items-center gap-4 mb-6">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#14532d]">
                                 <MapPin className="h-6 w-6" />
                              </div>
                              <h3 className="text-lg font-black text-[#14532d] uppercase tracking-tight">{addr.type}</h3>
                           </div>
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-[#14532d] leading-relaxed">{getTranslated(addr.addressLine1)}, {getTranslated(addr.addressLine2)}</p>
                              <p className="text-sm font-bold text-[#14532d]/60">{getTranslated(addr.city)}, {getTranslated(addr.state)}</p>
                              <p className="text-sm font-black tracking-widest text-[#14532d]/80 mt-2">{addr.pincode}</p>
                           </div>
                           <div className="mt-8 flex items-center justify-between border-t border-[#14532d]/5 pt-6">
                              <div className="flex items-center gap-4">
                                 {!addr.isDefault && (
                                   <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 hover:text-[#14532d]">Set Default</button>
                                 )}
                                 <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 className="h-4.5 w-4.5" /></button>
                              </div>
                              <button 
                                onClick={() => {
                                  setAddressForm({
                                    id: addr.id,
                                    type: addr.type,
                                    phoneNumber: addr.phoneNumber,
                                    pincode: addr.pincode,
                                    houseNumber: getTranslated(addr.addressLine1),
                                    landmark: getTranslated(addr.landmark),
                                    city: getTranslated(addr.city),
                                    state: getTranslated(addr.state)
                                  });
                                  setShowAddressForm(true);
                                  window.scrollTo({ top: 400, behavior: 'smooth' });
                                }}
                                className="text-[#14532d]/30 hover:text-[#14532d] transition-colors"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                           </div>
                        </div>
                      ))}
                      {addresses.length === 0 && !showAddressForm && (
                        <div className="sm:col-span-2 text-center py-20 bg-white rounded-[40px] border border-dashed border-[#14532d]/20">
                           <MapPin className="h-16 w-16 text-[#14532d]/10 mx-auto mb-4" />
                           <p className="text-sm text-[#14532d]/40 font-bold uppercase tracking-widest">No address found. Add your first delivery address!</p>
                        </div>
                      )}
                   </div>
                </motion.div>
              )}

              {/* Settings Section */}
              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key="settings"
                  className="max-w-2xl space-y-8"
                >
                   <div className="rounded-[40px] bg-white p-10 shadow-sm border border-[#14532d]/5">
                      <h2 className="text-2xl font-black text-[#14532d] uppercase tracking-tight mb-2">Personal Information</h2>
                      <p className="text-xs font-bold text-[#14532d]/40 uppercase tracking-widest mb-10">Manage your basic details and identification</p>
                      
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                         <div className="grid gap-6 sm:grid-cols-2">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Display Name</label>
                                <input 
                                  required
                                  name="name"
                                  defaultValue={getTranslated(user.name)}
                                  className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d]"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Mobile Number</label>
                                <input 
                                  name="phone"
                                  defaultValue={user.phone}
                                  placeholder="Enter mobile number"
                                  className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d] transition-all"
                                />
                             </div>
                         </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 pl-2">Email Address</label>
                             <input 
                               name="email"
                               defaultValue={user.email}
                               placeholder="Enter your email"
                               className="w-full rounded-2xl bg-[#fbfcfa] border border-[#14532d]/5 px-5 py-4 text-sm font-bold outline-none focus:border-[#14532d] transition-all"
                             />
                          </div>
                         <button 
                           type="submit" 
                           disabled={isUpdatingProfile}
                           className="w-full bg-[#14532d] text-white py-5 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#14532d]/20 flex items-center justify-center gap-3 transition-all hover:bg-[#114224] disabled:opacity-50"
                         >
                            {isUpdatingProfile ? <Loader2 className="animate-spin h-4 w-4" /> : "SAVE CHANGES"}
                         </button>
                      </form>
                   </div>

                   <div className="rounded-[40px] bg-red-50/30 p-10 border border-red-50">
                      <h4 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Account Security
                      </h4>
                      <p className="mt-2 text-[11px] font-semibold text-red-400 leading-relaxed mb-6">Changing your password or deleting your account will terminate all active sessions and clear your history.</p>
                      <div className="flex flex-wrap gap-4">
                        <button className="px-6 py-3 rounded-2xl bg-white border border-red-100 text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-red-50 transition-colors">Reset Password</button>
                        <button className="px-6 py-3 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Delete Account</button>
                      </div>
                   </div>
                </motion.div>
              )}

              {/* Wishlist Section */}
              {activeTab === 'wishlist' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key="wishlist"
                  className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-dashed border-[#14532d]/20"
                >
                   <Heart className="h-16 w-16 text-[#14532d]/10 mb-4" />
                   <h3 className="text-xl font-black text-[#14532d] uppercase">Wishlist is Empty</h3>
                   <p className="text-sm text-[#14532d]/40 font-bold mb-8">Save products you love to view them later.</p>
                   <Link href="/products" className="bg-[#14532d] text-white px-10 py-4 rounded-3xl text-sm font-black tracking-widest shadow-xl">DISCOVER NOW</Link>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
