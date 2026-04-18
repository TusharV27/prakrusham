'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
    Search,
    Star,
    Loader2,
    ImageIcon,
    Filter,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecommendationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [productsList, setProductsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(null); // Track which ID is being updated
    const [language, setLanguage] = useState('en');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/products?limit=100&_t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setProductsList(data.data || data.products || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggleRecommendation = async (productId, currentStatus) => {
        try {
            setIsUpdating(productId);
            const newStatus = !currentStatus;
            
            const res = await fetch('/api/admin/recommendations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, isRecommendation: newStatus })
            });
            
            const result = await res.json();
            if (result.success) {
                setProductsList(prev => prev.map(p => 
                    p.id === productId ? { ...p, isRecommendation: newStatus } : p
                ));
            } else {
                alert('Failed to update: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Toggle error:', error);
            alert('Error updating recommendation');
        } finally {
            setIsUpdating(null);
        }
    };

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

    const filteredProducts = useMemo(() => {
        return productsList.filter(p => {
            const name = getTranslated(p.name).toLowerCase();
            return name.includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [productsList, searchTerm, language]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    const activeRecommendations = productsList.filter(p => p.isRecommendation).length;

    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
            <div className="max-w-[1200px] mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#202223]">Cart Recommendations</h1>
                        <p className="text-sm text-[#6d7175] mt-1">
                            Curate the "Handpicked For You" section in the cart drawer.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-[#c9cccf] shadow-sm">
                        <Star className="text-amber-500 fill-amber-500" size={18} />
                        <div>
                            <p className="text-sm font-bold uppercase tracking-wider text-[#6d7175]">Active Upsells</p>
                            <p className="text-sm font-bold text-[#202223]">{activeRecommendations} Products</p>
                        </div>
                    </div>
                </div>

                {/* TIPS */}
                <div className="bg-[#e7f3ef] border border-[#aee9d1] p-4 rounded-lg flex gap-3 items-start">
                    <CheckCircle2 className="text-[#008060] shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-[#006e52]">
                        <strong>Best Practice:</strong> Select 3 to 5 products to showcase. If you select fewer, our system will automatically suggest products from similar categories to ensure a full experience.
                    </p>
                </div>

                {/* MAIN TABLE CARD */}
                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
                    
                    {/* TOOLS */}
                    <div className="p-4 border-b border-[#c9cccf] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input
                                type="text"
                                placeholder="Search products to promote..."
                                className="w-full pl-9 pr-4 py-2 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             {['en', 'hi', 'gu'].map(l => (
                                <button 
                                    key={l} 
                                    onClick={() => setLanguage(l)} 
                                    className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${language === l ? 'bg-[#202223] text-white shadow-md' : 'bg-[#f4f6f8] text-[#6d7175] hover:bg-gray-200'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                <tr>
                                    <th className="px-5 py-3 font-semibold w-[60px]">Image</th>
                                    <th className="px-5 py-3 font-semibold">Product Name</th>
                                    <th className="px-5 py-3 font-semibold">Price</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-center">In Suggestions?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebebeb]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-20 text-center">
                                            <div className="flex justify-center flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
                                                <p className="text-xs text-[#6d7175]">Loading your inventory...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-20 text-center text-[#6d7175]">
                                            No products found
                                        </td>
                                    </tr>
                                ) : paginatedProducts.map(product => {
                                    const name = getTranslated(product.name);
                                    const isPromoted = product.isRecommendation;

                                    return (
                                        <tr key={product.id} className="hover:bg-[#fafbfb] transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="w-12 h-12 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center">
                                                    {product.images?.[0]?.url ? (
                                                        <img src={product.images[0].url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-[#8c9196]" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-[#202223]">{name}</p>
                                                <p className="text-[11px] text-[#6d7175] mt-0.5 uppercase tracking-tighter">{product.sku || 'No SKU'}</p>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-[#202223]">
                                                ₹{product.price}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-sm font-bold border ${product.status === 'ACTIVE' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleRecommendation(product.id, isPromoted)}
                                                    disabled={isUpdating === product.id}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPromoted ? 'bg-[#008060]' : 'bg-[#c9cccf]'} ${isUpdating === product.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPromoted ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                                {isPromoted && (
                                                    <p className="text-[9px] font-bold text-[#008060] uppercase mt-1">Suggested</p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {!isLoading && totalPages > 1 && (
                        <div className="p-4 border-t border-[#c9cccf] flex items-center justify-between text-sm bg-white">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-[#c9cccf] rounded text-[#202223] hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="text-[#6d7175]">
                                Page <span className="font-semibold text-[#202223]">{currentPage}</span> of {totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-[#c9cccf] rounded text-[#202223] hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
