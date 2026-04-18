'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Construction, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuditComingSoonPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-emerald-100/30 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-100/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-2xl w-full text-center space-y-8"
            >
                {/* Icon Animation */}
                <div className="flex justify-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', duration: 1.5 }}
                        className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-slate-100 relative group"
                    >
                        <ShieldCheck className="w-12 h-12 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <motion.div 
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="absolute inset-0 bg-emerald-50 rounded-3xl -z-10 blur-xl"
                        />
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100"
                    >
                        <Clock className="w-3 h-3" />
                        Feature in pipeline
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                        Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">Logs</span>
                    </h1>
                    
                    <p className="text-slate-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
                        We are building a highly secure, immutable audit transmission system for the Prakrushi ecosystem.
                    </p>
                </div>

                {/* Construction Badge */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Construction className="w-5 h-5 text-amber-500" />
                        <div className="text-left">
                            <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Status</div>
                            <div className="text-sm font-bold text-slate-700">Development Environment</div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="pt-8">
                    <Link href="/admin">
                        <button className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-900/20">
                            <ArrowLeft className="w-4 h-4" />
                            Return to Dashboard
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}