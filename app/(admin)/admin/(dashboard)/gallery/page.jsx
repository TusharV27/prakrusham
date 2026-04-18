'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Plus, Search, Eye, Trash2, X, UploadCloud, Image as ImageIcon,
  Tag, Pencil, Check, CalendarDays, Layers, RefreshCw, AlertCircle, Clock,
  MoreHorizontal, Download, LayoutGrid, LayoutList, Languages, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [language, setLanguage] = useState('en');
  const [imagesList, setImagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [altText, setAltText] = useState('');
  const [altTextHi, setAltTextHi] = useState('');
  const [altTextGu, setAltTextGu] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewImage, setViewImage] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [globalStats, setGlobalStats] = useState({ total: 0, used: 0, unused: 0 });
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 20 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ─── TRANSLATIONS ───────────────────────────────────────────────────────────
  const translations = {
    en: {
      pageTitle: 'Gallery',
      pageDesc: 'Consolidated asset repository for products, campaigns, and farmer profiles.',
      uploadImages: 'Upload Assets',
      totalImages: 'Total Assets',
      used: 'Live Usage',
      unused: 'Staged Assets',
      searchPlaceholder: 'Search by metadata or alt-text descriptors...',
      loadingImages: 'Accessing Asset Repository...',
      noImagesFound: 'No assets found',
      noImagesDesc: 'Upload images to start building your visual library.',
      uploadNewImages: 'Deploy New Assets',
      dragDropText: 'Drag & DROP vectors or CLICK to select multiple assets',
      supportedFormats: 'Standard Image Vectors (PNG, JPG, WEBP) · Max 10MB',
      uploading: 'Deploying Assets...',
      uploadSuccess: 'Assets deployed successfully!',
      deleteConfirm: 'Decommission this asset? This action cannot be reversed.',
      editImage: 'Configure Asset Metadata',
      altTextLabel: 'Visual Metadata',
      altTextPlaceholder: 'Describe asset for screen readers...',
      save: 'Apply Configuration',
      cancel: 'Discard',
      noDescription: 'No metadata assigned',
    },
    hi: {
      pageTitle: 'गैलरी',
      pageDesc: 'उत्पादों, अभियानों और किसान प्रोफाइल के लिए समेकित संपत्ति भंडार।',
      uploadImages: 'संपत्ति अपलोड करें',
      totalImages: 'कुल संपत्ति',
      used: 'लाइव उपयोग',
      unused: 'अनुपयोगी संपत्ति',
      searchPlaceholder: 'मेटाडेटा या विवरण खोजें...',
      loadingImages: 'संपत्ति भंडार लोड हो रहा है...',
      noImagesFound: 'कोई संपत्ति नहीं मिली',
      noImagesDesc: 'अपनी विजुअल लाइब्रेरी बनाना शुरू करने के लिए इमेजेस अपलोड करें।',
      uploadNewImages: 'नई संपत्ति तैनात करें',
      dragDropText: 'संपत्ति ड्रैग करें या चुनने के लिए क्लिक करें',
      supportedFormats: 'मानक इमेज (PNG, JPG, WEBP) · अधिकतम 10MB',
      uploading: 'संपत्ति तैनात हो रही है...',
      uploadSuccess: 'संपत्ति सफलतापूर्वक तैनात हो गई!',
      deleteConfirm: 'क्या आप इस संपत्ति को हटाना चाहते हैं?',
      editImage: 'परिसंपत्ति मेटाडेटा कॉन्फ़िगर करें',
      altTextLabel: 'विजुअल मेटाडेटा',
      altTextPlaceholder: 'विवरण लिखें...',
      save: 'कॉन्फ़िगरेशन लागू करें',
      cancel: 'रद्द करें',
      noDescription: 'कोई मेटाडेटा असाइन नहीं किया गया',
    },
    gu: {
      pageTitle: 'ગેલેરી',
      pageDesc: 'પ્રોડક્ટ્સ, ઝુંબેશ અને ખેડૂતોની રૂપરેખા માટે એકીકૃત એસેટ રિપોઝીટરી.',
      uploadImages: 'એસેટ અપલોડ કરો',
      totalImages: 'કુલ એસેટ',
      used: 'લાઇવ વપરાશ',
      unused: 'ન વપરાયેલ એસેટ',
      searchPlaceholder: 'મેટાડેટા અથવા વર્ણન દ્વારા શોધો...',
      loadingImages: 'એસેટ રિપોઝીટરી એક્સેસ કરી રહ્યા છીએ...',
      noImagesFound: 'કોઈ એસેટ મળી નથી',
      noImagesDesc: 'તમારી વિઝ્યુઅલ લાઇબ્રેરી બનાવવાનું શરૂ કરવા માટે ઇમેજીસ અપલોડ કરો.',
      uploadNewImages: 'નવી એસેટ તૈનાત કરો',
      dragDropText: 'એસેટ ડ્રેગ કરો અથવા પસંદ કરવા માટે ક્લિક કરો',
      supportedFormats: 'સ્ટાન્ડર્ડ ઇમેજ (PNG, JPG, WEBP) · મહત્તમ 10MB',
      uploading: 'એસેટ તૈનાત થઈ રહી છે...',
      uploadSuccess: 'એસેટ સફળતાપૂર્વક તૈનાત કરવામાં આવી!',
      deleteConfirm: 'શું તમે આ એસેટને દૂર કરવા માંગો છો?',
      editImage: 'એસેટ મેટાડેટા ગોઠવો',
      altTextLabel: 'વિઝ્યુઅલ મેટાડેટા',
      altTextPlaceholder: 'વર્ણન કરો...',
      save: 'ગોઠવણી લાગુ કરો',
      cancel: 'રદ કરો',
      noDescription: 'કોઈ મેટાડેટા અસાઇન કરેલ નથી',
    },
  };

  const t = translations[language];

  // ─── FETCH IMAGES ────────────────────────────────────────────────────────────
  const fetchImages = async (page = currentPage, query = debouncedSearch) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({ page, limit: 20, search: query });
      const response = await fetch(`/api/images?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImagesList(data.images || data || []);
      if (data.pagination) setPagination(data.pagination);
      if (data.stats) setGlobalStats(data.stats);
    } catch (error) {
      console.error('Fetch error:', error);
      setImagesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  // ─── FILE HANDLER ────────────────────────────────────────────────────────────
  const processFiles = (files) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setSelectedFiles((prev) => [...prev, ...valid]);
    const previews = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleFileChange = (e) => processFiles(e.target.files || []);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removePreview = (index) => {
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetUploadForm = () => {
    imagePreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    setSelectedFiles([]);
    setImagePreviews([]);
    setAltText('');
    setAltTextHi('');
    setAltTextGu('');
  };

  // ─── UPLOAD ──────────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('images', file));
      if (altText.trim()) formData.append('altText', altText.trim());
      if (altTextHi.trim()) formData.append('altTextHi', altTextHi.trim());
      if (altTextGu.trim()) formData.append('altTextGu', altTextGu.trim());
      const response = await fetch('/api/images', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      await fetchImages();
      resetUploadForm();
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to drop assets. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── DELETE ──────────────────────────────────────────────────────────────────
  const deleteImage = async (id) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchImages();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // ─── EDIT ────────────────────────────────────────────────────────────────────
  const openEdit = (img) => {
    setEditingImage(img);
    setFormEdit({
      en: img.altText || '',
      hi: img.altTextHi || '',
      gu: img.altTextGu || ''
    });
    setIsEditModalOpen(true);
  };

  const [formEdit, setFormEdit] = useState({ en: '', hi: '', gu: '' });

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    try {
      const res = await fetch(`/api/images/${editingImage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          altText: formEdit.en.trim(),
          altTextHi: formEdit.hi.trim(),
          altTextGu: formEdit.gu.trim()
        }),
      });
      if (res.ok) {
        await fetchImages();
        setIsEditModalOpen(false);
        setEditingImage(null);
      }
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  // ─── FILTER & PAGINATION ───────────────────────────────────────────────────
  useEffect(() => {
      const timer = setTimeout(() => {
          setDebouncedSearch(searchTerm);
          if (searchTerm !== '') setCurrentPage(1);
      }, 500);
      return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredImages = imagesList;

  const isUsed = (img) =>
    img.productId || img.eventId || img.farmerId || img.vendorId || img.warehouseId || img.offerId;

  const stats = globalStats;

  const closeUpload = () => {
    resetUploadForm();
    setIsUploadModalOpen(false);
  };

  const openViewer = (img) => {
    setViewImage(img);
    setIsViewerOpen(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-10">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#202223]">{t.pageTitle}</h1>
            <p className="text-[#6d7175] text-sm mt-1">{t.pageDesc}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#6d7175] uppercase">Display:</span>
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
              onClick={fetchImages}
              className="p-1.5 rounded bg-white border border-[#c9cccf] text-[#6d7175] hover:text-[#202223] transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {t.uploadImages}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.totalImages}</p><h3 className="text-2xl font-bold text-[#202223]">{stats.total}</h3></div>
            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Layers className="w-6 h-6" /></div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.used}</p><h3 className="text-2xl font-bold text-[#008060]">{stats.used}</h3></div>
            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Check size={18} /></div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#6d7175] mb-1">{t.unused}</p><h3 className="text-2xl font-bold text-[#f29339]">{stats.unused}</h3></div>
            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><Clock size={18} /></div>
          </div>
          <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm flex items-center justify-between">
            <div><p className="text-sm font-medium text-[#6d7175] mb-1">Utilization</p><h3 className="text-2xl font-bold text-[#202223]">{stats.total ? Math.round((stats.used/stats.total)*100) : 0}%</h3></div>
            <div className="p-3 rounded-full bg-[#f4f6f8] text-[#8c9196]"><TrendingUp size={18} /></div>
          </div>
        </div>

        {/* Search & Main Filter Card */}
        <div className="bg-white border border-[#c9cccf] rounded-lg shadow-sm overflow-hidden">
          <div className="p-3 border-b border-[#c9cccf] bg-[#fafbfb]">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c9196]" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-[#c9cccf] rounded-md text-sm text-[#202223] outline-none focus:border-[#008060] focus:ring-1 focus:ring-[#008060] shadow-inner"
                />
              </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
                <p className="text-[#6d7175] text-sm font-bold uppercase tracking-widest opacity-60">{t.loadingImages}</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#f4f6f8] border border-[#c9cccf] flex items-center justify-center">
                  <ImageIcon size={32} className="text-[#babfc3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#202223]">{t.noImagesFound}</h3>
                  <p className="text-[#6d7175] text-sm mt-1">{t.noImagesDesc}</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#008060] text-white px-4 py-2 rounded-md font-bold text-xs uppercase hover:bg-[#006e52] shadow-sm transition-all"
                >
                  <Plus size={14} />
                  {t.uploadImages}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredImages.map((img) => (
                  <ImageCard
                    key={img.id}
                    img={img}
                    t={t}
                    activeLang={language}
                    isUsed={isUsed(img)}
                    onView={() => openViewer(img)}
                    onEdit={() => openEdit(img)}
                    onDelete={() => deleteImage(img.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
              <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
                  <p className="text-sm text-[#6d7175]">
                      Showing <span className="font-semibold text-[#202223]">{(currentPage - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(currentPage * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> assets
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
                                          className={`w-8 h-8 rounded border text-sm font-medium transition-all ${currentPage === pNum ? 'bg-[#008060] text-white border-[#008060] shadow-sm' : 'bg-white text-[#202223] border-[#c9cccf] hover:bg-[#f4f6f8]'}`}
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
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeUpload} className="fixed inset-0 bg-[#00000080]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white shrink-0">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{t.uploadNewImages}</h3>
                  <p className="text-sm font-black uppercase tracking-[0.1em] text-[#6d7175] opacity-60">{t.dragDropText}</p>
                </div>
                <button onClick={closeUpload} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#f4f6f8] p-6 space-y-6">
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-56 cursor-pointer transition-all ${
                    isDragging ? 'border-[#008060] bg-[#f0f9f6]' : 'border-[#c9cccf] bg-white hover:bg-[#fafbfb]'
                  }`}
                >
                  <UploadCloud size={40} className={`mb-3 ${isDragging ? 'text-[#008060]' : 'text-[#8c9196]'}`} />
                  <p className="text-sm font-bold text-[#202223]">{t.dragDropText}</p>
                  <p className="text-sm text-[#6d7175] font-black uppercase tracking-widest mt-2">{t.supportedFormats}</p>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {imagePreviews.map((item, index) => (
                      <div key={index} className="relative aspect-square rounded border border-[#c9cccf] overflow-hidden group bg-white shadow-sm">
                        <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(index)}
                          className="absolute top-1 right-1 bg-white/95 text-[#d82c0d] p-1 rounded hover:bg-[#feeeee] shadow transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-3">
                        <Tag size={16} className="text-[#008060]" />
                        <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">{t.altTextLabel}</h4>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">English Descriptor</label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="e.g., Organic Red Tomato"
                        className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">हिंदी विवरण</label>
                      <input
                        type="text"
                        value={altTextHi}
                        onChange={(e) => setAltTextHi(e.target.value)}
                        placeholder="उदा. जैविक लाल टमाटर"
                        className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">ગુજરાતી વર્ણન</label>
                      <input
                        type="text"
                        value={altTextGu}
                        onChange={(e) => setAltTextGu(e.target.value)}
                        placeholder="દા.ત. ઓર્ગેનિક લાલ ટામેટાં"
                        className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-white border-t border-[#ebebeb] flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={closeUpload}
                  className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="bg-[#008060] text-white px-6 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2 min-w-[150px] justify-center"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      {selectedFiles.length > 0 ? `Deploy ${selectedFiles.length} Assets` : t.uploadImages}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-[#00000080]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 border-b border-[#ebebeb] flex items-center justify-between bg-white shrink-0">
                <h3 className="text-lg font-bold text-[#202223] uppercase tracking-tight">{t.editImage}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto bg-[#f4f6f8] p-6 space-y-6">
                <div className="aspect-video relative rounded-lg border border-[#c9cccf] bg-white shadow-sm overflow-hidden flex items-center justify-center">
                  <img
                    src={editingImage.url}
                    alt={editingImage.altText}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-3 right-3">
                     <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${isUsed(editingImage) ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#fff5ea] text-[#8a6116] border-[#f9ead3]'}`}>
                       {isUsed(editingImage) ? t.used : t.unused}
                     </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm p-6 space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#f4f6f8] pb-2">
                      <Tag size={16} className="text-[#008060]" />
                      <h4 className="text-sm font-black text-[#6d7175] uppercase tracking-widest">{t.altTextLabel}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">Alt Text (EN)</label>
                      <input
                        type="text"
                        value={formEdit.en}
                        onChange={(e) => setFormEdit({...formEdit, en: e.target.value})}
                        className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">अल्ट टेक्स्ट (HI)</label>
                      <input
                        type="text"
                        value={formEdit.hi}
                        onChange={(e) => setFormEdit({...formEdit, hi: e.target.value})}
                        className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-[#6d7175] uppercase tracking-tight">અલ્ટ ટેક્સ્ટ (GU)</label>
                      <input
                        type="text"
                        value={formEdit.gu}
                        onChange={(e) => setFormEdit({...formEdit, gu: e.target.value})}
                        className="w-full bg-[#fcfcfc] border border-[#c9cccf] shadow-inner rounded px-3 py-2 text-sm outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-white border-t border-[#ebebeb] flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-[#008060] text-white px-6 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors min-w-[150px]"
                >
                   {t.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Full Screen Viewer Modal */}
      <AnimatePresence>
        {isViewerOpen && viewImage && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsViewerOpen(false)} 
              className="absolute inset-0 cursor-zoom-out" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative max-w-full max-h-full flex flex-col items-center justify-center z-10"
            >
              <button 
                onClick={() => setIsViewerOpen(false)}
                className="absolute -top-12 right-0 md:-right-12 p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
              >
                <X size={24} />
              </button>
              
              <div className="relative group bg-white/5 p-2 rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-[90vw] max-h-[80vh]">
                <img
                  src={viewImage.url}
                  alt={viewImage.altText}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-tight">
                            {viewImage[`altText${language === 'en' ? '' : language.charAt(0).toUpperCase() + language.slice(1)}`] || viewImage.altText || t.noDescription}
                        </h4>
                        <p className="text-white/60 text-sm uppercase font-black tracking-widest mt-1">
                            {new Date(viewImage.createdAt).toLocaleDateString()} · {(viewImage.size / 1024).toFixed(0)} KB
                        </p>
                    </div>
                    {/* <div className="flex gap-4">
                        <button onClick={() => window.open(viewImage.url, '_blank')} className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <Download size={14} /> Source
                        </button>
                    </div> */}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c9cccf; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8c9196; }
      `}</style>
    </div>
  );
}

// ─── IMAGE CARD ────────────────────────────────────────────────────────────
function ImageCard({ img, t, activeLang, isUsed, onView, onEdit, onDelete }) {
  const displayAlt = img[`altText${activeLang === 'en' ? '' : activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}`] || img.altText || '';

  return (
    <div className="group relative bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-square relative overflow-hidden bg-[#f4f6f8] cursor-pointer" onClick={onView}>
        <img
          src={img.url}
          alt={displayAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Status Chip */}
        <div className="absolute top-2 right-2">
           <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-sm border ${
             isUsed ? 'bg-[#aee9d1] text-[#006e52] border-[#89d6bb]' : 'bg-[#fff5ea] text-[#8a6116] border-[#f9ead3]'
           }`}>
             {isUsed ? 'LIVE' : 'IDLE'}
           </span>
        </div>

        {/* Floating Actions on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button onClick={(e) => {e.stopPropagation(); onView();}} className="p-2 bg-white text-[#202223] rounded-full hover:bg-[#fafbfb] shadow-lg transition-transform hover:scale-110"><Eye size={16} /></button>
            <button onClick={(e) => {e.stopPropagation(); onEdit();}} className="p-2 bg-white text-[#008060] rounded-full hover:bg-[#f0f9f6] shadow-lg transition-transform hover:scale-110"><Pencil size={16} /></button>
            <button onClick={(e) => {e.stopPropagation(); onDelete();}} className="p-2 bg-white text-[#d82c0d] rounded-full hover:bg-[#feeeee] shadow-lg transition-transform hover:scale-110"><Trash2 size={16} /></button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-t border-[#ebebeb]">
        <p className="text-[11px] font-bold text-[#202223] truncate tracking-tight h-4">
          {displayAlt || <span className="text-[#babfc3] italic font-normal">{t.noDescription}</span>}
        </p>
        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-[#8c9196] tracking-widest">
                <CalendarDays size={10} />
                <span>{new Date(img.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-[#8c9196] tracking-widest">
                <Download size={10} />
                <span>{(img.size / 1024).toFixed(0)} KB</span>
            </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for TrendingUp icon
function TrendingUp({ className, size }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
    );
}