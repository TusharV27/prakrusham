'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit3,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Package,
    Box,
    AlertCircle,
    CheckCircle2,
    Archive,
    UploadCloud,
    FileText,
    IndianRupee,
    Barcode,
    Tag,
    Store,
    Languages,
    ImageIcon,
    ArrowLeft,
    Settings,
    MoreVertical,
    Star,
    Layers,
    Layout,
    Globe,
    Database,
    Type,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for React Quill
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

import BulkUploadModal from '@/components/admin/BulkUploadModal';
import ProductShippingSection from '@/components/admin/ProductShippingSection';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function ShopifyStyleProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [language, setLanguage] = useState('en');
    const [modalLanguage, setModalLanguage] = useState('en');

    const [productsList, setProductsList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [shippingProfiles, setShippingProfiles] = useState([]);

    // ---------------- UTILS ----------------
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

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Pagination State ---
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
    const [globalStats, setGlobalStats] = useState({ total: 0, active: 0, draft: 0, archived: 0 });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ---------------- FORM STATE ----------------
    const initialFormState = {
        name: { en: '', hi: '', gu: '' },
        slug: '',
        summaryHtml: { en: '', hi: '', gu: '' },
        bodyHtml: { en: '', hi: '', gu: '' },
        price: '',
        compareAtPrice: '',
        costPerItem: '',
        sku: '',
        barcode: '',
        weight: '',
        isTaxable: true,
        taxRate: 5.0,
        status: 'DRAFT',
        categoryId: '',
        vendorId: '',
        farmerId: '',
        inventoryItems: [],
        tags: '',
        metaTitle: { en: '', hi: '', gu: '' },
        metaDescription: { en: '', hi: '', gu: '' },
        options: [],
        variants: [],
        metafields: [], 
        shippingProfileId: '',
        isPhysical: true,
        packageType: 'store_default',
        weightUnit: 'kg',
        countryOfOrigin: '',
        hsCode: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'code-block'],
            ['clean']
        ],
    };

    // ---------------- FETCH DATA ----------------
    const fetchData = async (currentPage = page, search = debouncedSearch, status = selectedTab) => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit: 10,
                search: search,
                status: status
            });

            const [prodRes, catRes, venRes, farRes, spRes] = await Promise.all([
                fetch(`/api/products?${queryParams.toString()}`),
                fetch('/api/categories'),
                fetch('/api/vendors?status=active'),
                fetch('/api/admin/farmers?status=active'),
                fetch('/api/admin/shipping/profiles')
            ]);
            const [p, c, v, f, sp] = await Promise.all([prodRes.json(), catRes.json(), venRes.json(), farRes.json(), spRes.json()]);

            if (p?.success) {
                setProductsList(p.data || []);
                if (p.pagination) setPagination(p.pagination);
                if (p.stats) setGlobalStats(p.stats);
            } else if (Array.isArray(p)) {
                setProductsList(p);
            }

            if (c?.success) setCategories(c.data || []);
            else if (Array.isArray(c)) setCategories(c);
            else if (c?.categories) setCategories(c.categories);

            if (v?.success) setVendors(v.data || []);
            else if (Array.isArray(v)) setVendors(v);
            else if (v?.vendors) setVendors(v.vendors);

            if (f?.success) setFarmers(f.data || []);
            else if (f?.farmers) setFarmers(f.farmers);

            if (sp?.success) setShippingProfiles(sp.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Unified Fetch Handler
    useEffect(() => {
        fetchData(page, debouncedSearch, selectedTab);
    }, [page, debouncedSearch, selectedTab]);

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            if (searchTerm !== '') setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // ---------------- HANDLERS ----------------
    const normalizeOptionValues = (options) => {
        if (!Array.isArray(options)) return [];
        return options.map((opt) => {
            const rawValues = Array.isArray(opt.values)
                ? opt.values
                : typeof opt.values === 'string'
                    ? opt.values.split(',')
                    : [];
            return {
                name: String(opt.name || ''),
                values: rawValues.map((value) => String(value).trim()).filter(Boolean),
            };
        });
    };

    const handleEdit = async (product) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/products/${product.id}`);
            const result = await res.json();
            if (!result.success) throw new Error('Failed to load product details');

            const p = result.data;
            setIsEditMode(true);

            const ensureMultilingual = (val) => {
                if (!val) return { en: '', hi: '', gu: '' };
                if (typeof val === 'string') return { en: val, hi: '', gu: '' };
                return {
                    en: val.en || '',
                    hi: val.hi || '',
                    gu: val.gu || ''
                };
            };

            setFormData({
                ...p,
                name: ensureMultilingual(p.name),
                summaryHtml: ensureMultilingual(p.summaryHtml || p.shortDesc),
                bodyHtml: ensureMultilingual(p.bodyHtml || p.description),
                metaTitle: ensureMultilingual(p.metaTitle),
                metaDescription: ensureMultilingual(p.metaDescription),
                options: normalizeOptionValues(p.options || []),
                variants: (p.variants || []).map((variant) => ({
                    ...variant,
                    stock: variant.stock ?? variant.quantity ?? 0,
                })),
                metafields: p.metafields || [],
                tags: p.tags || '',
                isPhysical: (p.metafields || []).find(m => m.key === 'isPhysical')?.value === 'false' ? false : true,
                packageType: (p.metafields || []).find(m => m.key === 'packageType')?.value || 'store_default',
                weightUnit: (p.metafields || []).find(m => m.key === 'weightUnit')?.value || 'kg',
                countryOfOrigin: (p.metafields || []).find(m => m.key === 'countryOfOrigin')?.value || '',
                hsCode: (p.metafields || []).find(m => m.key === 'hsCode')?.value || '',
            });
            setImagePreviews((p.images || []).map(img => ({ url: img.url, isExisting: true })));
            setModalLanguage(language);
            setIsModalOpen(true);
        } catch (err) {
            console.error(err);
            alert('Error loading product details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
        const previews = files.map(f => ({ url: URL.createObjectURL(f), isExisting: false }));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const generateVariants = () => {
        const options = formData.options
            .map((opt) => ({
                name: String(opt.name || ''),
                values: Array.isArray(opt.values)
                    ? opt.values.map((v) => String(v || '').trim()).filter(Boolean)
                    : [],
            }))
            .filter((opt) => opt.name && opt.values.length > 0);
        if (options.length === 0) return;

        const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
        const combinations = options.length === 1
            ? options[0].values.map(v => [v])
            : cartesian(...options.map(opt => opt.values));

        const newVariants = combinations.map(combo => {
            const variantTitle = combo.join(' / ');
            const variantOptions = {};
            combo.forEach((val, idx) => { variantOptions[options[idx].name] = val; });

            const existing = formData.variants.find(v => v.title === variantTitle);
            return existing || {
                title: variantTitle,
                price: formData.price || 0,
                compareAtPrice: formData.compareAtPrice || 0,
                sku: `${formData.sku}-${variantTitle.replace(/\s+/g, '-')}`.toUpperCase(),
                stock: 0,
                options: variantOptions
            };
        });

        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = isEditMode ? `/api/products/${formData.id}` : '/api/products';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const fData = new FormData();
            fData.append('name', formData.name.en || '');
            fData.append('nameHi', formData.name.hi || '');
            fData.append('nameGu', formData.name.gu || '');
            fData.append('slug', formData.slug);
            fData.append('summaryHtml', formData.summaryHtml.en || '');
            fData.append('summaryHtmlHi', formData.summaryHtml.hi || '');
            fData.append('summaryHtmlGu', formData.summaryHtml.gu || '');
            fData.append('bodyHtml', formData.bodyHtml.en || '');
            fData.append('bodyHtmlHi', formData.bodyHtml.hi || '');
            fData.append('bodyHtmlGu', formData.bodyHtml.gu || '');
            fData.append('price', formData.price);
            fData.append('compareAtPrice', formData.compareAtPrice);
            fData.append('costPerItem', formData.costPerItem);
            fData.append('sku', formData.sku);
            fData.append('barcode', formData.barcode);
            fData.append('weight', formData.weight);
            fData.append('isTaxable', formData.isTaxable);
            fData.append('taxRate', formData.taxRate);
            fData.append('status', formData.status);
            fData.append('categoryId', formData.categoryId);
            fData.append('vendorId', formData.vendorId);
            fData.append('farmerId', formData.farmerId);
            fData.append('shippingProfileId', formData.shippingProfileId);
            fData.append('tags', formData.tags);

            fData.append('metaTitle', formData.metaTitle.en || '');
            fData.append('metaTitleHi', formData.metaTitle.hi || '');
            fData.append('metaTitleGu', formData.metaTitle.gu || '');
            fData.append('metaDescription', formData.metaDescription.en || '');
            fData.append('metaDescriptionHi', formData.metaDescription.hi || '');
            fData.append('metaDescriptionGu', formData.metaDescription.gu || '');

            const cleanedOptions = formData.options
                .map((opt) => ({
                    name: String(opt.name || ''),
                    values: Array.isArray(opt.values)
                        ? opt.values.map((v) => String(v || '').trim()).filter(Boolean)
                        : [],
                }))
                .filter((opt) => opt.name && opt.values.length > 0);

            fData.append('options', JSON.stringify(cleanedOptions));
            fData.append('variants', JSON.stringify(formData.variants));
            
            // Bundle shipping fields into metafields
            const shippingFields = ['isPhysical', 'packageType', 'weightUnit', 'countryOfOrigin', 'hsCode'];
            const baseMeta = (formData.metafields || []).filter(m => !shippingFields.includes(m.key));
            const shippingMeta = shippingFields.map(key => ({
                namespace: 'shipping',
                key: key,
                value: String(formData[key] ?? ''),
                type: typeof formData[key] === 'boolean' ? 'boolean' : 'text'
            })).filter(m => m.value !== '');
            
            fData.append('metafields', JSON.stringify([...baseMeta, ...shippingMeta]));

            selectedImages.forEach(file => fData.append('images', file));
            const existingImages = imagePreviews.filter(img => img.isExisting).map(img => img.url);
            fData.append('existingImages', JSON.stringify(existingImages));

            const res = await fetch(url, { method, body: fData });
            const result = await res.json();
            if (result.success) {
                await fetchData();
                setIsModalOpen(false);
                setFormData(initialFormState);
                setImagePreviews([]);
                setSelectedImages([]);
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                fetchData();
            } else {
                alert(result.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Unable to delete product');
        }
    };



    const productsToDisplay = productsList; // Now using server-paginated list directly

    const StatusBadge = ({ status }) => {
        const config = {
            ACTIVE: 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]',
            DRAFT: 'bg-[#e2f1fe] text-[#004e9c] border-[#b0dcfb]',
            ARCHIVED: 'bg-[#faecec] text-[#8c2626] border-[#e8d5d5]'
        };
        const styling = config[status] || 'bg-gray-100 text-gray-800 border-gray-200';
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styling}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#202223]">Products</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsBulkUploadModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-[#202223] border border-[#c9cccf] px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#f6f6f7] shadow-sm transition-colors"
                        >
                            <UploadCloud size={16} />
                            Bulk upload
                        </button>
                        <button
                            onClick={() => { setIsEditMode(false); setFormData(initialFormState); setImagePreviews([]); setSelectedImages([]); setIsModalOpen(true); }}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors"
                        >
                            <Plus size={16} />
                            Add product
                        </button>
                </div>
                </div>
                
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Total Products</p><h3 className="text-2xl font-bold text-[#202223]">{globalStats.total}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Box size={20} /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Active</p><h3 className="text-2xl font-bold text-[#008060]">{globalStats.active}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><CheckCircle2 size={20} /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Drafts</p><h3 className="text-2xl font-bold text-[#202223]">{globalStats.draft}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><FileText size={20} /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Archived</p><h3 className="text-2xl font-bold text-[#d82c0d]">{globalStats.archived}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Archive size={20} /></div>
                    </div>
                </div>

                {/* MAIN LIST CARD */}
                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">

                    {/* TABS & LANGUAGE */}
                    <div className="border-b border-[#c9cccf] flex items-center justify-between px-2 bg-white flex-wrap gap-2">
                        <div className="flex overflow-x-auto">
                            {['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-[3px] transition-colors focus:outline-none ${selectedTab === tab ? 'border-[#008060] text-[#008060]' : 'border-transparent text-[#6d7175] hover:text-[#202223] hover:bg-[#fafbfb]'}`}
                                >
                                    {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center pr-2 gap-2">
                            <span className="text-xs font-medium text-[#6d7175] uppercase">Lang:</span>
                            <div className="flex gap-1 bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5">
                                {['en', 'hi', 'gu'].map(l => (
                                    <button key={l} onClick={() => setLanguage(l)} className={`px-2 py-0.5 rounded-sm text-xs font-medium uppercase transition-colors ${language === l ? 'bg-white text-[#202223] shadow-sm' : 'text-[#6d7175] hover:text-[#202223]'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="p-3 border-b border-[#c9cccf] bg-white">
                        <div className="relative max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto bg-white min-h-[400px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                <tr>
                                    <th className="px-5 py-3 font-semibold w-[60px]"></th>
                                    <th className="px-5 py-3 font-semibold">Product</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Inventory</th>
                                    <th className="px-5 py-3 font-semibold">Type</th>
                                    <th className="px-5 py-3 font-semibold">Farmer</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebebeb]">
                                 {isLoading ? (
                                    <tr><td colSpan="7" className="px-5 py-20 text-center"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#008060]" /></div></td></tr>
                                ) : productsToDisplay.length === 0 ? (
                                    <tr><td colSpan="7" className="px-5 py-20 text-center text-[#6d7175]">No products found.</td></tr>
                                ) : productsToDisplay.map(product => {
                                    const name = getTranslated(product.name);
                                    return (
                                        <tr key={product.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => handleEdit(product)}>
                                            <td className="px-5 py-3">
                                                <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center flex-shrink-0">
                                                    {product.image ? <img src={product.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="w-5 h-5 text-[#8c9196]" />}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-[#202223] max-w-md truncate">{name}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={product.status} />
                                            </td>
                                            <td className="px-5 py-3 text-[#202223]">
                                                {(() => {
                                                    const totalInventory = (product.variants || []).reduce((sum, v) => sum + (v.quantity || 0), 0);
                                                    if (totalInventory > 0) {
                                                        return <span className="text-[#006e52]">{totalInventory} in stock</span>;
                                                    }
                                                    if (product.variants?.length > 0) {
                                                        return <span className="text-[#6d7175]">{product.variants.length} variants</span>;
                                                    }
                                                    return <span className="text-[#d82c0d]">No inventory</span>;
                                                })()}
                                            </td>
                                            <td className="px-5 py-3 text-[#202223]">
                                                Physical
                                            </td>
                                            <td className="px-5 py-3 text-[#202223]">
                                                {product.farmerName ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#008060] text-white flex items-center justify-center text-xs font-bold">
                                                            {product.farmerName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm">{product.farmerName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#6d7175] text-sm">No farmer</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleDelete(product.id)} className="text-[#8c9196] hover:text-[#d82c0d] p-1.5 rounded-md hover:bg-[#feeeee] transition-colors shadow-sm bg-white border border-[#c9cccf]">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                            <p className="text-sm text-[#6d7175]">
                                Showing <span className="font-semibold text-[#202223]">{(page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> products
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
                                        // Show 5 pages around current page
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

                {/* MODAL / FULL SCREEN EDITOR OVERLAY */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f6f8]">

                            {/* MODAL HEADER - FULL WIDTH */}
                            <div className="px-4 py-3 border-b border-[#c9cccf] flex items-center justify-between bg-white z-20 shrink-0 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors border border-transparent">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h3 className="text-lg font-bold text-[#202223]">{isEditMode ? 'Edit product' : 'Add product'}</h3>
                                    <StatusBadge status={formData.status} />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1 bg-[#f4f6f8] rounded border border-[#c9cccf] p-0.5">
                                        {['en', 'hi', 'gu'].map(l => (
                                            <button key={l} type="button" onClick={() => setModalLanguage(l)} className={`px-2 py-0.5 rounded-sm text-xs font-medium uppercase transition-colors ${modalLanguage === l ? 'bg-white text-[#202223] shadow-sm' : 'text-[#6d7175] hover:text-[#202223]'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* MODAL BODY */}
                            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                                <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-[1000px] mx-auto pb-32">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                        {/* MAIN COLUMN (LEFT) */}
                                        <div className="lg:col-span-2 space-y-6">

                                            {/* Title & Description */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-5">
                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Title (en)</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Short sleeve t-shirt"
                                                        className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none transition-shadow"
                                                        value={formData.name[modalLanguage] || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setFormData(prev => {
                                                                const newData = { ...prev, name: { ...prev.name, [modalLanguage]: val } };
                                                                // Auto-generate slug if it's empty and we are editing English title
                                                                if (modalLanguage === 'en' && (!prev.slug || prev.slug === '')) {
                                                                    newData.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                                }
                                                                return newData;
                                                            });
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Summary ({modalLanguage})</label>
                                                    <div className="prose-editor">
                                                        <ReactQuill
                                                            key={`summary-${modalLanguage}`}
                                                            theme="snow"
                                                            modules={quillModules}
                                                            value={formData.summaryHtml[modalLanguage] || ''}
                                                            onChange={(v) => setFormData(prev => ({
                                                                ...prev,
                                                                summaryHtml: { ...(prev.summaryHtml || {}), [modalLanguage]: v || '' }
                                                            }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold text-[#202223] mb-1 block">Description ({modalLanguage})</label>
                                                    <div className="prose-editor">
                                                        <ReactQuill
                                                            key={`body-${modalLanguage}`}
                                                            theme="snow"
                                                            modules={quillModules}
                                                            value={formData.bodyHtml[modalLanguage] || ''}
                                                            onChange={(v) => setFormData(prev => ({
                                                                ...prev,
                                                                bodyHtml: { ...(prev.bodyHtml || {}), [modalLanguage]: v || '' }
                                                            }))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Media */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Media</h4>
                                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                                                    {imagePreviews.map((img, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group">
                                                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <label className="aspect-square rounded border border-dashed border-[#c9cccf] bg-[#fafbfb] flex flex-col items-center justify-center text-[#202223] hover:bg-[#f4f6f8] cursor-pointer transition-colors gap-2 text-sm font-medium">
                                                        <UploadCloud size={20} className="text-[#6d7175]" />
                                                        <span>Upload</span>
                                                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Pricing */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Pricing</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">Price</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]">₹</span>
                                                            <input type="number" step="0.01" className="w-full border border-[#c9cccf] shadow-inner rounded-md pl-8 pr-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">Compare at price</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]">₹</span>
                                                            <input type="number" step="0.01" className="w-full border border-[#c9cccf] shadow-inner rounded-md pl-8 pr-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" value={formData.compareAtPrice} onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: e.target.value }))} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">Tax Rate (%)</label>
                                                        <div className="relative">
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7175] text-xs font-bold">%</span>
                                                            <input type="number" step="0.01" className="w-full border border-[#c9cccf] shadow-inner rounded-md pl-3 pr-8 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" value={formData.taxRate} onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Inventory */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Inventory</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">SKU (Stock Keeping Unit)</label>
                                                        <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none" value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))} />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">Barcode (ISBN, UPC, GTIN, etc.)</label>
                                                        <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none" value={formData.barcode} onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))} />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Shipping */}
                                            <ProductShippingSection 
                                                formData={formData} 
                                                setFormData={setFormData} 
                                                shippingProfiles={shippingProfiles}
                                            />

                                            {/* SEO */}
                                            <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
                                                <div className="p-5 border-b border-[#ebebeb]">
                                                    <h4 className="text-sm font-semibold text-[#202223]">Search engine listing</h4>
                                                    <p className="text-sm text-[#6d7175] mt-1">Add a title and description to see how this product might appear in a search engine listing.</p>
                                                </div>
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">Page title ({modalLanguage})</label>
                                                        <input type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none" value={formData.metaTitle[modalLanguage] || ''} onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: { ...(prev.metaTitle || {}), [modalLanguage]: e.target.value } }))} />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-[#202223] mb-1 block">Meta description ({modalLanguage})</label>
                                                        <textarea rows="3" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none resize-none" value={formData.metaDescription[modalLanguage] || ''} onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: { ...(prev.metaDescription || {}), [modalLanguage]: e.target.value } }))} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metafields */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-[#202223]">Metafields</h4>
                                                    <p className="text-sm text-[#6d7175]">Additional custom data for this product.</p>
                                                </div>
                                                <MetafieldValueEditor 
                                                    value={formData.metafields || []} 
                                                    onChange={(newMeta) => setFormData(prev => ({ ...prev, metafields: newMeta }))}
                                                    ownerType="PRODUCTS"
                                                />
                                            </div>

                                            {/* Variants */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-[#202223]">Variants</h4>
                                                    <button type="button" onClick={() => setFormData({ ...formData, options: [...formData.options, { name: '', values: [] }] })} className="text-[#006fbb] text-sm hover:underline flex items-center gap-1 font-medium">
                                                        <Plus size={16} /> Add options like size or color
                                                    </button>
                                                </div>

                                                {formData.options.length > 0 && (
                                                    <div className="space-y-4 pt-2 border-t border-[#ebebeb]">
                                                        {formData.options.map((opt, idx) => (
                                                            <div key={idx} className="flex gap-4 p-4 bg-[#fafbfb] rounded border border-[#c9cccf] relative group">
                                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 p-1 text-[#6d7175] hover:text-[#d82c0d] transition-colors rounded hover:bg-[#feeeee] border border-transparent hover:border-[#fecaca]"><X size={14} /></button>
                                                                <div className="w-1/3">
                                                                    <label className="text-xs font-semibold text-[#202223] mb-1 block">Option name</label>
                                                                    <input type="text" placeholder="Size, Color" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm outline-none focus:border-[#008060]" value={opt.name} onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setFormData(prev => {
                                                                            const n = [...prev.options];
                                                                            n[idx] = { ...n[idx], name: val };
                                                                            return { ...prev, options: n };
                                                                        });
                                                                    }} />
                                                                </div>
                                                                <div className="flex-1 pr-6">
                                                                    <label className="text-xs font-semibold text-[#202223] mb-1 block">Option values</label>
                                                                    <div className="flex flex-wrap gap-2 p-2 border border-[#c9cccf] bg-white rounded-md min-h-[42px] focus-within:border-[#008060] focus-within:ring-1 focus-within:ring-[#008060] transition-shadow shadow-inner">
                                                                        {opt.values.map((v, vIdx) => (
                                                                            <span key={vIdx} className="inline-flex items-center gap-1.5 bg-[#f4f6f8] text-[#202223] px-2 py-1 rounded border border-[#c9cccf] text-xs font-medium">
                                                                                {v}
                                                                                <button type="button" onClick={() => {
                                                                                    setFormData(prev => {
                                                                                        const n = [...prev.options];
                                                                                        n[idx] = { ...n[idx], values: n[idx].values.filter((_, i) => i !== vIdx) };
                                                                                        return { ...prev, options: n };
                                                                                    });
                                                                                }} className="text-[#6d7175] hover:text-[#d82c0d] p-0.5 rounded-full hover:bg-white transition-colors">
                                                                                    <X size={10} strokeWidth={3} />
                                                                                </button>
                                                                            </span>
                                                                        ))}
                                                                        <input
                                                                            type="text"
                                                                            placeholder={opt.values.length === 0 ? "Press Enter or type comma..." : "Add value..."}
                                                                            className="flex-1 min-w-[120px] outline-none text-xs bg-transparent py-1"
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' || e.key === ',') {
                                                                                    e.preventDefault();
                                                                                    const val = e.currentTarget.value.trim();
                                                                                    if (val && !opt.values.includes(val)) {
                                                                                        setFormData(prev => {
                                                                                            const n = [...prev.options];
                                                                                            n[idx] = { ...n[idx], values: [...n[idx].values, val] };
                                                                                            return { ...prev, options: n };
                                                                                        });
                                                                                        e.currentTarget.value = '';
                                                                                    }
                                                                                } else if (e.key === 'Backspace' && e.currentTarget.value === '' && opt.values.length > 0) {
                                                                                    setFormData(prev => {
                                                                                        const n = [...prev.options];
                                                                                        n[idx] = { ...n[idx], values: n[idx].values.slice(0, -1) };
                                                                                        return { ...prev, options: n };
                                                                                    });
                                                                                }
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                const val = e.currentTarget.value.trim();
                                                                                if (val && !opt.values.includes(val)) {
                                                                                    setFormData(prev => {
                                                                                        const n = [...prev.options];
                                                                                        n[idx] = { ...n[idx], values: [...n[idx].values, val] };
                                                                                        return { ...prev, options: n };
                                                                                    });
                                                                                    e.currentTarget.value = '';
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-3">
                                                            <button type="button" onClick={generateVariants} className="flex-1 py-2 bg-white border border-[#c9cccf] shadow-sm text-[#008060] text-sm font-semibold rounded-md hover:bg-[#f0f9f6] hover:border-[#008060] transition-colors flex items-center justify-center gap-2">
                                                                <Layers size={16} /> Update / Generate variant combinations
                                                            </button>
                                                        </div>
                                                        <p className="text-[11px] text-[#6d7175] italic px-1">* Clicking generate will create variants for all combinations of options. Existing variants with matching names will be preserved.</p>
                                                    </div>
                                                )}

                                                {formData.variants.length > 0 && (
                                                    <div className="border border-[#c9cccf] rounded-md overflow-x-auto mt-4 shadow-sm bg-white">
                                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                                            <thead className="bg-[#f9fafb] border-b border-[#c9cccf]">
                                                                <tr>
                                                                    <th className="px-4 py-2.5 font-semibold text-[#6d7175] text-xs uppercase tracking-wider">Variant Title</th>
                                                                    <th className="px-4 py-2.5 font-semibold text-[#6d7175] text-xs uppercase tracking-wider">Price (₹)</th>
                                                                    <th className="px-4 py-2.5 font-semibold text-[#6d7175] text-xs uppercase tracking-wider">Compare (₹)</th>
                                                                    <th className="px-4 py-2.5 font-semibold text-[#6d7175] text-xs uppercase tracking-wider">SKU</th>
                                                                    <th className="px-4 py-2.5 font-semibold text-[#6d7175] text-xs uppercase tracking-wider">Inventory</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-[#ebebeb] bg-white">
                                                                {formData.variants.map((v, idx) => (
                                                                    <tr key={idx} className="hover:bg-[#f9fafb] transition-colors">
                                                                        <td className="px-4 py-3 font-medium text-[#202223] bg-[#f9fafb]/50 border-r border-[#ebebeb]">{v.title}</td>
                                                                        <td className="px-4 py-3 border-r border-[#ebebeb]">
                                                                            <input type="number" step="0.01" className="w-24 bg-transparent border-b border-transparent hover:border-[#c9cccf] focus:border-[#008060] font-medium outline-none px-1 py-0.5" value={v.price} onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setFormData(prev => {
                                                                                    const n = [...prev.variants];
                                                                                    n[idx] = { ...n[idx], price: val };
                                                                                    return { ...prev, variants: n };
                                                                                });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-4 py-3 border-r border-[#ebebeb]">
                                                                            <input type="number" step="0.01" className="w-24 bg-transparent border-b border-transparent hover:border-[#c9cccf] focus:border-[#008060] font-medium outline-none px-1 py-0.5 text-[#6d7175]" value={v.compareAtPrice || ''} placeholder="0.00" onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setFormData(prev => {
                                                                                    const n = [...prev.variants];
                                                                                    n[idx] = { ...n[idx], compareAtPrice: val };
                                                                                    return { ...prev, variants: n };
                                                                                });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-4 py-3 border-r border-[#ebebeb]">
                                                                            <input type="text" className="w-full bg-transparent border-b border-transparent hover:border-[#c9cccf] focus:border-[#008060] font-mono text-xs text-[#202223] outline-none px-1 py-0.5" value={v.sku || ''} placeholder="SKU-AUTO" onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setFormData(prev => {
                                                                                    const n = [...prev.variants];
                                                                                    n[idx] = { ...n[idx], sku: val };
                                                                                    return { ...prev, variants: n };
                                                                                });
                                                                            }} />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <input type="number" className="w-full bg-transparent border-b border-transparent hover:border-[#c9cccf] focus:border-[#008060] text-[#202223] font-semibold outline-none px-1 py-0.5" value={v.stock} onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setFormData(prev => {
                                                                                    const n = [...prev.variants];
                                                                                    n[idx] = { ...n[idx], stock: val };
                                                                                    return { ...prev, variants: n };
                                                                                });
                                                                            }} />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* SIDEBAR COLUMN (RIGHT) */}
                                        <div className="lg:col-span-1 space-y-6">

                                            {/* Status */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Status</h4>
                                                <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="DRAFT">Draft</option>
                                                    <option value="ARCHIVED">Archived</option>
                                                </select>
                                            </div>

                                            {/* Organization */}
                                            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                                                <h4 className="text-sm font-semibold text-[#202223]">Product organization</h4>
                                                <div>
                                                    <label className="text-sm text-[#202223] mb-1 block">URL Slug</label>
                                                    <input required type="text" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none" value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-[#202223] mb-1 block">Category</label>
                                                    <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={formData.categoryId} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}>
                                                        <option value="">Select Category</option>
                                                        {categories.map(c => <option key={c.id} value={c.id}>{getTranslated(c.name)}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-[#202223] mb-1 block">Vendor</label>
                                                    <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={formData.vendorId} onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}>
                                                        <option value="">No vendor</option>
                                                        {vendors.map(v => <option key={v.id} value={v.id}>{getTranslated(v.name) || v.businessSlug}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-[#202223] mb-1 block">Farmer</label>
                                                    <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={formData.farmerId} onChange={(e) => setFormData(prev => ({ ...prev, farmerId: e.target.value }))}>
                                                        <option value="">No farmer</option>
                                                        {farmers.map(f => (
                                                            <option key={f.id} value={f.id}>
                                                                {getTranslated(f.name) || f.email}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-[#202223] mb-1 block">Shipping Profile</label>
                                                    <select className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none bg-white cursor-pointer" value={formData.shippingProfileId || ''} onChange={(e) => setFormData(prev => ({ ...prev, shippingProfileId: e.target.value }))}>
                                                        <option value="">Default (General)</option>
                                                        {shippingProfiles.map(sp => (
                                                            <option key={sp.id} value={sp.id}>
                                                                {sp.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-[#202223] mb-1 block">Tags</label>
                                                    <input type="text" placeholder="Find or create tags" className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] outline-none" value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* FIXED ACTION BAR AT BOTTOM */}
                            <div className="border-t border-[#c9cccf] bg-white p-4 flex items-center justify-end gap-3 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">Discard</button>
                                <button type="submit" disabled={isSubmitting} onClick={handleSubmit} className="px-4 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* BULK UPLOAD MODAL */}
                <BulkUploadModal
                    isOpen={isBulkUploadModalOpen}
                    onClose={() => setIsBulkUploadModalOpen(false)}
                    onUploadSuccess={() => {
                        setIsBulkUploadModalOpen(false);
                        fetchData();
                    }}
                />

                <style jsx global>{`
            .ql-container { min-height: 200px; font-family: inherit; font-size: 14px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; border: 1px solid #c9cccf !important; outline: none; }
            .ql-toolbar { border-top-left-radius: 6px; border-top-right-radius: 6px; border: 1px solid #c9cccf !important; background: #fafbfb; border-bottom: none !important; padding: 12px 16px !important; }
            .ql-editor { color: #202223; line-height: 1.5; outline: none !important; }
            .ql-container:focus-within { border-color: #008060 !important; box-shadow: 0 0 0 1px #008060; }
            .ql-toolbar:focus-within { border-color: #008060 !important; }
            
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
        </div>
    );
}