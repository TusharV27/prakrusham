'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Plus, Search, X, Edit3, Trash2, Tag, CalendarDays, Layers, Image as ImageIcon, Upload, Save, Globe, Loader2, ArrowLeft, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MetafieldValueEditor from '@/components/admin/MetafieldValueEditor';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en'); // Global display language
  const [modalLanguage, setModalLanguage] = useState('en'); // Modal data entry language

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data (Shared for Create & Edit)
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    nameHi: '',
    nameGu: '',
    slug: '',
    description: '',
    descriptionHi: '',
    descriptionGu: '',
    image: null,
    imagePreview: '',
    existingImage: '',
    icon: null,
    iconPreview: '',
    existingIcon: '',
    displayImage: null,
    displayImagePreview: '',
    existingDisplayImage: '',
    metafields: [],
  });

  // Translations
  const translations = {
    en: {
      pageTitle: 'Categories',
      pageDesc: 'Manage all product categories for your marketplace',
      totalCategories: 'Total Categories',
      searchPlaceholder: 'Search categories...',
      loading: 'Loading categories...',
      noCategories: 'No categories found',
      noCategoriesDesc: 'Create your first category to get started',
      createNew: 'Create New Category',
      editCategory: 'Edit Category',
      name: 'Name',
      slug: 'Slug',
      description: 'Description',
      products: 'Products',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this category?',
      created: 'Created',
      uploadImage: 'Category Image',
      dragDrop: 'Drag & drop or click to upload',
      supported: 'PNG, JPG, JPEG, WEBP • Max 5MB',
      creating: 'Creating Category...',
      updating: 'Updating Category...',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      dataLanguage: 'Entry Language'
    },
    hi: {
      pageTitle: 'श्रेणियाँ',
      pageDesc: 'अपने मार्केटप्लेस के सभी प्रोडक्ट श्रेणियों को प्रबंधित करें',
      totalCategories: 'कुल श्रेणियाँ',
      searchPlaceholder: 'श्रेणियाँ खोजें...',
      loading: 'श्रेणियाँ लोड हो रही हैं...',
      noCategories: 'कोई श्रेणी नहीं मिली',
      noCategoriesDesc: 'शुरू करने के लिए पहली श्रेणी बनाएँ',
      createNew: 'नई श्रेणी बनाएँ',
      editCategory: 'श्रेणी संपादित करें',
      name: 'नाम',
      slug: 'स्लग',
      description: 'विवरण',
      products: 'प्रोडक्ट्स',
      actions: 'क्रियाएँ',
      edit: 'संपादित करें',
      delete: 'हटाएँ',
      deleteConfirm: 'क्या आप वाकई इस श्रेणी को हटाना चाहते हैं?',
      created: 'बनाई गई',
      uploadImage: 'श्रेणी की इमेज',
      dragDrop: 'इमेज ड्रैग करें या क्लिक करें',
      supported: 'PNG, JPG, JPEG, WEBP • अधिकतम 5MB',
      creating: 'श्रेणी बनाई जा रही है...',
      updating: 'श्रेणी अपडेट की जा रही है...',
      cancel: 'रद्द करें',
      saveChanges: 'परिवर्तन सहेजें',
      dataLanguage: 'प्रविष्टि भाषा'
    },
    gu: {
      pageTitle: 'કેટેગરીઝ',
      pageDesc: 'તમારા માર્કેટપ્લેસ માટે તમામ પ્રોડક્ટ કેટેગરીઝ મેનેજ કરો',
      totalCategories: 'કુલ કેટેગરીઝ',
      searchPlaceholder: 'કેટેગરીઝ શોધો...',
      loading: 'કેટેગરીઝ લોડ થઈ રહી છે...',
      noCategories: 'કોઈ કેટેગરી મળી નથી',
      noCategoriesDesc: 'શરૂઆત કરવા માટે પહેલી કેટેગરી બનાવો',
      createNew: 'નવી કેટેગરી બનાવો',
      editCategory: 'કેટેગરી સંપાદિત કરો',
      name: 'નામ',
      slug: 'સ્લગ',
      description: 'વર્ણન',
      products: 'પ્રોડક્ટ્સ',
      actions: 'ક્રિયાઓ',
      edit: 'સંપાદિત કરો',
      delete: 'કાઢી નાખો',
      deleteConfirm: 'શું તમે ખરેખર આ કેટેગરી કાઢી નાખવા માંગો છો?',
      created: 'બનાવેલ',
      uploadImage: 'કેટેગરીની ઇમેજ',
      dragDrop: 'ઇમેજ ડ્રેગ કરો અથવા ક્લિક કરો',
      supported: 'PNG, JPG, JPEG, WEBP • મહત્તમ 5MB',
      creating: 'કેટેગરી બનાવી રહ્યા છીએ...',
      updating: 'કેટેગરી અપડેટ કરી રહ્યા છીએ...',
      cancel: 'રદ કરો',
      saveChanges: 'ફેરફાર સાચવો',
      dataLanguage: 'પ્રવેશ ભાષા'
    },
  };

  const t = translations[language] || translations.en;

  const getTranslated = (field, fallback = '') => {
    if (!field) return fallback;
    let parsed = field;
    if (typeof field === 'string') {
        try { parsed = JSON.parse(field); } catch (e) { return field; }
    }
    if (typeof parsed === 'object' && parsed !== null) {
        const v = parsed[language] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
        return v !== undefined && v !== null ? v : fallback;
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : fallback;
  };

  // Fetch Categories
  const fetchCategories = useCallback(async (currentPage = page, searchQuery = debouncedSearch) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchQuery
      });
      const response = await fetch(`/api/categories?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCategories(page, debouncedSearch);
  }, [page, fetchCategories]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch when debounced search actually changes
  useEffect(() => {
    fetchCategories(1, debouncedSearch);
  }, [debouncedSearch, fetchCategories]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      id: null,
      name: '', nameHi: '', nameGu: '',
      slug: '',
      description: '', descriptionHi: '', descriptionGu: '',
      image: null,
      imagePreview: '',
      existingImage: '',
      icon: null,
      iconPreview: '',
      existingIcon: '',
      displayImage: null,
      displayImagePreview: '',
      existingDisplayImage: '',
      metafields: [],
    });
    setModalLanguage('en');
    setIsCreateModalOpen(true);
    setIsEditModalOpen(false);
  };

  // Open Edit Modal
  const openEditModal = (category) => {
    setFormData({
      id: category.id,
      name: typeof category.name === 'object' ? category.name?.en || '' : category.name || '',
      nameHi: typeof category.name === 'object' ? category.name?.hi || '' : '',
      nameGu: typeof category.name === 'object' ? category.name?.gu || '' : '',
      slug: category.slug || '',
      description: typeof category.description === 'object' ? category.description?.en || '' : category.description || '',
      descriptionHi: typeof category.description === 'object' ? category.description?.hi || '' : '',
      descriptionGu: typeof category.description === 'object' ? category.description?.gu || '' : '',
      image: null,
      imagePreview: '',
      existingImage: category.image || '',
      icon: null,
      iconPreview: '',
      existingIcon: category.icon || '',
      displayImage: null,
      displayImagePreview: '',
      existingDisplayImage: category.displayImage || '',
      metafields: category.metafields || [],
    });
    setModalLanguage('en');
    setIsEditModalOpen(true);
    setIsCreateModalOpen(false);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
    if (formData.iconPreview) URL.revokeObjectURL(formData.iconPreview);
    if (formData.displayImagePreview) URL.revokeObjectURL(formData.displayImagePreview);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '', nameHi: '', nameGu: '',
      slug: '',
      description: '', descriptionHi: '', descriptionGu: '',
      image: null,
      imagePreview: '',
      existingImage: '',
      icon: null,
      iconPreview: '',
      existingIcon: '',
      displayImage: null,
      displayImagePreview: '',
      existingDisplayImage: '',
      metafields: [],
    });
  };

  // Form Handlers
  const handleNameChange = (val) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const fieldMap = { en: 'name', hi: 'nameHi', gu: 'nameGu' };
    setFormData((prev) => ({
      ...prev,
      [fieldMap[modalLanguage]]: val,
      ...(modalLanguage === 'en' && { slug })
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        existingImage: '',
      }));
    }
  };

  const removeImage = () => {
    if (formData.imagePreview) URL.revokeObjectURL(formData.imagePreview);
    setFormData((prev) => ({ ...prev, image: null, imagePreview: '', existingImage: '' }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.iconPreview) URL.revokeObjectURL(formData.iconPreview);
      setFormData((prev) => ({
        ...prev,
        icon: file,
        iconPreview: URL.createObjectURL(file),
        existingIcon: '',
      }));
    }
  };

  const removeIcon = () => {
    if (formData.iconPreview) URL.revokeObjectURL(formData.iconPreview);
    setFormData((prev) => ({ ...prev, icon: null, iconPreview: '', existingIcon: '' }));
  };

  const handleDisplayImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.displayImagePreview) URL.revokeObjectURL(formData.displayImagePreview);
      setFormData((prev) => ({
        ...prev,
        displayImage: file,
        displayImagePreview: URL.createObjectURL(file),
        existingDisplayImage: '',
      }));
    }
  };

  const removeDisplayImage = () => {
    if (formData.displayImagePreview) URL.revokeObjectURL(formData.displayImagePreview);
    setFormData((prev) => ({ ...prev, displayImage: null, displayImagePreview: '', existingDisplayImage: '' }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('name', formData.name.trim());
    fd.append('nameHi', formData.nameHi.trim());
    fd.append('nameGu', formData.nameGu.trim());
    fd.append('slug', formData.slug.trim());
    fd.append('description', formData.description.trim());
    fd.append('descriptionHi', formData.descriptionHi.trim());
    fd.append('descriptionGu', formData.descriptionGu.trim());

    if (formData.image) fd.append('image', formData.image);
    if (formData.icon) fd.append('icon', formData.icon);
    if (formData.displayImage) fd.append('displayImage', formData.displayImage);
    fd.append('metafields', JSON.stringify(formData.metafields));

    try {
      const url = isEditModalOpen ? `/api/categories/${formData.id}` : '/api/categories';
      const method = isEditModalOpen ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: fd });
      if (res.ok) {
        closeModals();
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit category');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const deleteCategory = async (id) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('Something went wrong');
    }
  };

  // Filtered Categories
  const displayedCategories = categories; // Now using server-paginated list directly

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 font-sans pb-10 w-full">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#202223]">{t.pageTitle}</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6d7175] uppercase">Lang:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white border border-[#c9cccf] rounded text-sm px-2 py-1 outline-none focus:border-[#008060] shadow-sm text-[#202223] cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="gu">ગુજરાતી</option>
              </select>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors"
            >
              <Plus size={16} />
              {t.createNew}
            </button>
          </div>
        </div>

        {/* LIST CARD */}
        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
          <div className="p-3 border-b border-[#c9cccf]">
            <div className="relative max-w-lg">
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

          {/* TABLE */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#f4f6f8] text-[#6d7175] border-b border-[#c9cccf]">
                <tr>
                  <th className="px-5 py-3 font-semibold w-[60px]">Banner</th>
                  <th className="px-5 py-3 font-semibold w-[60px]">Icon</th>
                  <th className="px-5 py-3 font-semibold w-[60px]">Display</th>
                  <th className="px-5 py-3 font-semibold">{t.name}</th>
                  <th className="px-5 py-3 font-semibold">{t.slug}</th>
                  <th className="px-5 py-3 font-semibold">{t.products}</th>
                  <th className="px-5 py-3 font-semibold">{t.created}</th>
                  <th className="px-5 py-3 font-semibold text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {isLoading ? (
                  <tr><td colSpan="8" className="px-5 py-20 text-center"><div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#008060]" /></div></td></tr>
                ) : displayedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-20 text-center">
                      <div className="text-[#6d7175] mb-4">{t.noCategories}</div>
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 bg-[#008060] text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-[#006e52] shadow-sm transition-colors"
                      >
                        <Plus size={16} /> {t.createNew}
                      </button>
                    </td>
                  </tr>
                ) : displayedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-[#fafbfb] transition-colors group cursor-pointer" onClick={() => openEditModal(category)}>
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center flex-shrink-0">
                        {category.image ? (
                          <img src={category.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#8c9196]" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center flex-shrink-0">
                        {category.icon ? (
                          <img src={category.icon} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#8c9196]" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded border border-[#c9cccf] overflow-hidden bg-[#f4f6f8] flex items-center justify-center flex-shrink-0">
                        {category.displayImage ? (
                          <img src={category.displayImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-[#8c9196]" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#202223] max-w-[300px] truncate">{getTranslated(category.name, 'Untitled')}</p>
                      <p className="text-xs text-[#6d7175] mt-0.5 truncate max-w-[300px]">{getTranslated(category.description) || 'No description'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex bg-[#f4f6f8] border border-[#c9cccf] px-2 py-0.5 rounded text-xs text-[#202223] font-mono">
                        /{category.slug || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#202223]">
                      <span className="inline-flex bg-[#e2f1fe] text-[#004e9c] border border-[#b0dcfb] px-2 py-0.5 rounded-full text-xs font-semibold">
                        {category._count?.products || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#6d7175] text-xs">
                      {new Date(category.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => deleteCategory(category.id)} className="p-1.5 text-[#8c9196] hover:text-[#d82c0d] rounded-md hover:bg-[#feeeee] transition-colors bg-white border border-[#c9cccf] shadow-sm ml-2">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[#c9cccf] flex items-center justify-between bg-[#fafbfb]">
              <p className="text-sm text-[#6d7175]">
                Showing <span className="font-semibold text-[#202223]">{(page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-[#202223]">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-[#202223]">{pagination.total}</span> categories
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className={`p-1.5 rounded border border-[#c9cccf] shadow-sm transition-all ${page === 1 ? 'text-[#c9cccf] cursor-not-allowed bg-white' : 'text-[#202223] hover:bg-white bg-[#f4f6f8]'}`}
                >
                  <ChevronLeft size={16} className="text-inherit" />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pNum = i + 1;
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
                  <ChevronRight size={16} className="text-inherit" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {(isCreateModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 z-[200] flex flex-col bg-[#f4f6f8]">

              {/* MODAL HEADER */}
              <div className="px-4 py-3 border-b border-[#c9cccf] flex items-center justify-between bg-white z-20 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={closeModals} className="p-1.5 text-[#6d7175] hover:text-[#202223] rounded-md hover:bg-[#f4f6f8] transition-colors border border-transparent">
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-lg font-bold text-[#202223]">{isEditModalOpen ? t.editCategory : t.createNew}</h3>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <form id="categoryForm" onSubmit={handleFormSubmit} className="p-4 md:p-8 max-w-[1000px] mx-auto pb-32">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* MAIN COL */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-5">
                        <h4 className="text-sm font-semibold text-[#202223]">Identity Details</h4>

                        <div>
                          <label className="text-sm font-semibold text-[#202223] mb-1 block">Name (en) *</label>
                          <input type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)} required className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-[#202223] mb-1 block">Description (en)</label>
                          <textarea rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none resize-none" />
                        </div>

                        <div className="pt-4 border-t border-[#ebebeb]">
                          <h4 className="text-sm font-semibold text-[#202223] mb-4">Translations</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-semibold text-[#202223] mb-1 block">नाम (hi)</label>
                              <input type="text" value={formData.nameHi} onChange={e => setFormData(p => ({ ...p, nameHi: e.target.value }))} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#202223] mb-1 block">विवरण (hi)</label>
                              <textarea rows={2} value={formData.descriptionHi} onChange={e => setFormData(p => ({ ...p, descriptionHi: e.target.value }))} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none resize-none" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#202223] mb-1 block">નામ (gu)</label>
                              <input type="text" value={formData.nameGu} onChange={e => setFormData(p => ({ ...p, nameGu: e.target.value }))} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#202223] mb-1 block">વર્ણન (gu)</label>
                              <textarea rows={2} value={formData.descriptionGu} onChange={e => setFormData(p => ({ ...p, descriptionGu: e.target.value }))} className="w-full border border-[#c9cccf] shadow-inner rounded-md px-3 py-1.5 text-sm text-[#202223] focus:border-[#008060] focus:ring-1 focus:ring-[#008060] outline-none resize-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <MetafieldValueEditor 
                        value={formData.metafields || []} 
                        onChange={(newMeta) => setFormData(prev => ({ ...prev, metafields: newMeta }))}
                        ownerType="COLLECTIONS"
                      />
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                        <h4 className="text-sm font-semibold text-[#202223]">{t.uploadImage}</h4>
                        <div className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group w-full max-w-[200px] mx-auto">
                          {formData.imagePreview || formData.existingImage ? (
                            <>
                              <img src={formData.imagePreview || formData.existingImage} className="w-full h-full object-cover" />
                              <button type="button" onClick={removeImage} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center text-[#202223] hover:bg-[#fafbfb] cursor-pointer transition-colors gap-2 text-sm font-medium">
                              <UploadCloud size={24} className="text-[#6d7175]" />
                              <span>Upload</span>
                              <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-center text-[#6d7175]">{t.supported}</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                        <h4 className="text-sm font-semibold text-[#202223]">Category Icon</h4>
                        <div className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group w-full max-w-[200px] mx-auto">
                          {formData.iconPreview || formData.existingIcon ? (
                            <>
                              <img src={formData.iconPreview || formData.existingIcon} className="w-full h-full object-cover" />
                              <button type="button" onClick={removeIcon} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center text-[#202223] hover:bg-[#fafbfb] cursor-pointer transition-colors gap-2 text-sm font-medium">
                              <UploadCloud size={24} className="text-[#6d7175]" />
                              <span>Upload Icon</span>
                              <input type="file" onChange={handleIconChange} className="hidden" accept="image/*" />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-center text-[#6d7175]">GIF, PNG, JPG, WEBP • Max 2MB</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                        <h4 className="text-sm font-semibold text-[#202223]">Display Icon (Homepage)</h4>
                        <div className="relative aspect-square rounded border border-[#c9cccf] bg-[#f4f6f8] overflow-hidden group w-full max-w-[200px] mx-auto">
                          {formData.displayImagePreview || formData.existingDisplayImage ? (
                            <>
                              <img src={formData.displayImagePreview || formData.existingDisplayImage} className="w-full h-full object-cover" />
                              <button type="button" onClick={removeDisplayImage} className="absolute top-1.5 right-1.5 w-6 h-6 bg-white border border-[#c9cccf] text-[#d82c0d] rounded shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fafbfb]"><X size={14} /></button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center text-[#202223] hover:bg-[#fafbfb] cursor-pointer transition-colors gap-2 text-sm font-medium">
                              <UploadCloud size={24} className="text-[#6d7175]" />
                              <span>Upload Display Icon</span>
                              <input type="file" onChange={handleDisplayImageChange} className="hidden" accept="image/*" />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-center text-[#6d7175]">PNG, JPG, WEBP • Max 2MB</p>
                      </div>

                      <div className="bg-white p-5 rounded-lg border border-[#c9cccf] shadow-sm space-y-4">
                        <h4 className="text-sm font-semibold text-[#202223]">URL Slug</h4>
                        <div className="flex items-center border border-[#c9cccf] shadow-inner rounded-md px-2 py-1.5 focus-within:border-[#008060] focus-within:ring-1 focus-within:ring-[#008060] bg-white text-sm text-[#202223]">
                          <span className="text-[#6d7175]">/</span>
                          <input type="text" value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} className="flex-1 outline-none ml-1 bg-transparent" />
                        </div>
                        <p className="text-xs text-[#6d7175]">Auto-generated from English name</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* FIXED ACTION BAR */}
              <div className="border-t border-[#c9cccf] bg-white p-4 flex items-center justify-end gap-3 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={closeModals} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-medium hover:bg-[#fafbfb] shadow-sm transition-colors">{t.cancel}</button>
                <button type="submit" form="categoryForm" disabled={isSubmitting || !formData.name.trim()} className="px-4 py-1.5 rounded-md bg-[#008060] text-white text-sm font-medium hover:bg-[#006e52] shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                  {isEditModalOpen ? t.saveChanges : t.createNew}
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        <style jsx global>{`
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