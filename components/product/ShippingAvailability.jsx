'use client';

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Loader2, CheckCircle2, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShippingAvailability({ productId }) {
    const [pincode, setPincode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Load pincode from localStorage on mount
    useEffect(() => {
        const savedPincode = localStorage.getItem('userPincode');
        if (savedPincode) {
            setPincode(savedPincode);
            checkAvailability(savedPincode);
        }
    }, []);

    const checkAvailability = async (pinValue = pincode) => {
        if (!pinValue || pinValue.length < 6) {
            setError('Please enter a valid 6-digit pincode');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const res = await fetch('/api/shipping/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pincode: pinValue, productId })
            });
            
            const data = await res.json();
            
            if (data.success) {
                setResult(data.data);
                // Save pincode for checkout
                localStorage.setItem('userPincode', pinValue);
                if (data.data.addressMatched?.state) {
                    localStorage.setItem('userState', data.data.addressMatched.state);
                }
            } else {
                setError(data.message || 'Failed to check availability');
            }
        } catch (err) {
            setError('Error connecting to shipping service');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') checkAvailability();
    };

    return (
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#14532d]/10 flex items-center justify-center text-[#14532d]">
                    <Truck size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Delivery Check</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Check availability & shipping rates</p>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14532d]">
                    <MapPin size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Enter Delivery Pincode"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    onKeyPress={handleKeyPress}
                    className="w-full h-14 pl-12 pr-32 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black outline-none focus:bg-white focus:border-[#14532d] transition-all group-hover:border-gray-200"
                />
                <button 
                    onClick={() => checkAvailability()}
                    disabled={loading || pincode.length < 6}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-[#14532d] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0d351d] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600"
                    >
                        <AlertCircle size={16} />
                        <span className="text-[11px] font-bold">{error}</span>
                    </motion.div>
                )}

                {result && !error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 space-y-4"
                    >
                        <div className={`p-4 rounded-2xl flex items-center gap-3 ${result.deliverable ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                            {result.deliverable ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <div className="flex-1">
                                <p className="text-[11px] font-black uppercase tracking-wider">{result.deliverable ? 'Available' : 'Not Deliverable'}</p>
                                <p className="text-[10px] font-semibold opacity-80">{result.message}</p>
                            </div>
                        </div>

                        {result.deliverable && result.shippingOptions.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Available Methods</p>
                                {result.shippingOptions.map((option, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                <Truck size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900">{option.name}</p>
                                                <p className="text-[10px] font-bold text-emerald-600">{option.estimatedDays}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-gray-900">
                                            {option.price === 0 ? 'FREE' : `₹${option.price}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 text-blue-800 border border-blue-100">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p className="text-[10px] font-semibold leading-relaxed">
                                Shipping costs are calculated based on your total order weight and destination. Complete your order to get final rates.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
