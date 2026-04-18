"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft, Info, ChevronRight, Database, Tag, Layers, Box, Users, 
    ShoppingBag, FileEdit, Briefcase, Globe, MapPin, FileText, 
    Rss, Edit2, Store, Plus, GripVertical, ChevronUp, ChevronDown, PlusCircle,
    Type, AlignLeft, FileJson, Hash, Image, Video, Link, Calendar, Palette,
    CheckSquare, Search, X, Star, Weight, Maximize2, Droplets, Trash2,
    Pipette, Pin, Loader2, PenSquare, AlertCircle, ChevronsUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const metafieldEntities = [
    { id: 'products', icon: Tag, label: "Products" },
    { id: 'variants', icon: Layers, label: "Variants" },
    { id: 'collections', icon: Box, label: "Collections" },
    { id: 'customers', icon: Users, label: "Customers" },
    { id: 'vendors', icon: Users, label: "Vendors" },
    { id: 'farmers', icon: Users, label: "Farmers" },
    { id: 'warehouses', icon: Store, label: "Warehouses" },
    { id: 'orders', icon: ShoppingBag, label: "Orders" },
    { id: 'pages', icon: FileText, label: "Pages" },
    { id: 'blogs', icon: Rss, label: "Blogs" },
    { id: 'articles', icon: Edit2, label: "Blog posts" },
];

const fieldTypes = [
    {
        category: "TEXT",
        types: [
            { id: "single_line", name: "Single line text", desc: "One line of text", icon: Type },
            { id: "multi_line", name: "Multi-line text", desc: "Multiple lines of text", icon: AlignLeft },
            { id: "rich_text", name: "Rich text", desc: "Text with basic formatting", icon: FileText },
        ]
    },
    {
        category: "NUMBER",
        types: [
            { id: "integer", name: "Integer", desc: "A whole number", icon: Hash },
            { id: "decimal", name: "Decimal", desc: "A number with decimals", icon: Hash },
            { id: "rating", name: "Rating", desc: "A numerical rating", icon: Star },
        ]
    },
    {
        category: "MEDIA",
        types: [
            { id: "file", name: "File", desc: "Any file type", icon: FileText },
            { id: "image", name: "Image", desc: "An image file", icon: Image },
            { id: "video", name: "Video", desc: "A video file", icon: Video },
        ]
    },
    {
        category: "MEASUREMENT",
        types: [
            { id: "weight", name: "Weight", desc: "Value with a weight unit", icon: Weight },
            { id: "dimension", name: "Dimension", desc: "Value with a length unit", icon: Maximize2 },
            { id: "volume", name: "Volume", desc: "Value with a volume unit", icon: Droplets },
        ]
    },
    {
        category: "REFERENCE",
        types: [
            { id: "product", name: "Product reference", desc: "Links to a product", icon: Tag },
            { id: "variant", name: "Product variant reference", desc: "Links to a variant", icon: Layers },
            { id: "collection", name: "Collection reference", desc: "Links to a collection", icon: Box },
        ]
    },
    {
        category: "OTHER",
        types: [
            { id: "boolean", name: "Boolean", desc: "True or false", icon: CheckSquare },
            { id: "color", name: "Color", desc: "Hexadecimal color code", icon: Palette },
            { id: "date", name: "Date", desc: "A date without time", icon: Calendar },
            { id: "url", name: "URL", desc: "A website address", icon: Link },
            { id: "json", name: "JSON", desc: "Custom JSON format data", icon: FileJson },
        ]
    }
];

const Toggle = ({ active, onChange }) => (
    <button 
        type="button"
        onClick={(e) => { e.preventDefault(); onChange(!active); }} 
        className={`relative w-10 h-6 rounded-full transition-colors ${active ? 'bg-[#202223]' : 'bg-[#c9cccf]'}`}
    >
        <motion.div 
            animate={{ x: active ? 18 : 3 }} 
            className="absolute top-1 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm" 
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    </button>
);

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, name }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-6 outline-none">
                    <h3 className="text-base font-bold text-[#202223] mb-2">Delete {name}?</h3>
                    <p className="text-sm text-[#6d7175] mb-6">Are you sure you want to delete this definition? This action cannot be undone and may affect existing data.</p>
                    <div className="flex items-center justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#c9cccf] bg-white text-[#202223] text-sm font-bold hover:bg-[#fafbfb] transition-all">Cancel</button>
                        <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-[#d82c0d] text-white text-sm font-bold hover:bg-[#bc260a] transition-all shadow-sm">Delete</button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default function MetafieldsPage() {
    const router = useRouter();
    const [view, setView] = useState('PORTAL'); 
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const [activeFieldId, setActiveFieldId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Data States
    const [metafieldCounts, setMetafieldCounts] = useState({});
    const [metaobjectCount, setMetaobjectCount] = useState(0);
    const [allDefinitions, setAllDefinitions] = useState([]);
    const [metaobjectDefinitions, setMetaobjectDefinitions] = useState([]);
    const [currentEntity, setCurrentEntity] = useState(null);

    // Forms State
    const [metaobjectForm, setMetaobjectForm] = useState({
        name: '',
        typeHandle: '',
        description: '',
        toggles: {
            status: true,
            translations: true,
            webPages: false,
            storefronts: true,
            customerAccount: false
        },
        fields: [{ id: Date.now(), label: '', type: null, quantity: 'ONE' }]
    });

    const [productMetafieldForm, setProductMetafieldForm] = useState({
        name: '',
        type: null,
        quantity: 'ONE',
        storefrontApiAccess: true
    });

    const [metaobjectOptionsOpen, setMetaobjectOptionsOpen] = useState(true);

    const entityDefinitions = useMemo(() => {
        if (!currentEntity) return [];
        return allDefinitions.filter(d => d.ownerType.toLowerCase() === currentEntity);
    }, [allDefinitions, currentEntity]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mfRes, moRes] = await Promise.all([
                fetch('/api/admin/metafields/definitions'),
                fetch('/api/admin/metaobjects/definitions')
            ]);
            
            const mfData = await mfRes.json();
            const moData = await moRes.json();

            if (mfData.success) {
                const counts = {};
                mfData.data.forEach(def => {
                    const key = def.ownerType.toLowerCase();
                    counts[key] = (counts[key] || 0) + 1;
                });
                setMetafieldCounts(counts);
                setAllDefinitions(mfData.data);
            }

            if (moData.success) {
                setMetaobjectCount(moData.data.length);
                setMetaobjectDefinitions(moData.data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-slugify Handle (only when creating)
    useEffect(() => {
        if (!isEditing && metaobjectForm.name) {
            const slug = metaobjectForm.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_+|_+$/g, '');
            setMetaobjectForm(prev => ({ ...prev, typeHandle: slug }));
        }
    }, [metaobjectForm.name, isEditing]);

    const handleSaveMetaobject = async () => {
        setLoading(true);
        try {
            const url = isEditing ? `/api/admin/metaobjects/definitions/${selectedId}` : '/api/admin/metaobjects/definitions';
            const method = isEditing ? 'PATCH' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: metaobjectForm.name,
                    type: metaobjectForm.typeHandle,
                    description: metaobjectForm.description,
                    fields: metaobjectForm.fields,
                    options: metaobjectForm.toggles
                })
            });
            const data = await res.json();
            if (data.success) {
                await fetchData();
                setView('PORTAL');
                setIsEditing(false);
            } else {
                alert(data.error || "Failed to save");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProductMetafield = async () => {
        setLoading(true);
        try {
            const url = isEditing ? `/api/admin/metafields/definitions/${selectedId}` : '/api/admin/metafields/definitions';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productMetafieldForm.name,
                    type: productMetafieldForm.type?.id || productMetafieldForm.type,
                    ownerType: currentEntity.toUpperCase(),
                    quantity: productMetafieldForm.quantity,
                    options: { storefrontApiAccess: productMetafieldForm.storefrontApiAccess }
                })
            });
            const data = await res.json();
            if (data.success) {
                await fetchData();
                setView('ENTITY_METAFIELDS');
                setIsEditing(false);
            } else {
                alert(data.error || "Failed to save");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleteModalOpen(false);
        setLoading(true);
        try {
            const type = (view === 'EDIT_METAOBJECT' || view === 'ADD_METAOBJECT') ? 'metaobjects' : 'metafields';
            const res = await fetch(`/api/admin/${type}/definitions/${selectedId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                await fetchData();
                setView(type === 'metaobjects' ? 'PORTAL' : 'ENTITY_METAFIELDS');
                setIsEditing(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const openEditMetafield = (def) => {
        setSelectedId(def.id);
        setIsEditing(true);
        setCurrentEntity(def.ownerType.toLowerCase());
        const typeObj = fieldTypes.flatMap(c => c.types).find(t => t.id === def.type);
        setProductMetafieldForm({
            name: def.name,
            type: typeObj || def.type,
            quantity: def.quantity,
            storefrontApiAccess: def.options?.storefrontApiAccess ?? true
        });
        setView('ADD_ENTITY_METAFIELD');
    };

    const openEditMetaobject = (def) => {
        setSelectedId(def.id);
        setIsEditing(true);
        setMetaobjectForm({
            name: def.name,
            typeHandle: def.type,
            description: def.description || '',
            toggles: def.options || {},
            fields: def.fields.map(f => ({
                id: f.id,
                label: f.name,
                type: fieldTypes.flatMap(c => c.types).find(t => t.id === f.type) || f.type,
                quantity: f.quantity
            }))
        });
        setView('ADD_METAOBJECT');
    };

    const filteredFieldTypes = useMemo(() => {
        if (!pickerSearch) return fieldTypes;
        return fieldTypes.map(category => ({
            ...category,
            types: category.types.filter(t => 
                t.name.toLowerCase().includes(pickerSearch.toLowerCase()) || 
                t.desc.toLowerCase().includes(pickerSearch.toLowerCase())
            )
        })).filter(cat => cat.types.length > 0);
    }, [pickerSearch]);

    const addField = () => setMetaobjectForm(prev => ({ ...prev, fields: [...prev.fields, { id: Date.now(), label: '', type: null, quantity: 'ONE' }] }));
    const removeField = (id) => setMetaobjectForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    const updateField = (id, updates) => setMetaobjectForm(prev => ({ ...prev, fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f) }));
    const openPicker = (fieldId) => { setActiveFieldId(fieldId); setIsPickerOpen(true); };

    if (loading && view === 'PORTAL') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f1f2f3]">
                <Loader2 size={32} className="animate-spin text-[#6d7175] mb-4" />
                <p className="text-sm font-medium text-[#6d7175]">Syncing with store...</p>
            </div>
        );
    }

    if (view === 'ADD_METAOBJECT') {
        return (
            <div className="w-full min-h-screen bg-[#f1f2f3] font-sans pb-20">
                <div className="sticky top-0 z-[100] bg-white border-b border-[#ebebeb] px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setView('PORTAL'); setIsEditing(false); }} className="hover:bg-body p-1 rounded transition-colors"><ArrowLeft size={18} className="text-[#6d7175]" /></button>
                        <h1 className="text-sm font-bold text-[#202223] truncate">{isEditing ? `Edit ${metaobjectForm.name}` : 'Add metaobject definition'}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-1.5 rounded-md border border-[#d82c0d] bg-white text-[#d82c0d] text-sm font-bold hover:bg-[#feeeee] transition-all mr-2">Delete</button>
                        )}
                        <button onClick={() => { setView('PORTAL'); setIsEditing(false); }} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-bold hover:bg-[#fafbfb] transition-all">Discard</button>
                        <button onClick={handleSaveMetaobject} disabled={loading || !metaobjectForm.name || metaobjectForm.fields.length === 0} className="px-6 py-1.5 rounded-md bg-[#202223] text-white text-sm font-bold hover:bg-[#323232] shadow-sm transition-all flex items-center gap-2 disabled:opacity-30">
                            {loading && <Loader2 size={14} className="animate-spin" />} Save
                        </button>
                    </div>
                </div>

                <div className="max-w-[700px] mx-auto p-4 md:p-8 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={() => setView('PORTAL')} className="p-1 hover:bg-white rounded transition-colors group">
                            <Layers size={16} className="text-[#6d7175] group-hover:text-[#202223]" />
                        </button>
                        <ChevronRight size={14} className="text-[#c9cccf]" />
                        <h1 className="text-xl font-bold text-[#202223]">{isEditing ? 'Edit definition' : 'Add metaobject definition'}</h1>
                    </div>

                    <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202223]">Name</label>
                            <input type="text" value={metaobjectForm.name} onChange={(e) => setMetaobjectForm({...metaobjectForm, name: e.target.value})} className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#202223] transition-all shadow-sm" placeholder="Examples: Cart upsell, Fabric colors" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[13px] font-medium text-[#202223]">Type: <span className={`font-mono ${isEditing ? 'text-[#8c9196]' : 'text-[#6d7175]'}`}>{metaobjectForm.typeHandle || '—'}</span></p>
                            {isEditing && <p className="text-[11px] text-[#6d7175]">To keep data consistent, the type cannot be changed.</p>}
                            <button className="text-[13px] font-bold text-[#006fbb] hover:underline">Add description</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-[#f1f1f1] flex justify-between items-center"><h2 className="text-[15px] font-bold text-[#202223]">Fields</h2></div>
                        <div className="p-4 space-y-4">
                            {metaobjectForm.fields.map((field) => (
                                <div key={field.id} className="flex items-start gap-3 group/row">
                                    <GripVertical size={16} className="text-[#c9cccf] cursor-grab mt-2.5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-6"><input type="text" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#202223]" placeholder="Field label" /></div>
                                            <div className="col-span-6 flex border border-[#c9cccf] rounded-lg overflow-hidden h-10 bg-[#f6f6f7]">
                                                <div className="flex items-center gap-1.5 px-3 border-r border-[#c9cccf] text-[13px] font-medium text-[#6d7175]">{field.quantity === 'ONE' ? 'One' : 'List'}</div>
                                                <div className="flex-1 flex items-center px-3 text-[13px] font-medium text-[#6d7175] truncate">{field.type?.name || field.type || "Select type"}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-1 opacity-0 group-hover/row:opacity-100 transition-opacity"><ChevronDown size={18} className="text-[#c9cccf] cursor-pointer" /></div>
                                </div>
                            ))}
                            {!isEditing && (
                                <button onClick={addField} className="flex items-center gap-2 text-[13px] font-bold text-[#202223] hover:text-[#008060] transition-colors pt-2 group"><PlusCircle size={20} className="text-[#202223] group-hover:text-[#008060]" /> Add field</button>
                            )}
                        </div>
                    </div>
                </div>
                <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} name={metaobjectForm.name} />
            </div>
        );
    }

    if (view === 'ENTITY_METAFIELDS') {
        const entity = metafieldEntities.find(e => e.id === currentEntity);
        return (
            <div className="w-full min-h-screen bg-[#f1f2f3] font-sans pb-20">
                <div className="sticky top-0 z-[100] bg-white border-b border-[#ebebeb] px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setView('PORTAL'); setCurrentEntity(null); }} className="hover:bg-body p-1 rounded transition-colors"><Layers size={16} className="text-[#6d7175]" /></button>
                        <ChevronRight size={14} className="text-[#c9cccf]" /><h1 className="text-sm font-bold text-[#202223] truncate">{entity?.label} metafield definitions</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-bold hover:bg-[#fafbfb] transition-all">View unstructured metafields</button>
                        <button onClick={() => { setView('ADD_ENTITY_METAFIELD'); setIsEditing(false); setProductMetafieldForm({ name:'', type:null, quantity:'ONE', storefrontApiAccess:true }); }} className="px-4 py-1.5 rounded-md bg-[#202223] text-white text-sm font-bold hover:bg-[#323232] shadow-sm transition-all">Add definition</button>
                    </div>
                </div>

                <div className="max-w-[1000px] mx-auto p-4 md:p-8">
                    {entityDefinitions.length === 0 ? (
                        <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-20 text-center flex flex-col items-center justify-center min-h-[500px]">
                            <div className="w-48 h-48 bg-[#f6f6f7] rounded-full flex items-center justify-center mb-8 relative overflow-hidden">
                                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-[-10px] flex flex-col items-center">
                                    <div className="w-24 h-12 bg-[#89d6bb]/30 border border-[#89d6bb] rounded-md shadow-sm" />
                                    <div className="w-32 h-14 bg-[#ffc96b]/30 border border-[#ffc96b] rounded-md shadow-md flex items-center justify-center z-10"><h2 className="text-xl font-bold text-[#916a00]">A</h2></div>
                                    <div className="w-28 h-12 bg-[#ff8b8b]/30 border border-[#ff8b8b] rounded-md shadow-sm" />
                                </motion.div>
                            </div>
                            <h2 className="text-lg font-bold text-[#202223] mb-2 leading-tight">Add a custom field to your {entity?.label.toLowerCase()}</h2>
                            <p className="text-sm text-[#6d7175] max-w-sm mx-auto mb-8 font-medium">Create a metafield definition to store and display unique content for each {entity?.label.toLowerCase().slice(0, -1)}.</p>
                            <button onClick={() => setView('ADD_ENTITY_METAFIELD')} className="px-6 py-2.5 rounded-md bg-[#202223] text-white text-sm font-bold shadow-sm transition-all">Add definition</button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden divide-y divide-[#f1f1f1]">
                            {entityDefinitions.map((def) => (
                                <div key={def.id} onClick={() => openEditMetafield(def)} className="p-4 px-6 flex items-center justify-between hover:bg-[#fafbfb] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#f1f2f3] rounded-lg flex items-center justify-center text-[#6d7175]"><PenSquare size={18} /></div>
                                        <div><p className="text-sm font-bold text-[#202223]">{def.name}</p><p className="text-xs text-[#6d7175] font-mono">{def.namespace}.{def.key}</p></div>
                                    </div>
                                    <div className="flex items-center gap-6 text-right">
                                        <div><p className="text-xs font-bold text-[#202223] uppercase">{def.type.replace('_', ' ')}</p><p className="text-[10px] text-[#6d7175]">Definition pinned</p></div>
                                        <ChevronRight size={18} className="text-[#c9cccf] group-hover:text-[#202223]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (view === 'ADD_ENTITY_METAFIELD') {
        return (
            <div className="w-full min-h-screen bg-[#f1f2f3] font-sans pb-20">
                <div className="sticky top-0 z-[100] bg-white border-b border-[#ebebeb] px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={() => { setView('ENTITY_METAFIELDS'); setIsEditing(false); }} className="hover:bg-body p-1 rounded transition-colors"><ArrowLeft size={18} className="text-[#6d7175]" /></button>
                        <h1 className="text-sm font-bold text-[#202223] truncate">{isEditing ? `Edit ${productMetafieldForm.name}` : `Add ${metafieldEntities.find(e => e.id === currentEntity)?.label.toLowerCase()} metafield definition`}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button onClick={() => setIsDeleteModalOpen(true)} className="px-4 py-1.5 rounded-md border border-[#d82c0d] bg-white text-[#d82c0d] text-sm font-bold hover:bg-[#feeeee] transition-all mr-2">Delete</button>
                        )}
                        <button onClick={() => { setView('ENTITY_METAFIELDS'); setIsEditing(false); }} className="px-4 py-1.5 rounded-md border border-[#c9cccf] bg-white text-[#202223] text-sm font-bold hover:bg-[#fafbfb] transition-all">Discard</button>
                        <button onClick={handleSaveProductMetafield} disabled={loading || !productMetafieldForm.name} className="px-6 py-1.5 rounded-md bg-[#202223] text-white text-sm font-bold flex items-center gap-2 disabled:opacity-30">
                            {loading && <Loader2 size={14} className="animate-spin" />} Save
                        </button>
                    </div>
                </div>

                <div className="max-w-[700px] mx-auto p-4 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setView('PORTAL')} className="p-1 hover:bg-white rounded transition-colors group"><Layers size={16} className="text-[#6d7175] group-hover:text-[#202223]" /></button>
                            <ChevronRight size={14} className="text-[#c9cccf]" />
                            <h2 className="text-sm font-medium text-[#6d7175] hover:text-[#202223] cursor-pointer" onClick={() => setView('ENTITY_METAFIELDS')}>{metafieldEntities.find(e => e.id === currentEntity)?.label}</h2>
                            <ChevronRight size={14} className="text-[#c9cccf]" />
                            <h1 className="text-sm font-bold text-[#202223]">{isEditing ? 'Edit definition' : `Add ${metafieldEntities.find(e => e.id === currentEntity)?.label.toLowerCase()} metafield definition`}</h1>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#c9cccf] rounded-full shadow-sm"><Pin size={12} className="text-[#202223]" /><span className="text-[11px] font-bold text-[#202223]">Definition pinned</span></div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-6 space-y-6">
                        <div className="space-y-1.5"><label className="text-[13px] font-medium text-[#202223]">Name</label><input type="text" value={productMetafieldForm.name} onChange={(e) => setProductMetafieldForm({...productMetafieldForm, name: e.target.value})} className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#202223] shadow-sm transition-all" /></div>
                        
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-[#202223]">Type</label>
                            <div className={`flex border border-[#c9cccf] rounded-lg overflow-hidden h-11 bg-white shadow-sm ring-1 ring-black/5`}>
                                <button 
                                    disabled={isEditing}
                                    onClick={() => setProductMetafieldForm(prev => ({ ...prev, quantity: prev.quantity === 'ONE' ? 'LIST' : 'ONE' }))}
                                    className={`flex items-center gap-1.5 px-4 border-r border-[#c9cccf] text-[13px] font-medium text-[#202223] ${isEditing ? 'bg-[#f6f6f7]' : 'bg-[#f6f6f7] hover:bg-[#ebebeb]'} transition-colors`}
                                >
                                    {productMetafieldForm.quantity === 'ONE' ? 'One' : 'List'} <ChevronDown size={14} />
                                </button>
                                <button 
                                    disabled={isEditing}
                                    onClick={() => { setActiveFieldId('PRODUCT_FORM'); setIsPickerOpen(true); }}
                                    className={`flex-1 flex items-center justify-between px-4 text-[13px] font-medium ${isEditing ? 'bg-[#f6f6f7] text-[#6d7175]' : 'bg-white hover:bg-[#fafbfb] text-[#202223]'} transition-colors text-left`}
                                >
                                    <span>{productMetafieldForm.type?.name || productMetafieldForm.type || "Select type"}</span>
                                    <ChevronsUpDown size={16} className="text-[#6d7175]" />
                                </button>
                            </div>
                        </div>
                        <button className="text-[13px] font-bold text-[#006fbb] hover:underline">Add description</button>
                    </div>

                    <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-6">
                        <div className="flex items-center gap-1.5 mb-5"><h2 className="text-[15px] font-bold text-[#202223]">Category assignments</h2><Info size={14} className="text-[#6d7175]" /></div>
                        <div className="border border-dashed border-[#c9cccf] rounded-lg p-5 flex items-center justify-center bg-[#fafbfb]">
                            <button className="flex items-center gap-2 text-[13px] font-bold text-[#202223] hover:text-[#008060] transition-colors"><PlusCircle size={20} /> Select categories</button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm p-6">
                        <div className="flex items-center gap-1.5 mb-5"><h2 className="text-[15px] font-bold text-[#202223]">Options</h2><Info size={14} className="text-[#6d7175]" /></div>
                        <div className="flex items-center justify-between"><span className="text-sm font-medium text-[#202223]">Storefront API access</span><Toggle active={productMetafieldForm.storefrontApiAccess} onChange={(val) => setProductMetafieldForm({...productMetafieldForm, storefrontApiAccess: val})} /></div>
                    </div>
                </div>
                <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} name={productMetafieldForm.name} />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f1f2f3] font-sans pb-12">
            <div className="max-w-[800px] mx-auto p-4 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.push('/admin/settings')} className="p-1.5 hover:bg-white rounded-md text-[#6d7175] transition-colors"><ArrowLeft size={18} /></button>
                        <div className="flex items-center gap-2"><Layers size={18} className="text-[#202223]" /><h1 className="text-xl font-bold text-[#202223]">Metafields and metaobjects</h1></div>
                    </div>
                    <button onClick={() => router.push('/admin')} className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#c9cccf] bg-white text-sm font-semibold text-[#202223] hover:bg-[#fafbfb] transition-colors">
                        Exit settings
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-[#f1f1f1]"><h2 className="text-[15px] font-bold text-[#202223]">Metafield definitions</h2></div>
                    <div className="divide-y divide-[#f1f1f1]">
                        {metafieldEntities.map((entity, idx) => (
                            <button key={idx} onClick={() => { setCurrentEntity(entity.id); setView('ENTITY_METAFIELDS'); }} className="w-full flex items-center justify-between p-4 hover:bg-[#fafbfb] transition-colors group">
                                <div className="flex items-center gap-4"><div className="text-[#6d7175] group-hover:text-[#202223] transition-colors"><entity.icon size={18} /></div><span className="text-sm font-medium text-[#202223]">{entity.label}</span></div>
                                <div className="flex items-center gap-4"><span className="text-xs font-medium text-[#6d7175]">{metafieldCounts[entity.id] || 0}</span><ChevronRight size={16} className="text-[#c9cccf] group-hover:text-[#202223]" /></div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-[#c9cccf] shadow-sm flex flex-col divide-y divide-[#f1f1f1]">
                    <div className="p-5"><h2 className="text-[15px] font-bold text-[#202223]">Metaobjects</h2></div>
                    <div className="divide-y divide-[#f1f1f1]">
                        {metaobjectDefinitions.map((def) => (
                            <div key={def.id} onClick={() => openEditMetaobject(def)} className="p-4 px-6 flex items-center justify-between hover:bg-[#fafbfb] transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4"><div className="w-8 h-8 bg-[#f1f2f3] rounded flex items-center justify-center text-[#6d7175] transition-colors group-hover:bg-[#ebebeb]"><Box size={16} /></div><span className="text-sm font-medium text-[#202223]">{def.name}</span></div>
                                <ChevronRight size={16} className="text-[#c9cccf] group-hover:text-[#202223]" />
                            </div>
                        ))}
                        <button onClick={() => { setView('ADD_METAOBJECT'); setIsEditing(false); setMetaobjectForm({ name:'', typeHandle:'', description:'', toggles:{status:true}, fields:[{id:Date.now(), label:'', type:null, quantity:'ONE'}] }); }} className="w-full p-4 flex items-center gap-2 text-sm font-bold text-[#202223] hover:bg-[#fafbfb] transition-colors"><Plus size={16} /> Add definition</button>
                    </div>
                </div>
            </div>
            {/* Shared Field Picker */}
            <AnimatePresence>
                {isPickerOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPickerOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="px-5 py-4 flex items-center justify-between border-b border-[#f1f1f1]"><h3 className="text-base font-bold text-[#202223]">Select field type</h3><X size={20} className="text-[#6d7175] cursor-pointer hover:text-[#202223] transition-colors" onClick={() => setIsPickerOpen(false)} /></div>
                            <div className="p-3 bg-[#f1f2f3] flex items-center gap-2 px-5"><Search size={16} className="text-[#8c9196]" /><input type="text" placeholder="Search field types" value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm placeholder:text-[#8c9196]" /></div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-8">
                                {filteredFieldTypes.map(cat => (
                                    <div key={cat.category} className="space-y-2 pb-2">
                                        <h4 className="text-[11px] font-bold text-[#6d7175] uppercase tracking-wider px-2">{cat.category}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {cat.types.map(type => (
                                                <button key={type.id} onClick={() => { if (activeFieldId === 'PRODUCT_FORM') { setProductMetafieldForm(prev => ({ ...prev, type })); } else { updateField(activeFieldId, { type }); } setIsPickerOpen(false); }} className="p-4 text-left border border-[#ebebeb] bg-white hover:border-[#202223] hover:shadow-sm rounded-xl transition-all group flex flex-col gap-1">
                                                    <div className="flex items-center gap-3"><type.icon size={18} className="text-[#202223] transition-colors" /><span className="text-sm font-bold text-[#202223] group-hover:text-[#008060]">{type.name}</span></div>
                                                    <p className="text-xs text-[#6d7175] leading-snug">{type.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
