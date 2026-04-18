'use client';

import React, { useState } from 'react';
import { 
    X, 
    Upload, 
    FileText, 
    AlertCircle, 
    CheckCircle2, 
    Loader2, 
    Download,
    Table as TableIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function BulkUploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // 25 MB limit
        if (selectedFile.size > 25 * 1024 * 1024) {
            setError('File is too large. Maximum allowed size is 25 MB.');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setUploadResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                
                if (json.length === 0) {
                    setError("The file appears to be empty.");
                    return;
                }
                
                setPreviewData(json.slice(0, 10)); // Show first 10 rows for preview
            } catch (err) {
                console.error("Parsing error:", err);
                setError("Failed to parse file. Please ensure it's a valid CSV or Excel file.");
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            // Parse full file
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);

                    const response = await fetch('/api/products/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: json }),
                    });

                    const result = await response.json();
                    if (result.success) {
                        setUploadResult(result.data);
                        if (onUploadSuccess) onUploadSuccess();
                    } else {
                        setError(result.error || "Upload failed.");
                    }
                } catch (err) {
                    setError("Error during upload process: " + err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            setError("Failed to process file.");
            setIsLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                nameEn: "Organic Apple",
                nameHi: "जैविक सेब",
                nameGu: "ઓર્ગેનિક સફરજન",
                slug: "organic-apple",
                price: 150,
                compareAtPrice: 180,
                sku: "APP-001",
                stock: 100,
                category: "Fruits",
                vendor: "Fresh Farms",
                farmer: "Rajesh Kumar",
                summaryEn: "Fresh organic apples from Himachal.",
                summaryHi: "हिमाचल से ताजा जैविक सेब।",
                summaryGu: "હિમાચલના તાજા ઓર્ગેનિક સફરજન.",
                descriptionEn: "These apples are grown without any pesticides and are rich in nutrients.",
                descriptionHi: "ये सेब बिना किसी कीटनाशक के उगाए जाते हैं और पोषक तत्वों से भरपूर होते हैं।",
                descriptionGu: "આ સફરજન કોઈપણ જંતુનાશક દવાઓ વિના ઉગાડવામાં આવે છે અને પોષક તત્વોથી ભરપૂર હોય છે.",
                weight: 1.0,
                status: "ACTIVE",
                tags: "organic, fresh, fruit",
                metaTitleEn: "Organic Apple | Prakrushi",
                metaTitleHi: "जैविक सेब | प्राकृषि",
                metaTitleGu: "ઓર્ગેનિક સફરજન | પ્રાકૃષિ",
                metaDescEn: "Buy fresh organic apples online at Prakrushi.",
                metaDescHi: "प्राकृषि पर ताजा जैविक सेब ऑनलाइन खरीदें।",
                metaDescGu: "પ્રાકૃષિ પર ઓનલાઇન તાજા ઓર્ગેનિક સફરજન ખરીદો."
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "bulk_product_template.xlsx");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4f0] flex items-center justify-center">
                                <Upload className="w-5 h-5 text-[#008060]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Products</h2>
                                <p className="text-xs text-gray-500">Upload CSV or XLSX files to import multiple products</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                        
                        {!uploadResult ? (
                            <>
                                {/* Step 1: Template */}
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Download Template</h3>
                                            <p className="text-sm text-gray-500">Download our pre-formatted spreadsheet to ensure your data is correct.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <Download size={16} /> Template
                                    </button>
                                </div>

                                {/* Step 2: Upload */}
                                <div 
                                    className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-[#008060] bg-[#f0f9f6]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                >
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        onChange={handleFileChange}
                                        accept=".csv, .xlsx, .xls"
                                    />
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${file ? 'bg-[#008060] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">
                                        {file ? file.name : 'Click or drag file to upload'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">Supports CSV, XLSX up to 25 MB</p>
                                </div>

                                {/* Error Display */}
                                {error && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                {/* Preview Section */}
                                {previewData.length > 0 && !error && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <TableIcon size={16} />
                                            <span>Preview (First {previewData.length} rows)</span>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs whitespace-nowrap">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            {Object.keys(previewData[0]).map(key => (
                                                                <th key={key} className="px-3 py-2 font-bold text-gray-600 uppercase tracking-wider">{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {previewData.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                {Object.values(row).map((val, j) => (
                                                                    <td key={j} className="px-3 py-2 text-gray-700 truncate max-w-[150px]">{String(val)}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Success/Summary State */
                            <div className="py-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Upload Complete!</h3>
                                    <p className="text-gray-500 mt-2">We have processed your bulk product upload.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Successful</p>
                                        <p className="text-3xl font-black text-green-700 mt-1">{uploadResult.success.length}</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Failed</p>
                                        <p className="text-3xl font-black text-red-700 mt-1">{uploadResult.failed.length}</p>
                                    </div>
                                </div>

                                {uploadResult.failed.length > 0 && (
                                    <div className="w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        <div className="px-4 py-3 bg-red-50 border-b border-red-100">
                                            <h4 className="text-sm font-bold text-red-700">Failure Details</h4>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-gray-50 sticky top-0 border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-4 py-2 text-gray-600">Product Name</th>
                                                        <th className="px-4 py-2 text-gray-600">Error</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {uploadResult.failed.map((fail, i) => (
                                                        <tr key={i}>
                                                            <td className="px-4 py-2 font-medium text-gray-900">{fail.name}</td>
                                                            <td className="px-4 py-2 text-red-600">{fail.error}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={onClose}
                                    className="px-8 py-3 bg-[#008060] text-white font-bold rounded-lg hover:bg-[#006e52] shadow-lg shadow-green-900/10 transition-all active:scale-95"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!uploadResult && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
                            <button 
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpload}
                                disabled={!file || isLoading}
                                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 ${(!file || isLoading) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#008060] text-white hover:bg-[#006e52] shadow-green-900/10'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Start Import
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
