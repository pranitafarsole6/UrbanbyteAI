import React, { useState, useEffect } from 'react';
import { ArchiveX, Trash2, Folder, Hash } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function JunkFilesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchWithAuth } = useAuth();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/insights/junk-files`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch junk files:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [fetchWithAuth]);

    const toggleSelect = (id) => {
        setCategories(categories.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
    };

    const selectedSizeMB = Array.isArray(categories) 
        ? categories
            .filter(c => c.selected)
            .reduce((acc, c) => {
                let val = parseFloat(c.size || 0);
                if (c.size && c.size.includes('GB')) val *= 1000;
                return acc + val;
            }, 0)
        : 0;

    const selectedSizeStr = selectedSizeMB > 1000 ? (selectedSizeMB / 1000).toFixed(1) + " GB" : selectedSizeMB + " MB";

    const handleDelete = async () => {
        const filesToDelete = categories
            .filter(c => c.selected)
            .flatMap(c => c.paths);
            
        if (filesToDelete.length === 0) return;

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: filesToDelete })
            });
            const result = await response.json();
            
            if (result.success) {
                setCategories(categories.filter(c => !c.selected));
                alert(`Successfully cleaned up ${result.detailed_results.reclaimed_str}!`);
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
                    <h1 className="text-3xl font-extrabold text-eco-text">Junk File Detection</h1>
                    <p className="text-sm text-eco-muted mt-1">Detect unnecessary files like leftover installers and old archives.</p>
                </div>
                <Button variant="danger" icon={Trash2} className="px-6 font-bold" onClick={handleDelete}>
                    Clean Selected ({selectedSizeStr})
                </Button>
            </div>

            <Card noPadding className="overflow-hidden border-eco-border rounded-2xl">
                <div className="bg-gray-50/80 border-b border-eco-border px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-eco-text text-sm">Review Junk Categories</h3>
                    <button className="text-xs font-bold text-eco-primary hover:text-eco-primary/80 transition-colors">
                        Select All
                    </button>
                </div>
                <div className="divide-y divide-eco-border">
                    {loading ? (
                       <p className="p-12 text-center text-eco-muted italic">Scanning for redundant data...</p>
                    ) : !Array.isArray(categories) || categories.length === 0 ? (
                       <p className="p-12 text-center text-eco-muted italic">No junk files detected.</p>
                    ) : (
                      categories.map((category) => {
                        const Icon = category.name.includes("Downloads") ? Folder : category.name.includes("Temp") ? Hash : ArchiveX;
                        return (
                        <div
                            key={category.id}
                            className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors cursor-pointer hover:bg-gray-50 ${category.selected ? 'bg-green-50/30' : ''}`}
                            onClick={() => toggleSelect(category.id)}
                        >
                            <div className="flex items-start gap-5 flex-1 w-full">
                                <div className={`mt-1 md:mt-0 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${category.selected ? 'bg-eco-primary border-eco-primary text-white' : 'border-gray-300'}`}>
                                    {category.selected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>

                                <div className={`p-3 rounded-xl shrink-0 ${category.bgColor} ${category.color}`}>
                                    <Icon size={24} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-eco-text text-base">{category.name}</h3>
                                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{category.count} items</span>
                                    </div>
                                    <p className="text-sm text-eco-muted">{category.description}</p>

                                    <div className="mt-3 bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                                        <p className="text-xs text-eco-muted font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-eco-primary block"></span>
                                            <span className="font-bold text-eco-text">Cleanup Suggestion:</span> {category.suggestion}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-32 shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pl-10 md:pl-0 border-t md:border-t-0 md:border-l border-eco-border pt-4 md:pt-0">
                                <span className="text-xs text-eco-muted md:hidden font-bold">Size:</span>
                                <span className="font-extrabold text-xl text-eco-text">{category.size}</span>
                            </div>
                        </div>
                        )
                      })
                    )}
                </div>
            </Card>
        </div>
    );
}
