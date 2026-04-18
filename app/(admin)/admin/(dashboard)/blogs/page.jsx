'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Plus, Search, Filter, Eye, Edit3, Trash2, X, ChevronLeft, ChevronRight,
  BookOpen, CheckCircle2, AlertCircle, Archive, Image as ImageIcon,
  Languages, ArrowLeft, Settings, MoreVertical, Tag, Hash, Star,
  UploadCloud, RefreshCw, FileText, Layers, TrendingUp, Clock, Globe,
  Check, LayoutGrid, LayoutList, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for React Quill
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ShopifyStyleBlogsPage() {
  // ---------------- VIEW STATE ----------------
  const [viewMode, setViewMode] = useState('articles'); // articles | categories
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalLanguage, setModalLanguage] = useState('en');

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [globalStats, setGlobalStats] = useState({ total: 0, published: 0, featured: 0, categories: 0 });
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ---------------- DATA ----------------
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------- FORM STATE ----------------
  const [articleForm, setArticleForm] = useState({
    blogId: '',
    handle: '',
    image: '', // Stores existing URL or new File object
    status: 'DRAFT',
    featured: false,
    title: { en: '', hi: '', gu: '' },
    summaryHtml: { en: '', hi: '', gu: '' },
    bodyHtml: { en: '', hi: '', gu: '' },
    tags: '',
    metafields: [],
  });

  const [categoryForm, setCategoryForm] = useState({
    title: { en: '', hi: '', gu: '' },
    handle: '',
    description: { en: '', hi: '', gu: '' },
    metafields: [],
  });

  const [selectedId, setSelectedId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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

  // ---------------- FETCHERS ----------------
  const fetchData = async (page = currentPage, query = debouncedSearch) => {
    try {
      setIsLoading(true);
      const articleParams = new URLSearchParams({
        page,
        limit: 10,
        search: query,
      });
      
      const [artRes, catRes] = await Promise.all([
        fetch(`/api/admin/articles?${articleParams.toString()}`),
        fetch('/api/admin/blogs')
      ]);
      const artData = await artRes.json();
      const catData = await catRes.json();

      if (artData.success) {
        setArticles(artData.data || []);
        if (artData.pagination) setPagination(artData.pagination);
        if (artData.stats) setGlobalStats(artData.stats);
      }
      if (catData.success) {
        setCategories(catData.data || []);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== '') setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ---------------- HANDLERS ----------------
  const resetForms = () => {
    setArticleForm({
      blogId: categories[0]?.id || '',
      handle: '',
      image: '',
      status: 'DRAFT',
      featured: false,
      title: { en: '', hi: '', gu: '' },
      summaryHtml: { en: '', hi: '', gu: '' },
      bodyHtml: { en: '', hi: '', gu: '' },
      tags: '',
      metafields: [],
    });
    setCategoryForm({
      title: { en: '', hi: '', gu: '' },
      handle: '',
      description: { en: '', hi: '', gu: '' },
      metafields: [],
    });
    setImagePreview(null);
    setIsEditMode(false);
    setSelectedId(null);
  };

  const handleEdit = async (item, type) => {
    setSelectedId(item.id);
    setIsEditMode(true);
    if (type === 'articles') {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/articles/${item.id}`);
        const result = await res.json();
        if (!result.success) throw new Error('Failed to load article');
        
        const fullItem = result.data;
        setArticleForm({
          blogId: fullItem.blogId,
          handle: fullItem.handle,
          image: fullItem.image || '',
          status: fullItem.status || 'DRAFT',
          featured: fullItem.featured || false,
          title: fullItem.title || {en:'',hi:'',gu:''},
          summaryHtml: fullItem.summaryHtml || {en:'',hi:'',gu:''},
          bodyHtml: fullItem.bodyHtml || {en:'',hi:'',gu:''},
          tags: fullItem.tags || '',
          metafields: fullItem.metafields || [],
        });
        setImagePreview(fullItem.image || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCategoryForm({
        title: item.title || {en:'',hi:'',gu:''},
        handle: item.handle,
        description: item.description || {en:'',hi:'',gu:''},
        metafields: item.metafields || [],
      });
    }
    setModalLanguage(language);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArticleForm({ ...articleForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isArticle = viewMode === 'articles';
    const url = isArticle 
      ? (isEditMode ? `/api/admin/articles/${selectedId}` : '/api/admin/articles')
      : (isEditMode ? `/api/admin/blogs/${selectedId}` : '/api/admin/blogs');
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      let res;
      if (isArticle) {
        const formData = new FormData();
        formData.append('blogId', articleForm.blogId);
        formData.append('handle', articleForm.handle);
        formData.append('status', articleForm.status);
        formData.append('featured', articleForm.featured);
        formData.append('tags', articleForm.tags);
        formData.append('authorId', 'default_admin');
        
        // Multi-lang titles/content
        formData.append('title', articleForm.title.en);
        formData.append('titleHi', articleForm.title.hi);
        formData.append('titleGu', articleForm.title.gu);
        formData.append('summaryHtml', articleForm.summaryHtml.en);
        formData.append('summaryHtmlHi', articleForm.summaryHtml.hi);
        formData.append('summaryHtmlGu', articleForm.summaryHtml.gu);
        formData.append('bodyHtml', articleForm.bodyHtml.en);
        formData.append('bodyHtmlHi', articleForm.bodyHtml.hi);
        formData.append('bodyHtmlGu', articleForm.bodyHtml.gu);

        // Image
        formData.append('image', articleForm.image);
        
        // Metafields
        formData.append('metafields', JSON.stringify(articleForm.metafields));

        res = await fetch(url, {
          method,
          body: formData, // No Content-Type header needed for FormData
        });
      } else {
        res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: categoryForm.title.en, titleHi: categoryForm.title.hi, titleGu: categoryForm.title.gu,
            handle: categoryForm.handle,
            description: categoryForm.description.en, descriptionHi: categoryForm.description.hi, descriptionGu: categoryForm.description.gu,
            metafields: categoryForm.metafields
          }),
        });
      }

      const result = await res.json();
      if (result.success) {
        await fetchData();
        setIsModalOpen(false);
        resetForms();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const url = type === 'articles' ? `/api/admin/articles/${id}` : `/api/admin/blogs/${id}`;
    try {
      const res = await fetch(url, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) await fetchData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'code-block'],
        ['clean']
    ],
  };

  // ---------------- FILTERED LISTS ----------------
  const filteredArticles = articles;

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      getTranslated(c.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm, language]);

  const stats = globalStats;

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#202223] uppercase tracking-tight">Narrative Management</h1>
              <p className="text-[#6d7175] text-sm mt-1">Orchestrate blog content, categories, and rich-text narratives across the ecosystem.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex bg-white p-1 rounded-md border border-[#c9cccf] shadow-sm">
                <button
                    onClick={() => setViewMode('articles')}
                    className={`px-4 py-1.5 rounded text-sm font-black uppercase tracking-widest transition-all ${
                        viewMode === 'articles' ? 'bg-[#202223] text-white' : 'text-[#8c9196] hover:text-[#202223]'
                    }`}
                >
                    Articles
                </button>
                <button
                    onClick={() => setViewMode('categories')}
                    className={`px-4 py-1.5 rounded text-sm font-black uppercase tracking-widest transition-all ${
                        viewMode === 'categories' ? 'bg-[#202223] text-white' : 'text-[#8c9196] hover:text-[#202223]'
                    }`}
                >
                    Categories
                </button>
              </div>

              <div className="flex items-center gap-2">
                 <button onClick={fetchData} className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                 </button>
                 <button
                    onClick={() => { resetForms(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-[#008060] text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} />
                    {viewMode === 'articles' ? 'New Post' : 'New Category'}
                  </button>
              </div>
            </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                <div><p className="text-sm font-medium text-[#6d7175] mb-1">Total Narratives</p><h3 className="text-2xl font-bold text-[#202223]">{stats.total}</h3></div>
                <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><FileText size={20} /></div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                <div><p className="text-sm font-medium text-[#6d7175] mb-1">Live Publications</p><h3 className="text-2xl font-bold text-[#008060]">{stats.published}</h3></div>
                <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Check size={20} /></div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                <div><p className="text-sm font-medium text-[#6d7175] mb-1">Featured Units</p><h3 className="text-2xl font-bold text-[#202223]">{stats.featured}</h3></div>
                <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Star size={20} /></div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                <div><p className="text-sm font-medium text-[#6d7175] mb-1">Taxonomies</p><h3 className="text-2xl font-bold text-[#202223]">{stats.categories}</h3></div>
                <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Layers size={20} /></div>
            </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
            <div className="p-3 border-b border-[#c9cccf] bg-[#fafbfb] flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                    <input 
                        type="text"
                        placeholder={`Search ${viewMode === 'articles' ? 'narratives' : 'categories'}...`}
                        className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex bg-white p-1 rounded-md border border-[#c9cccf] shadow-inner">
                    {['en', 'hi', 'gu'].map((l) => (
                        <button key={l} onClick={() => setLanguage(l)} className={`px-4 py-1 rounded text-sm font-black uppercase tracking-widest transition-all ${language === l ? 'bg-[#202223] text-white shadow-sm' : 'text-[#8c9196] hover:text-[#202223]'}`}>{l}</button>
                    ))}
                </div>
            </div>

            <div className="min-h-[400px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                        {viewMode === 'articles' ? (
                            <tr>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Narrative Objective</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Taxonomy</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Metadata Tags</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-sm text-center">Deployment State</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-sm text-right">Actions</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Category Entity</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">URL Descriptor</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-sm text-center">Post Density</th>
                                <th className="px-5 py-3 font-semibold uppercase tracking-widest text-sm text-right">Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-[#ebebeb]">
                        {isLoading ? (
                            <tr><td colSpan="5" className="px-6 py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#008060] mb-2" /> <p className="text-sm font-bold uppercase tracking-widest text-[#6d7175] opacity-60">Synchronizing Manifest...</p></td></tr>
                        ) : (viewMode === 'articles' ? filteredArticles : filteredCategories).length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-20 text-center text-[#6d7175] italic">No entities identified.</td></tr>
                        ) : (viewMode === 'articles' ? filteredArticles : filteredCategories).map((item) => (
                            <tr key={item.id} className="hover:bg-[#fafbfb] transition-all group cursor-pointer" onClick={() => handleEdit(item, viewMode)}>
                                {viewMode === 'articles' ? (
                                    <>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-[#f4f6f8] border border-[#c9cccf] overflow-hidden shrink-0">
                                                    {item.image ? <img src={item.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[#babfc3]"><ImageIcon size={20} /></div>}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-[#202223] tracking-tight uppercase line-clamp-1">{getTranslated(item.title)}</div>
                                                        {item.featured && <Star size={12} className="fill-amber-400 text-amber-400" />}
                                                    </div>
                                                    <div className="text-sm font-bold text-[#6d7175] opacity-60">/{item.handle}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-[#6d7175] uppercase">{getTranslated(item.blog?.title) || 'UNCLASSIFIED'}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags?.split(',').map((tag, idx) => (
                                                    <span key={idx} className="text-[9px] font-black uppercase text-[#008060] bg-[#f0f9f6] border border-[#d1e9e0] px-1.5 py-0.5 rounded">#{tag.trim()}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-sm font-black uppercase tracking-widest border ${item.status === 'PUBLISHED' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#fff5ea] text-[#8a6116] border-[#f9ead3]'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-5 py-4 font-bold text-[#202223] uppercase tracking-tight italic">{getTranslated(item.title)}</td>
                                        <td className="px-5 py-4 text-[11px] text-[#6d7175] font-mono opacity-80">/{item.handle}</td>
                                        <td className="px-5 py-4 text-center font-bold text-[#202223] uppercase tracking-tighter text-lg">{item.articleCount || 0}</td>
                                    </>
                                )}
                                <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => handleEdit(item, viewMode)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-white border border-transparent hover:border-[#c9cccf] transition-all"><Edit3 size={14} /></button>
                                        <button onClick={() => handleDelete(item.id, viewMode)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] border border-transparent hover:border-[#f9dada] transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination UI for Articles */}
            {viewMode === 'articles' && pagination.totalPages > 1 && (
                <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                    <p className="text-sm text-[#6d7175]">
                        Showing <span className="font-semibold text-[#202223]">{(currentPage - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> narratives
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
                                            className={`w-8 h-8 rounded border text-sm font-medium transition-all ${currentPage === pNum ? 'bg-[#202223] text-white border-[#202223] shadow-sm' : 'bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f4f6f8]'}`}
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

        {/* MODAL */}
        <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#00000080]" onClick={() => setIsModalOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[95vh] z-10">
                    {/* Header */}
                    <div className="px-5 py-4 flex items-center justify-between bg-white border-b border-[#ebebeb] shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{isEditMode ? 'Modify Entity' : 'Initialize Entity'}</h3>
                            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#6d7175] opacity-60">Configuring {viewMode === 'articles' ? 'Narrative Post' : 'Taxonomy Unit'}.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-[#f4f6f8]">
                        <form id="blogForm" onSubmit={handleSubmit} className="p-6 space-y-6">
                            {viewMode === 'categories' ? (
                                <>
                                    <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-5 space-y-5">
                                        <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><Globe size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Taxonomy Identity</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">EN Title *</label><input type="text" required value={categoryForm.title.en} onChange={(e) => setCategoryForm({...categoryForm, title: {...categoryForm.title, en: e.target.value}})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 outline-none focus:border-[#008060]" /></div>
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">HI पहचान</label><input type="text" value={categoryForm.title.hi} onChange={(e) => setCategoryForm({...categoryForm, title: {...categoryForm.title, hi: e.target.value}})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 outline-none focus:border-[#008060]" /></div>
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">GU ઓળખ</label><input type="text" value={categoryForm.title.gu} onChange={(e) => setCategoryForm({...categoryForm, title: {...categoryForm.title, gu: e.target.value}})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 outline-none focus:border-[#008060]" /></div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-5 space-y-5">
                                        <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><Tag size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Descriptor Handle</h4></div>
                                        <input type="text" required value={categoryForm.handle} onChange={(e) => setCategoryForm({...categoryForm, handle: e.target.value})} placeholder="e.g. news-updates" className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060] font-mono" />
                                    </div>

                                    <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-5 space-y-5">
                                        <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><FileText size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Taxonomy Description</h4></div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <textarea rows="4" value={categoryForm.description.en} onChange={(e) => setCategoryForm({...categoryForm, description: {...categoryForm.description, en: e.target.value}})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060] resize-none" placeholder="EN" />
                                            <textarea rows="4" value={categoryForm.description.hi} onChange={(e) => setCategoryForm({...categoryForm, description: {...categoryForm.description, hi: e.target.value}})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060] resize-none" placeholder="HI" />
                                            <textarea rows="4" value={categoryForm.description.gu} onChange={(e) => setCategoryForm({...categoryForm, description: {...categoryForm.description, gu: e.target.value}})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060] resize-none" placeholder="GU" />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                                        <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><Tag size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Blog Metafields</h4></div>
                                        <MetafieldValueEditor 
                                            ownerType="BLOGS"
                                            value={categoryForm.metafields}
                                            onChange={(newMs) => setCategoryForm(prev => ({ ...prev, metafields: newMs }))}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Sidebar Config */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-5 space-y-5 text-sm">
                                            <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><Settings size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Post Configuration</h4></div>
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">Classification Taxonomy *</label><select required value={articleForm.blogId} onChange={(e) => setArticleForm({...articleForm, blogId: e.target.value})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-1.5 outline-none focus:border-[#008060]">{categories.map(c => <option key={c.id} value={c.id}>{getTranslated(c.title)}</option>)}</select></div>
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">URL Scalar Descriptor *</label><input type="text" required value={articleForm.handle} onChange={(e) => setArticleForm({...articleForm, handle: e.target.value})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-1.5 outline-none focus:border-[#008060] font-mono" /></div>
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">Metadata Tags</label><input type="text" placeholder="farming, organic" value={articleForm.tags} onChange={(e) => setArticleForm({...articleForm, tags: e.target.value})} className="w-full bg-white border border-[#c9cccf] rounded px-3 py-1.5 outline-none focus:border-[#008060]" /></div>
                                            <div className="space-y-1.5"><label className="text-sm font-bold text-[#6d7175] uppercase">Deployment Vector</label><div className="flex gap-1.5 bg-[#f4f6f8] p-1 rounded-md">{['DRAFT', 'PUBLISHED', 'ARCHIVED'].map(s => (<button key={s} type="button" onClick={() => setArticleForm({...articleForm, status: s})} className={`flex-1 py-1 rounded text-[8px] font-black uppercase transition-all tracking-widest ${articleForm.status === s ? 'bg-[#202223] text-white shadow-sm' : 'text-[#6d7175] hover:text-[#202223]'}`}>{s}</button>))}</div></div>
                                            <label className="flex items-center gap-2 cursor-pointer group pt-2 px-1"><input type="checkbox" checked={articleForm.featured} onChange={(e) => setArticleForm({...articleForm, featured: e.target.checked})} className="w-3.5 h-3.5 text-[#008060] border-[#c9cccf] rounded focus:ring-[#008060]" /><span className="text-sm font-black uppercase text-[#202223] opacity-80 uppercase tracking-widest">Featured Deployment</span></label>
                                            <div className="space-y-1.5 pt-4 border-t border-[#f4f6f8]"><label className="text-sm font-bold text-[#6d7175] uppercase tracking-widest">Media Vector</label><div onClick={() => fileInputRef.current.click()} className="group relative aspect-video bg-[#f4f6f8] rounded-lg border border-dashed border-[#c9cccf] flex flex-col items-center justify-center cursor-pointer hover:border-[#008060] hover:bg-[#f0f9f6] transition-all overflow-hidden">{imagePreview ? (<><img src={imagePreview} className="w-full h-full object-cover" alt="" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><UploadCloud className="text-white" size={24} /></div></>) : (<div className="text-center"><ImageIcon size={24} className="mx-auto text-[#babfc3] mb-1" /><p className="text-sm font-bold text-[#6d7175] uppercase tracking-[0.2em] opacity-60">Upload</p></div>)}</div><input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} /></div>
                                        </div>
                                    </div>
                                    
                                    {/* Content Editor */}
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                                            <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><BookOpen size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Narrative Payload</h4></div>
                                            <div className="space-y-5">
                                                {['en', 'hi', 'gu'].map((l) => (
                                                    <div key={l} className="space-y-4 pt-2 first:pt-0 border-t border-[#f4f6f8] first:border-0">
                                                        <div className="flex items-center gap-2"><div className="px-2 py-0.5 rounded bg-[#f4f6f8] text-[9px] font-black text-[#202223] uppercase tracking-widest border border-[#c9cccf]">{l}</div><input type="text" placeholder={`Narrative Header (${l})`} required={l === 'en'} value={articleForm.title[l]} onChange={(e) => setArticleForm({...articleForm, title: {...articleForm.title, [l]: e.target.value}})} className="flex-1 bg-transparent border-0 border-b border-transparent focus:border-[#008060] outline-none text-base font-bold text-[#202223] placeholder:opacity-30" /></div>
                                                        <textarea placeholder={`Short Abstract (${l})`} rows="2" value={articleForm.summaryHtml[l]} onChange={(e) => setArticleForm({...articleForm, summaryHtml: {...articleForm.summaryHtml, [l]: e.target.value}})} className="w-full bg-[#fcfcfc] border border-[#c9cccf] rounded p-3 text-xs outline-none focus:border-[#008060] resize-none italic" />
                                                        <div className="prose-editor max-w-full"><ReactQuill theme="snow" modules={quillModules} value={articleForm.bodyHtml[l]} onChange={(v) => setArticleForm({...articleForm, bodyHtml: {...articleForm.bodyHtml, [l]: v}})} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6 text-sm">
                                            <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3 text-[#008060]"><Tag size={16} /><h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Article Metafields</h4></div>
                                            <MetafieldValueEditor 
                                                ownerType="ARTICLES"
                                                value={articleForm.metafields}
                                                onChange={(newMs) => setArticleForm(prev => ({ ...prev, metafields: newMs }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 bg-white border-t border-[#ebebeb] flex items-center justify-end gap-3 shrink-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors uppercase tracking-widest text-[10px]">Discard</button>
                        <button type="submit" form="blogForm" disabled={isSubmitting} className="bg-[#008060] text-white px-8 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 min-w-[150px] flex justify-center items-center gap-2 uppercase tracking-widest text-[10px]">
                            {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Check size={16} /> {isEditMode ? 'Patch Entity' : 'Deploy Entity'}</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
        </AnimatePresence>

        <style jsx global>{`
            .ql-container { min-height: 200px; font-family: inherit; font-size: 0.8125rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border: 1px solid #c9cccf !important; border-top: none !important; }
            .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1px solid #c9cccf !important; background: #fafbfb; padding: 12px !important; }
            .ql-editor { color: #202223; line-height: 1.6; min-height: 200px; }
            .ql-editor.ql-blank::before { color: #8c9196; font-style: normal; left: 15px; }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 3px; }
        `}</style>
      </div>
    </div>
  );
}