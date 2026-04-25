import React, { useState, useEffect } from 'react';
import { ImageOff, Trash2, AlertTriangle, Info } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function LowQualityPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchWithAuth } = useAuth();

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/insights/low-quality`);
                const data = await response.json();
                setFiles(data);
            } catch (error) {
                console.error("Failed to fetch low quality files:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, [fetchWithAuth]);

    const toggleSelect = (id) => {
        setFiles(files.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
    };

    const selectedSize = files.filter(f => f.selected).reduce((acc, f) => acc + parseFloat(f.size || 0), 0).toFixed(1);

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
                setFiles(files.filter(f => !f.selected));
                alert(`Successfully freed up ${result.detailed_results.reclaimed_str}!`);
            } else {
                alert("Some files failed to delete.");
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
                    <h1 className="text-3xl font-extrabold text-eco-text">Low Quality Media</h1>
                    <p className="text-sm text-eco-muted mt-1 flex items-center gap-1.5 pt-1">
                        <Info size={14} className="text-blue-500" />
                        AI detected images that are blurry, under-exposed, or have low resolution.
                    </p>
                </div>
                <Button variant="danger" icon={Trash2} className="px-6 font-bold" onClick={handleDelete}>
                    Delete Selected ({selectedSize} MB)
                </Button>
            </div>

            <Card className="bg-orange-50/50 border-orange-100 flex gap-4 items-start p-5 rounded-2xl shadow-none">
                <div className="mt-0.5 text-orange-500">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <p className="text-sm text-eco-text font-medium leading-relaxed">
                        <span className="font-bold text-orange-700">Suggestion:</span> These images appear blurry or low quality and may not be worth keeping. Deleting them can improve your overall storage quality and save space.
                    </p>
                </div>
            </Card>

            <Card noPadding className="overflow-hidden border-eco-border rounded-2xl">
                <div className="bg-gray-50/80 border-b border-eco-border px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-eco-text text-sm">Review Detected Files ({files.length})</h3>
                    <button className="text-xs font-bold text-eco-primary hover:text-eco-primary/80 transition-colors">
                        Select All
                    </button>
                </div>
                <div className="divide-y divide-eco-border">
                    {loading ? (
                        <p className="p-12 text-center text-eco-muted italic">Analyzing image quality...</p>
                    ) : !Array.isArray(files) || files.length === 0 ? (
                        <p className="p-12 text-center text-eco-muted italic">No low quality media detected.</p>
                    ) : (
                      files.map((file) => (
                        <div
                            key={file.id}
                            className={`p-5 flex items-center justify-between transition-colors cursor-pointer hover:bg-gray-50 ${file.selected ? 'bg-green-50/30' : ''}`}
                            onClick={() => toggleSelect(file.id)}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${file.selected ? 'bg-eco-primary border-eco-primary text-white' : 'border-gray-300'}`}>
                                    {file.selected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative shrink-0 shadow-sm">
                                    <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-eco-text text-sm">{file.name}</h4>
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded pl-1.5 flex items-center gap-1 bg-orange-100/80 text-orange-700">
                                            <AlertTriangle size={10} />
                                            {file.issue}
                                        </span>
                                    </div>
                                    <p className="text-xs text-eco-muted">{file.path}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-4 flex flex-col justify-center">
                                <p className="font-bold text-eco-text text-sm">{file.size}</p>
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">{file.resolution}</p>
                            </div>
                        </div>
                      ))
                    )}
                </div>
            </Card>
        </div>
    );
}
