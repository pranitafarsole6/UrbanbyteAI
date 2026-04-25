import React, { useState, useEffect } from 'react';
import { HardDrive, Trash2, FileText, Video, Archive, FileImage, Settings, FileBox, FileQuestion } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

// Helper to map string types to icons
const getIconForType = (type) => {
    switch (type.toLowerCase()) {
        case 'video': return Video;
        case 'archive': return Archive;
        case 'image': return FileImage;
        case 'code': return Settings;
        case 'installer': return FileBox;
        case 'document': return FileText;
        default: return FileQuestion;
    }
};

export default function LargeFilesPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchWithAuth } = useAuth();

    useEffect(() => {
        const fetchLargeFiles = async () => {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/insights/large-files`);
                const data = await response.json();
                
                if (data && Array.isArray(data.files)) {
                    const mappedFiles = data.files.map(f => {
                        // Extract raw size for calculation if not provided by backend
                        let rawSize = 0;
                        if (typeof f.size === 'string') {
                            rawSize = parseFloat(f.size);
                            if (f.size.includes('GB')) rawSize *= 1024;
                        }
                        
                        return {
                            ...f,
                            rawSizeMB: rawSize,
                            icon: getIconForType(f.category || f.type || 'unknown')
                        };
                    });
                    setFiles(mappedFiles);
                } else {
                    setFiles([]);
                }
            } catch (error) {
                console.error("Failed to fetch large files:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLargeFiles();
    }, [fetchWithAuth]);

    const toggleSelect = (id) => {
        setFiles(files.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
    };

    const selectedSizeMB = files.filter(f => f.selected).reduce((acc, f) => acc + f.rawSizeMB, 0);
    const selectedSizeStr = selectedSizeMB > 1000 ? (selectedSizeMB / 1000).toFixed(1) + " GB" : selectedSizeMB + " MB";

    const handleDelete = async () => {
        const filesToDelete = files.filter(f => f.selected).map(f => f.path);
        if (filesToDelete.length === 0) return;

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: filesToDelete })
            });
            const result = await response.json();
            
            if (result.success) {
                // Remove deleted items from UI
                setFiles(files.filter(f => !f.selected));
                alert(`Successfully freed up ${result.detailed_results.reclaimed_str}!`);
            } else {
                const reason = result.detailed_results?.error_detail || "Check console for details";
                alert(`Some files failed to delete: ${reason}`);
            }
        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Failed to reach backend for deletion.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300 w-full mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-eco-text">Large Files Detection</h1>
                    <p className="text-sm text-eco-muted mt-1">Identify and manage top storage-consuming files.</p>
                </div>
                <Button variant="danger" icon={Trash2} className="px-6 font-bold" onClick={handleDelete}>
                    Delete Selected ({selectedSizeStr})
                </Button>
            </div>

            <Card noPadding className="overflow-hidden border-eco-border rounded-2xl w-full">
                <div className="bg-gray-50/80 border-b border-eco-border px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-eco-text text-sm">Top Files by Size</h3>
                    <div className="flex gap-4">
                        <button className="text-xs font-bold text-eco-primary hover:text-eco-primary/80 transition-colors">
                            Select All
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-eco-border bg-white">
                                <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider w-12"></th>
                                <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">File Name</th>
                                <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">File Type</th>
                                <th className="py-4 px-6 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider text-right">File Size</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-eco-border">
                            {files.map((file) => {
                                const isLarge = file.rawSizeMB > 100;
                                return (
                                    <tr
                                        key={file.id}
                                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${file.selected ? 'bg-green-50/30' : 'bg-white'}`}
                                        onClick={() => toggleSelect(file.id)}
                                    >
                                        <td className="py-4 pl-6 pr-2">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${file.selected ? 'bg-eco-primary border-eco-primary text-white' : 'border-gray-300 bg-white'}`}>
                                                {file.selected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`${file.color}`}>
                                                    <file.icon size={20} strokeWidth={2} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-eco-text text-sm">{file.name}</p>
                                                    <p className="text-xs text-eco-muted mt-0.5">{file.path}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 text-gray-600">
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className={`py-4 px-6 text-right font-bold text-sm ${isLarge ? 'text-red-500' : 'text-eco-text'}`}>
                                            {file.size}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
