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

const normalizePreviewValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
};

export default function AreaBulkUploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const parseFile = (selectedFile, callback) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                callback(json);
            } catch (err) {
                console.error('Parsing error:', err);
                setError('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
                setPreviewData([]);
            }
        };
        reader.readAsArrayBuffer(selectedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 25 * 1024 * 1024) {
            setError('File is too large. Maximum allowed size is 25 MB.');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setUploadResult(null);

        parseFile(selectedFile, (json) => {
            if (!json || json.length === 0) {
                setError('The file appears to be empty.');
                return;
            }
            setPreviewData(json.slice(0, 10));
        });
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsLoading(true);
        setError(null);

        parseFile(file, async (json) => {
            try {
                const response = await fetch('/api/admin/areas/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ areas: json }),
                });

                const result = await response.json();
                if (result.success) {
                    setUploadResult(result.data);
                    if (onUploadSuccess) onUploadSuccess();
                } else {
                    setError(result.error || 'Upload failed.');
                }
            } catch (err) {
                setError(`Error during upload: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        });
    };

    const downloadTemplate = () => {
        const template = [
            {
                areaName: 'Amroli',
                city: 'Surat',
                district: 'Surat',
                state: 'Gujarat',
                pincode: '395004',
                deliveryCharge: 0,
                minOrderAmount: 0,
                status: 'active'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Areas');
        XLSX.writeFile(wb, 'bulk_area_template.xlsx');
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
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4f0] flex items-center justify-center">
                                <Upload className="w-5 h-5 text-[#008060]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Bulk Upload Areas</h2>
                                <p className="text-xs text-gray-500">Upload multiple delivery areas using a CSV or Excel file.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                        {!uploadResult ? (
                            <>
                                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Download Template</h3>
                                            <p className="text-sm text-gray-500">Use the sample file format to prepare your bulk upload.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        <Download size={16} /> Template
                                    </button>
                                </div>

                                <div className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-[#008060] bg-[#f0f9f6]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept=".csv, .xlsx, .xls"
                                    />
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${file ? 'bg-[#008060] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">{file ? file.name : 'Click or drag file to upload'}</p>
                                    <p className="text-sm text-gray-500 mt-1">Supports CSV, XLSX up to 25 MB</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

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
                                                            {Object.keys(previewData[0]).map((key) => (
                                                                <th key={key} className="px-3 py-2 font-bold text-gray-600 uppercase tracking-wider">{key}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {previewData.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                {Object.values(row).map((val, j) => (
                                                                    <td key={j} className="px-3 py-2 text-gray-700 truncate max-w-[150px]">{normalizePreviewValue(val)}</td>
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
                            <div className="py-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Upload Complete!</h3>
                                    <p className="text-gray-500 mt-2">Your area import has been processed.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Imported</p>
                                        <p className="text-3xl font-black text-green-700 mt-1">{uploadResult.success.length}</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Failed</p>
                                        <p className="text-3xl font-black text-red-700 mt-1">{uploadResult.failed.length}</p>
                                    </div>
                                </div>

                                {uploadResult.failed.length > 0 && (
                                    <div className="w-full max-w-2xl bg-white border border-red-100 rounded-xl p-4 text-left">
                                        <h4 className="font-semibold text-gray-900 mb-3">Failed rows</h4>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            {uploadResult.failed.slice(0, 5).map((item, index) => (
                                                <li key={index} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                                                    <p><span className="font-semibold">Row:</span> {JSON.stringify(item.row || item)}</p>
                                                    <p className="text-red-600"><span className="font-semibold">Error:</span> {item.error}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row gap-3 justify-end">
                        {!uploadResult ? (
                            <>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isLoading || !file}
                                    onClick={handleUpload}
                                    className="px-4 py-2 rounded-lg bg-[#008060] text-white font-semibold hover:bg-[#006e52] transition-colors disabled:opacity-60"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Upload'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-[#008060] text-white font-semibold hover:bg-[#006e52] transition-colors"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
