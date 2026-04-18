'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
    ChevronRight, 
    Truck, 
    MapPin, 
    CreditCard, 
    ShoppingBag, 
    Info,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage({ params }) {
    const { cartItems } = useCart();
    const { language } = useLanguage();
    const [step, setStep] = useState(1); // 1: Information, 2: Shipping, 3: Payment
    const [loading, setLoading] = useState(false);
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: 'Gujarat',
        pincode: '',
        phone: ''
    });

    const getTranslated = (field) => {
        if (!field) return "";
        let parsed = field;
        if (typeof field === "string") {
            try { parsed = JSON.parse(field); } catch (e) { return field; }
        }
        return parsed[language] || parsed.en || field;
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Initial load from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPincode = localStorage.getItem('userPincode');
            const savedState = localStorage.getItem('userState');
            if (savedPincode) {
                setFormData(prev => ({ 
                    ...prev, 
                    pincode: savedPincode,
                    state: savedState || prev.state
                }));
            }
        }
    }, []);

    const tax = subtotal * 0.05; // 5% flat for now
    const total = subtotal + tax + (selectedShipping?.price || 0);

    const calculateShipping = async () => {
        if (!formData.pincode || formData.pincode.length < 6) return;
        
        try {
            setCalculatingShipping(true);
            const res = await fetch('/api/shipping/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems,
                    address: {
                        pincode: formData.pincode,
                        state: formData.state,
                        country: 'India'
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setShippingOptions(data.shippingOptions);
                if (data.shippingOptions.length > 0) {
                    setSelectedShipping(data.shippingOptions[0]);
                }
            }
        } catch (error) {
            console.error('Error calculating shipping:', error);
        } finally {
            setCalculatingShipping(false);
        }
    };

    // Calculate shipping whenever we move to shipping step
    useEffect(() => {
        if (step === 2) {
            calculateShipping();
        }
    }, [step]);

    const handleContinueToShipping = () => {
        setStep(2);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row">
                {/* Left Side: Forms */}
                <div className="flex-1 p-6 lg:p-12 lg:border-r border-gray-200">
                    <header className="mb-8">
                        <Link href="/" className="text-2xl font-black text-[#14532d] tracking-tighter mb-6 block">
                            PRAKRUSHI
                        </Link>
                        
                        <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <Link href="/cart" className="text-[#008060]">Cart</Link>
                            <ChevronRight size={14} />
                            <span className={step >= 1 ? 'text-gray-900' : ''}>Information</span>
                            <ChevronRight size={14} />
                            <span className={step >= 2 ? 'text-gray-900' : ''}>Shipping</span>
                            <ChevronRight size={14} />
                            <span className={step >= 3 ? 'text-gray-900' : ''}>Payment</span>
                        </nav>
                    </header>

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Contact</h2>
                                    <span className="text-sm text-gray-500">Have an account? <Link href="/login" className="text-[#008060] underline">Log in</Link></span>
                                </div>
                                <input 
                                    type="email" 
                                    placeholder="Email or mobile phone number"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-[#008060] outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-4">Shipping address</h2>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input 
                                            placeholder="First name"
                                            className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        />
                                        <input 
                                            placeholder="Last name"
                                            className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        />
                                    </div>
                                    <input 
                                        placeholder="Address"
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    />
                                    <input 
                                        placeholder="Apartment, suite, etc. (optional)"
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                        value={formData.apartment}
                                        onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        <input 
                                            placeholder="City"
                                            className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        />
                                        <select 
                                            className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060] bg-white"
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        >
                                            <option>Gujarat</option>
                                            <option>Maharashtra</option>
                                            <option>Rajasthan</option>
                                        </select>
                                        <input 
                                            placeholder="Pincode"
                                            className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                            value={formData.pincode}
                                            onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                        />
                                    </div>
                                    <input 
                                        placeholder="Phone"
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-[#008060]"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button 
                                    onClick={handleContinueToShipping}
                                    className="bg-[#14532d] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#0d351d] transition-colors"
                                >
                                    Continue to shipping
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
                            {/* Summary Box */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
                                <div className="flex p-4 border-b border-gray-100 gap-4">
                                    <span className="text-gray-500 w-20">Contact</span>
                                    <span className="flex-1">{formData.email}</span>
                                    <button onClick={() => setStep(1)} className="text-[#008060] text-xs font-semibold">Change</button>
                                </div>
                                <div className="flex p-4 gap-4">
                                    <span className="text-gray-500 w-20">Ship to</span>
                                    <span className="flex-1">{formData.address}, {formData.city}, {formData.pincode}</span>
                                    <button onClick={() => setStep(1)} className="text-[#008060] text-xs font-semibold">Change</button>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-4">Shipping method</h2>
                                {calculatingShipping ? (
                                    <div className="flex items-center justify-center p-12 border border-gray-200 rounded-xl bg-gray-50/50">
                                        <Loader2 className="animate-spin text-[#008060] mr-3" />
                                        <span className="text-sm font-medium text-gray-600">Calculating shipping rates...</span>
                                    </div>
                                ) : (
                                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                                        {shippingOptions.length > 0 ? (
                                            shippingOptions.map((option, idx) => (
                                                <label 
                                                    key={idx}
                                                    className={`flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors ${idx !== shippingOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <input 
                                                            type="radio" 
                                                            name="shipping"
                                                            checked={selectedShipping?.name === option.name}
                                                            onChange={() => setSelectedShipping(option)}
                                                            className="w-5 h-5 accent-[#008060]"
                                                        />
                                                        <div className="space-y-0.5">
                                                            <div className="font-medium text-sm text-gray-900">{option.name}</div>
                                                            {option.isPickup && (
                                                                <div className="text-xs text-green-700 flex items-center gap-1 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                                                    <CheckCircle2 size={12} />
                                                                    Free Pickup
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-900">
                                                        {option.price === 0 ? 'Free' : `₹${option.price.toFixed(2)}`}
                                                    </span>
                                                </label>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center bg-gray-50 border-t border-gray-200 first:border-t-0">
                                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                                                    <Truck className="text-gray-400" size={20} />
                                                </div>
                                                <p className="text-sm text-gray-600">No shipping methods available for this location.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-6">
                                <button onClick={() => setStep(1)} className="text-[#008060] text-sm font-medium flex items-center">
                                    Return to information
                                </button>
                                <button 
                                    onClick={() => setStep(3)}
                                    disabled={!selectedShipping}
                                    className="bg-[#14532d] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#0d351d] transition-colors disabled:opacity-50"
                                >
                                    Continue to payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
                             <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
                                <div className="flex p-4 border-b border-gray-100 gap-4">
                                    <span className="text-gray-500 w-20">Contact</span>
                                    <span className="flex-1">{formData.email}</span>
                                </div>
                                <div className="flex p-4 border-b border-gray-100 gap-4">
                                    <span className="text-gray-500 w-20">Ship to</span>
                                    <span className="flex-1">{formData.address}, {formData.city}, {formData.pincode}</span>
                                </div>
                                <div className="flex p-4 gap-4">
                                    <span className="text-gray-500 w-20">Method</span>
                                    <span className="flex-1">{selectedShipping?.name} · ₹{selectedShipping?.price}</span>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold mb-2">Payment</h2>
                                <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>
                                
                                <div className="border border-gray-300 rounded-xl overflow-hidden">
                                    <div className="p-4 bg-[#f4f6f8] border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <CreditCard size={18} />
                                            Razorpay (Cards, UPI, Netbanking)
                                        </div>
                                    </div>
                                    <div className="p-12 text-center space-y-3">
                                        <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag className="text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-600">After clicking “Pay now”, you will be redirected to Razorpay to complete your purchase securely.</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-[#14532d] text-white py-5 rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-[#0d351d]">
                                Pay now
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Order Summary */}
                <div className="w-full lg:w-[420px] bg-[#f9fafa] p-6 lg:p-12">
                    <div className="space-y-6 lg:sticky lg:top-12">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 border border-gray-200 rounded-lg bg-white">
                                        <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover rounded-lg p-1" />
                                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-sm font-medium">
                                        <div className="text-gray-900">{getTranslated(item.name)}</div>
                                        <div className="text-gray-500 text-xs">{item.sku}</div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-6 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                    Shipping <Info size={14} className="text-gray-400 cursor-help" />
                                </span>
                                <span className="text-gray-600 font-medium">
                                    {selectedShipping ? `₹${selectedShipping.price.toFixed(2)}` : 'Calculated at next step'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Estimated Tax</span>
                                <span className="font-bold text-gray-900">₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-4">
                                <span className="text-lg font-black text-gray-900 uppercase tracking-widest">Total</span>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 font-bold mr-2 uppercase tracking-tighter">INR</span>
                                    <span className="text-xl font-black text-gray-900">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {selectedShipping?.isPickup && (
                            <div className="bg-white border border-green-100 p-4 rounded-xl flex gap-3 animate-in fade-in zoom-in-95 duration-300">
                                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                                <div>
                                    <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">Pickup at {selectedShipping.location}</h4>
                                    <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                                        {selectedShipping.instructions}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
