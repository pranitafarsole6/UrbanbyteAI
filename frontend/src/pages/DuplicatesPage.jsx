import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Copy, File, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function DuplicatesPage() {
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchWithAuth } = useAuth();

    useEffect(() => {
        const fetchDuplicates = async () => {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/insights/duplicates`);
                const data = await response.json();
                if (data && Array.isArray(data.groups)) {
                    setDuplicateGroups(data.groups);
                } else {
                    setDuplicateGroups([]);
                }
            } catch (error) {
                console.error("Failed to fetch duplicates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDuplicates();
    }, [fetchWithAuth]);

    const toggleSelect = (groupId, fileIdx) => {
        setDuplicateGroups(groups => groups.map(g => {
            if (g.id === groupId) {
                const newFiles = [...g.files];
                newFiles[fileIdx].selected = !newFiles[fileIdx].selected;
                return { ...g, files: newFiles };
            }
            return g;
        }));
    };

    const handleCleanSelected = async () => {
        const filesToDelete = [];
        duplicateGroups.forEach(g => {
            g.files.forEach(f => {
                if (!f.selected) { // In this UI, 'Trash' means !selected based on line 74
                    filesToDelete.push(f.path);
                }
            });
        });
        
        if (filesToDelete.length === 0) return;

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: filesToDelete })
            });
            const result = await response.json();
            
            if (result.success) {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/insights/duplicates`);
                const data = await res.json();
                setDuplicateGroups(data.groups || []);
                alert(`Successfully freed up ${result.detailed_results.reclaimed_str}!`);
            } else {
                alert("Some files failed to delete.");
            }
        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Failed to reach backend for deletion.");
        }
    };

    const handleKeepOneDeleteRest = async (groupId) => {
        const group = duplicateGroups.find(g => g.id === groupId);
        if (!group) return;

        // Keep the first one, delete the rest
        const filesToDelete = group.files.slice(1).map(f => f.path);
        
        if (filesToDelete.length === 0) return;

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: filesToDelete })
            });
            const result = await response.json();
            
            if (result.success) {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/insights/duplicates`);
                const data = await res.json();
                setDuplicateGroups(data.groups || []);
            }
        } catch (error) {
             console.error("Deletion failed:", error);
        }
    };

    // Calculate total wasted space currently marked for deletion
    let totalWastedBytes = 0;
    duplicateGroups.forEach(g => {
        g.files.forEach(f => {
            if (!f.selected) {
                 // To get accurate bytes here we'd need them in the model, but we can do a rough fallback 
                 // parsing or just show a general "Clean Selected" label for simplicity in MVP
            }
        });
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-eco-text flex items-center gap-3">
                        <Copy className="text-eco-warning" size={28} />
                        Duplicate Files
                    </h1>
                    <p className="text-lg text-eco-muted mt-1">Review and remove identical files to free up space.</p>
                </div>
                <Button variant="danger" icon={Trash2} onClick={handleCleanSelected}>
                    Clean Trashed Items
                </Button>
            </div>

            <div className="space-y-6">
                {duplicateGroups.map((group) => (
                    <Card key={group.id} className="overflow-hidden p-0 border-eco-warning/30">
                        <div className="bg-eco-section border-b border-eco-border px-6 py-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-eco-text">{group.name}</h3>
                                <p className="text-xs font-medium text-eco-warning mt-1">Potential Savings: {group.wastedSpace}</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-eco-text border-eco-border" onClick={() => handleKeepOneDeleteRest(group.id)}>
                                Keep One & Delete Rest
                            </Button>
                        </div>
                        <div className="divide-y divide-eco-border">
                            {group.files.map((file, idx) => (
                                <div key={idx} className={`px-6 py-4 flex items-center justify-between ${file.selected ? 'bg-eco-primary/5' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-5 h-5 rounded border border-eco-border flex items-center justify-center cursor-pointer"
                                            onClick={() => toggleSelect(group.id, idx)}
                                        >
                                            {file.selected && <CheckCircle size={16} className="text-eco-primary" />}
                                        </div>
                                        <div className="p-2 bg-eco-section rounded text-eco-muted">
                                            <File size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-eco-text">{file.path}</p>
                                            <p className="text-xs text-eco-muted">{file.date} &bull; {file.size}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {file.selected ? (
                                            <span className="text-xs font-bold text-eco-primary bg-eco-primary/10 px-2 py-1 rounded">Keep</span>
                                        ) : (
                                            <span className="text-xs font-bold text-eco-critical bg-eco-critical/10 px-2 py-1 rounded">Trash</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
