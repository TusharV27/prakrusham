'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
    Plus, Edit3, Trash2, Search, X, Check, ChevronLeft, ChevronRight, Eye, RefreshCw, 
    FileText, Tag, Clock, Globe, Loader2, ArrowRight, LayoutGrid, LayoutList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [blogs, setBlogs] = useState([]); // Categories
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeTab, setActiveTab] = useState('en'); // Translation tab
    const [language, setLanguage] = useState('en'); // Display language

    const [formData, setFormData] = useState({
        blogId: '',
        handle: '',
        image: '',
        isPublished: false,
        title: { en: '', hi: '', gu: '' },
        summaryHtml: { en: '', hi: '', gu: '' },
        bodyHtml: { en: '', hi: '', gu: '' },
    });

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/articles');
            const data = await res.json();
            if (data.success) {
                const processed = data.data.map(a => ({
                    ...a,
                    title: typeof a.title === 'string' ? JSON.parse(a.title) : a.title,
                    summaryHtml: typeof a.summaryHtml === 'string' ? JSON.parse(a.summaryHtml) : a.summaryHtml,
                    bodyHtml: typeof a.bodyHtml === 'string' ? JSON.parse(a.bodyHtml) : a.bodyHtml,
                }));
                setArticles(processed);
            }
        } catch (error) {
            console.error('Fetch articles error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/admin/blogs');
            const data = await res.json();
            if (data.success) {
                setBlogs(data.data);
            }
        } catch (error) {
            console.error('Fetch blogs error:', error);
        }
    };

    useEffect(() => {
        fetchArticles();
        fetchBlogs();
    }, []);

    const resetForm = () => {
        setFormData({
            blogId: '',
            handle: '',
            image: '',
            isPublished: false,
            title: { en: '', hi: '', gu: '' },
            summaryHtml: { en: '', hi: '', gu: '' },
            bodyHtml: { en: '', hi: '', gu: '' },
        });
        setIsEdit(false);
        setSelectedArticle(null);
        setActiveTab('en');
    };

    const handleEdit = (article) => {
        setIsEdit(true);
        setSelectedArticle(article);
        setFormData({
            blogId: article.blogId,
            handle: article.handle,
            image: article.image || '',
            isPublished: article.status === 'PUBLISHED',
            title: article.title || { en: '', hi: '', gu: '' },
            summaryHtml: article.summaryHtml || { en: '', hi: '', gu: '' },
            bodyHtml: article.bodyHtml || { en: '', hi: '', gu: '' },
        });
        setActiveTab(language);
        setShowFormModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const url = isEdit ? `/api/admin/articles/${selectedArticle.id}` : '/api/admin/articles';
            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                blogId: formData.blogId,
                handle: formData.handle,
                image: formData.image,
                status: formData.isPublished ? 'PUBLISHED' : 'DRAFT',
                title: formData.title.en,
                titleHi: formData.title.hi,
                titleGu: formData.title.gu,
                summaryHtml: formData.summaryHtml.en,
                summaryHtmlHi: formData.summaryHtml.hi,
                summaryHtmlGu: formData.summaryHtml.gu,
                bodyHtml: formData.bodyHtml.en,
                bodyHtmlHi: formData.bodyHtml.hi,
                bodyHtmlGu: formData.bodyHtml.gu,
                authorId: 'default_admin', 
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                await fetchArticles();
                setShowFormModal(false);
                resetForm();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Submit article error:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this article dossier?')) return;
        try {
            const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) await fetchArticles();
        } catch (error) {
            console.error('Delete article error:', error);
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

    const filteredArticles = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return articles.filter(a => {
            const title = (a.title?.[language] || a.title?.en || '').toLowerCase();
            return title.includes(q) || a.handle.toLowerCase().includes(q);
        });
    }, [articles, searchQuery, language]);

    const stats = {
        total: articles.length,
        published: articles.filter(a => a.isPublished).length,
        drafts: articles.filter(a => !a.isPublished).length
    };

    return (
        <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
            <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#202223]">Articles Management</h1>
                        <p className="text-[#6d7175] text-sm mt-1">Orchestrate blog content, narratives, and rich-text publications.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#6d7175] uppercase tracking-widest text-[10px]">Locale:</span>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-white border border-[#c9cccf] rounded text-sm px-2 py-1.5 outline-none focus:border-[#008060] shadow-sm text-[#202223] cursor-pointer"
                            >
                                <option value="en">English</option>
                                <option value="hi">हिंदी</option>
                                <option value="gu">ગુજરાતી</option>
                            </select>
                        </div>
                        <button
                            onClick={fetchArticles}
                            className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button 
                            onClick={() => { resetForm(); setShowFormModal(true); }}
                            className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            New Article
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Total Dossiers</p><h3 className="text-2xl font-bold text-[#202223]">{stats.total}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><FileText className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Published</p><h3 className="text-2xl font-bold text-[#008060]">{stats.published}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Check className="w-6 h-6" /></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
                        <div><p className="text-sm font-medium text-[#6d7175] mb-1">Staged Drafts</p><h3 className="text-2xl font-bold text-[#202223]">{stats.drafts}</h3></div>
                        <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Clock className="w-6 h-6" /></div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 border-b border-[#c9cccf] bg-[#fafbfb]">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                            <input 
                                type="text" 
                                placeholder="Search by title, handle, or category metadata..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#008060]" />
                                <p className="text-sm font-bold uppercase tracking-wider opacity-60">Synchronizing Manifest...</p>
                            </div>
                        ) : filteredArticles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-20 text-[#6d7175]">
                                <FileText className="w-12 h-12 mb-4 text-[#c9cccf]" />
                                <h3 className="text-lg font-medium text-[#202223] mb-1">No Articles Identified</h3>
                                <p className="text-sm italic">Adjust parameters or initiate a new narrative.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Narrative Unit</th>
                                            <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Classification</th>
                                            <th className="px-5 py-3 font-semibold uppercase tracking-widest text-sm text-center">Status</th>
                                            <th className="px-5 py-3 font-semibold uppercase tracking-widest text-[10px]">Staged Date</th>
                                            <th className="px-5 py-3 font-semibold uppercase tracking-widest text-sm text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ebebeb]">
                                        {filteredArticles.map((article) => (
                                            <tr key={article.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => handleEdit(article)}>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-[#f4f6f8] border border-[#c9cccf] overflow-hidden shrink-0">
                                                            {article.image ? (
                                                                <img src={article.image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#babfc3]">
                                                                    <FileText size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#202223] tracking-tight uppercase line-clamp-1">{article.title?.[language] || article.title?.en}</div>
                                                            <div className="text-sm font-bold text-[#6d7175] opacity-60 flex items-center gap-1">/{article.handle}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-[#6d7175] uppercase">
                                                        {article.blog?.title?.en || 'UNCLASSIFIED'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-sm font-black uppercase tracking-widest border ${
                                                        article.status === 'PUBLISHED' ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#fff5ea] text-[#8a6116] border-[#f9ead3]'
                                                    }`}>
                                                        {article.status === 'PUBLISHED' ? 'PUBLISHED' : 'STAGED DRAFT'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-[#202223] uppercase">{new Date(article.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-sm text-[#6d7175] opacity-60">Deployment Vector</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEdit(article)} className="p-1.5 text-[#8c9196] hover:text-[#202223] rounded-md hover:bg-white border border-transparent hover:border-[#c9cccf] transition-all"><Edit3 size={14} /></button>
                                                        <button onClick={() => handleDelete(article.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] border border-transparent hover:border-[#f9dada] transition-all"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Modal */}
                <AnimatePresence>
                    {showFormModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFormModal(false)} className="fixed inset-0 bg-[#00000080]" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[95vh] z-10">
                                <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white shrink-0">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{isEdit ? 'Patch Narrative' : 'Initialize Article'}</h3>
                                        <p className="text-sm font-black uppercase tracking-[0.1em] text-[#6d7175] opacity-60">Full configuration for rich-text publications.</p>
                                    </div>
                                    <button onClick={() => setShowFormModal(false)} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-[#f4f6f8]">
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                            {/* Configuration Panel */}
                                            <div className="lg:col-span-4 space-y-6">
                                                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-5 space-y-5">
                                                    <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                                                        <Globe size={16} className="text-[#008060]" />
                                                        <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">Metadata Config</h4>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Classification Category *</label>
                                                        <select
                                                            required
                                                            className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                                                            value={formData.blogId}
                                                            onChange={(e) => setFormData({...formData, blogId: e.target.value})}
                                                        >
                                                            <option value="">Select Category</option>
                                                            {blogs.map(b => (
                                                                <option key={b.id} value={b.id}>{b.title.en}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">URL Node Handle (Slug) *</label>
                                                        <input 
                                                            type="text" required placeholder="example-article-link"
                                                            className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060] font-mono"
                                                            value={formData.handle}
                                                            onChange={(e) => setFormData({...formData, handle: e.target.value})}
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Media Hub Reference (IMG URL)</label>
                                                        <input 
                                                            type="text" placeholder="https://..."
                                                            className="w-full bg-white border border-[#c9cccf] rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                                                            value={formData.image}
                                                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                                                        />
                                                    </div>

                                                    <div className="pt-2">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                                                 style={{ backgroundColor: formData.isPublished ? '#008060' : '#babfc3' }}
                                                                 onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                                                            >
                                                                <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${formData.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                                                            </div>
                                                            <span className="text-xs font-bold text-[#202223] uppercase tracking-widest">Live Status</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {formData.image && (
                                                    <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-2 overflow-hidden">
                                                        <img src={formData.image} className="w-full h-auto rounded" alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Narrative Editor Panel */}
                                            <div className="lg:col-span-8 space-y-6">
                                                <div className="flex bg-white p-1 rounded-lg border border-[#c9cccf] shadow-sm w-fit">
                                                    {['en', 'hi', 'gu'].map(lang => (
                                                        <button 
                                                            key={lang} type="button"
                                                            onClick={() => setActiveTab(lang)}
                                                            className={`px-5 py-2 rounded-md text-sm font-black uppercase tracking-widest transition-all ${activeTab === lang ? 'bg-[#202223] text-white shadow-md' : 'text-[#6d7175] hover:text-[#202223]'}`}
                                                        >
                                                            {lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Gujarati'}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Main Header Unit ({activeTab}) *</label>
                                                        <input 
                                                            type="text" required
                                                            className="w-full bg-[#fcfcfc] border border-[#c9cccf] rounded px-4 py-3 text-lg font-bold outline-none focus:border-[#008060] transition-all"
                                                            value={formData.title[activeTab]}
                                                            onChange={(e) => setFormData({
                                                                ...formData, 
                                                                title: { ...formData.title, [activeTab]: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Synopsis Excerpt ({activeTab})</label>
                                                        <textarea 
                                                            rows="2"
                                                            className="w-full bg-[#fcfcfc] border border-[#c9cccf] rounded px-4 py-3 text-sm outline-none focus:border-[#008060] transition-all resize-none"
                                                            value={formData.summaryHtml[activeTab]}
                                                            onChange={(e) => setFormData({
                                                                ...formData, 
                                                                summaryHtml: { ...formData.summaryHtml, [activeTab]: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Manifesto Body ({activeTab})</label>
                                                        <div className="prose-editor max-w-full">
                                                            <ReactQuill 
                                                                theme="snow"
                                                                modules={quillModules}
                                                                value={formData.bodyHtml[activeTab]}
                                                                onChange={(val) => setFormData({
                                                                    ...formData, 
                                                                    bodyHtml: { ...formData.bodyHtml, [activeTab]: val }
                                                                })}
                                                                className="bg-white rounded-lg overflow-hidden"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="px-5 py-4 border-t border-[#ebebeb] flex items-center justify-end gap-3 bg-white shrink-0">
                                    <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">Discard</button>
                                    <button 
                                        onClick={handleSubmit} 
                                        disabled={actionLoading}
                                        className="bg-[#008060] text-white px-8 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[170px] justify-center"
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : (isEdit ? <><Check size={16} /> Patch Narrative</> : <><Check size={16} /> Deploy Article</>)}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .ql-container { min-height: 350px; font-family: inherit; font-size: 0.875rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border: 1px solid #c9cccf !important; border-top: none !important; }
                    .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1px solid #c9cccf !important; background: #fafbfb; border-bottom: none !important; }
                    .ql-editor { color: #202223; line-height: 1.6; min-height: 350px; }
                    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 4px; }
                `}</style>
            </div>
        </div>
    );
};

export default ArticlesPage;
