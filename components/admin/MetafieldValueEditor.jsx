"use client";

import React, { useState, useEffect } from "react";
import { 
    Plus, X, Info, Database, Pin, Settings2, 
    Type, AlignLeft, Hash, CheckSquare, Calendar, Palette, Link as LinkIcon,
    Loader2, AlertCircle, Trash2, GripVertical, ChevronDown, ChevronsUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * MetafieldValueEditor
 * A Shopify-style editor that displays defined metafields and allows adding unstructured ones.
 * 
 * @param {Array} value - Current metafield values [{namespace, key, value, type}]
 * @param {Function} onChange - Callback (newMetafields)
 * @param {String} ownerType - Entity type (PRODUCT, CUSTOMER, etc.)
 */
export default function MetafieldValueEditor({ value = [], onChange, ownerType = "PRODUCT" }) {
    const [definitions, setDefinitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDefinitions();
    }, [ownerType]);

    const fetchDefinitions = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/metafields/definitions");
            const data = await res.json();
            if (data.success) {
                // Filter by ownerType
                const filtered = data.data.filter(d => d.ownerType.toUpperCase() === ownerType.toUpperCase());
                setDefinitions(filtered);
            }
        } catch (err) {
            console.error("Failed to fetch metafield definitions:", err);
            setError("Could not load metafield definitions.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to find existing value for a definition
    const getValueForDef = (def) => {
        return value.find(v => v.namespace === def.namespace && v.key === def.key);
    };

    // Helper to find unstructured metafields (those not matching any definition)
    const unstructuredMetafields = value.filter(v => {
        return !definitions.some(d => d.namespace === v.namespace && d.key === v.key);
    });

    const handleUpdateValue = (namespace, key, newVal, type = "text") => {
        const index = value.findIndex(v => v.namespace === namespace && v.key === key);
        let newMetafields = [...value];

        if (index > -1) {
            newMetafields[index] = { ...newMetafields[index], value: String(newVal) };
        } else {
            newMetafields.push({ namespace, key, value: String(newVal), type });
        }
        onChange(newMetafields);
    };

    const handleAddUnstructured = () => {
        const newMetafields = [
            ...value, 
            { namespace: "custom", key: "", value: "", type: "text" }
        ];
        onChange(newMetafields);
    };

    const handleRemoveMetafield = (namespace, key) => {
        const newMetafields = value.filter(v => !(v.namespace === namespace && v.key === key));
        onChange(newMetafields);
    };

    if (loading) {
        return (
            <div className="p-8 text-center bg-white rounded-lg border border-[#c9cccf]">
                <Loader2 size={24} className="animate-spin text-[#6d7175] mx-auto mb-2" />
                <p className="text-sm text-[#6d7175]">Loading metafields...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#ebebeb] flex items-center justify-between bg-[#fafbfb]">
                <div className="flex items-center gap-2">
                    <Database size={18} className="text-[#202223]" />
                    <h4 className="text-sm font-semibold text-[#202223]">Metafields</h4>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#c9cccf] rounded-full shadow-sm">
                    <Pin size={12} className="text-[#202223]" />
                    <span className="text-[11px] font-bold text-[#202223]">Definitions used</span>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Defined Metafields Section */}
                <div className="space-y-5">
                    {definitions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-[#c9cccf] rounded-lg bg-[#fafbfb] text-center">
                            <Settings2 size={24} className="text-[#c9cccf] mb-2" />
                            <p className="text-sm text-[#6d7175] mb-1">No definitions found for {ownerType.toLowerCase()}.</p>
                            <p className="text-xs text-[#8c9196]">Create definitions in Settings to use structured metafields.</p>
                        </div>
                    ) : (
                        definitions.map((def) => {
                            const current = getValueForDef(def);
                            return (
                                <div key={def.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-[#202223] flex items-center gap-2">
                                            {def.name}
                                            <span className="text-[10px] font-mono text-[#6d7175] bg-[#f4f6f8] px-1 rounded uppercase tracking-tighter">
                                                {def.type.replace('_', ' ')}
                                            </span>
                                        </label>
                                        <p className="text-[11px] font-mono text-[#6d7175]">{def.namespace}.{def.key}</p>
                                    </div>
                                    
                                    <MetafieldInput 
                                        type={def.type}
                                        value={current?.value ?? ""}
                                        onChange={(val) => handleUpdateValue(def.namespace, def.key, val, def.type)}
                                        placeholder={def.description || `Enter ${def.name.toLowerCase()}...`}
                                        quantity={def.quantity}
                                    />
                                    {def.description && (
                                        <p className="text-[11px] text-[#6d7175] italic ml-1">{def.description}</p>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Unstructured Metafields Header */}
                <div className="pt-4 border-t border-[#f1f1f1]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h5 className="text-[13px] font-bold text-[#202223]">Unstructured metafields</h5>
                            <p className="text-[11px] text-[#6d7175]">Metafields without a shared definition.</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddUnstructured}
                            className="text-[#006fbb] text-sm hover:underline flex items-center gap-1 font-medium"
                        >
                            <Plus size={16} /> Add manual metafield
                        </button>
                    </div>

                    <div className="space-y-3">
                        {unstructuredMetafields.map((meta, idx) => (
                            <div key={idx} className="flex gap-2 items-end p-3 bg-[#fafbfb] rounded border border-[#c9cccf] relative group animate-in fade-in slide-in-from-top-1 duration-200">
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveMetafield(meta.namespace, meta.key)} 
                                    className="absolute top-1 right-1 p-1 text-[#6d7175] hover:text-[#d82c0d] transition-colors rounded hover:bg-[#feeeee]"
                                >
                                    <X size={14} />
                                </button>
                                <div className="w-1/4 space-y-1">
                                    <label className="text-[10px] font-bold text-[#6d7175] uppercase pl-1">Namespace</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-2 py-1 text-sm outline-none focus:border-[#202223]" 
                                        value={meta.namespace} 
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const newMetafields = [...value];
                                            const actualIndex = value.indexOf(meta);
                                            newMetafields[actualIndex].namespace = newVal;
                                            onChange(newMetafields);
                                        }} 
                                    />
                                </div>
                                <div className="w-1/4 space-y-1">
                                    <label className="text-[10px] font-bold text-[#6d7175] uppercase pl-1">Key</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-2 py-1 text-sm outline-none focus:border-[#202223]" 
                                        value={meta.key} 
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const newMetafields = [...value];
                                            const actualIndex = value.indexOf(meta);
                                            newMetafields[actualIndex].key = newVal;
                                            onChange(newMetafields);
                                        }} 
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-bold text-[#6d7175] uppercase pl-1">Value</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-2 py-1 text-sm outline-none focus:border-[#202223]" 
                                        value={meta.value} 
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const newMetafields = [...value];
                                            const actualIndex = value.indexOf(meta);
                                            newMetafields[actualIndex].value = newVal;
                                            onChange(newMetafields);
                                        }} 
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                    <label className="text-[10px] font-bold text-[#6d7175] uppercase pl-1">Type</label>
                                    <select 
                                        className="w-full border border-[#c9cccf] shadow-sm rounded-md px-1.5 py-1 text-sm outline-none focus:border-[#202223] bg-white cursor-pointer" 
                                        value={meta.type} 
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            const newMetafields = [...value];
                                            const actualIndex = value.indexOf(meta);
                                            newMetafields[actualIndex].type = newVal;
                                            onChange(newMetafields);
                                        }}
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="date">Date</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * MetafieldInput
 * Renders the specialized input based on the metafield type.
 */
function MetafieldInput({ type, value, onChange, placeholder, quantity }) {
    // Handle Boolean
    if (type === 'boolean') {
        const boolVal = String(value).toLowerCase() === 'true';
        return (
            <div 
                onClick={() => onChange(!boolVal)}
                className="flex items-center gap-3 p-2 px-3 border border-[#c9cccf] rounded-lg cursor-pointer hover:border-[#202223] transition-colors w-fit bg-[#fafbfb] active:scale-[0.98]"
            >
                <div className={`w-8 h-4.5 rounded-full transition-colors relative ${boolVal ? 'bg-[#008060]' : 'bg-[#ced4da]'}`}>
                    <motion.div 
                        animate={{ x: boolVal ? 16 : 2 }}
                        className="absolute top-0.5 left-0 w-3.5 h-3.5 bg-white rounded-full shadow-sm"
                    />
                </div>
                <span className="text-sm font-medium text-[#202223]">{boolVal ? 'True' : 'False'}</span>
            </div>
        );
    }

    // Handle Color
    if (type === 'color') {
        return (
            <div className="flex items-center gap-2 max-w-sm">
                <div 
                    className="w-10 h-10 rounded-lg border border-[#c9cccf] shadow-sm overflow-hidden flex-shrink-0 relative active:scale-95 transition-transform"
                    style={{ backgroundColor: value || '#ffffff' }}
                >
                    <input 
                        type="color" 
                        value={value || '#ffffff'} 
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                    />
                </div>
                <input 
                    type="text" 
                    value={value || ""} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223]"
                />
            </div>
        );
    }

    // Handle Date
    if (type === 'date') {
        return (
            <div className="relative max-w-xs group">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175] group-focus-within:text-[#202223] transition-colors" />
                <input 
                    type="date" 
                    value={value || ""} 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md pl-10 pr-3 py-2 text-sm outline-none focus:border-[#202223] bg-white cursor-pointer"
                />
            </div>
        );
    }

    // Handle Multi-line Text
    if (type === 'multi_line' || type === 'rich_text') {
        return (
            <textarea 
                rows="3"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223] resize-none transition-border"
            />
        );
    }

    // Handle Numbers
    if (type === 'integer' || type === 'decimal') {
        return (
            <input 
                type="number"
                step={type === 'decimal' ? '0.01' : '1'}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full max-w-xs border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223]"
            />
        );
    }

    // Default: Single Line Text / URL / etc.
    return (
        <input 
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-[#c9cccf] hover:border-[#8c9196] shadow-sm rounded-md px-3 py-2 text-sm outline-none focus:border-[#202223]"
        />
    );
}
