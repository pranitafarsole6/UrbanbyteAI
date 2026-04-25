import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Trash2, RefreshCw, Trash, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function TrashBinPage() {
    const [trashedFiles, setTrashedFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const { fetchWithAuth } = useAuth();

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/drive/trash`);
            const data = await response.json();
            setTrashedFiles(data.files || []);
            setSelectedIds([]);
        } catch (error) {
            console.error("Failed to fetch trash:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, [fetchWithAuth]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRestore = async (id) => {
        try {
            const ids = id ? [id] : selectedIds;
            if (ids.length === 0) return;

            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/drive/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: ids })
            });
            const result = await response.json();
            if (result.success) {
                alert(`Successfully restored ${result.restored_count} files!`);
                fetchTrash();
            } else {
                alert(`Restoration failed: ${result.detail || result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Restore failed:", error);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!confirm("Are you sure? This will PERMANENTLY delete these files from Google Drive. This action cannot be undone.")) return;

        try {
            const ids = id ? [id] : selectedIds;
            if (ids.length === 0) return;

            const response = await fetchWithAuth(`${API_BASE_URL}/api/files/drive/empty-trash`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: ids })
            });
            const result = await response.json();
            if (result.success) {
                alert(`Permanently deleted ${result.deleted_permanently_count} files.`);
                fetchTrash();
            } else {
                alert(`Deletion failed: ${result.detail || result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Permanent deletion failed:", error);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-eco-text flex items-center gap-3">
                        <Trash2 className="text-eco-critical" size={28} />
                        Google Drive Trash
                    </h1>
                    <p className="text-lg text-eco-muted mt-1">Manage items you've moved to trash. Restore them or delete permanently.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchTrash} icon={RefreshCw} disabled={loading}>
                        Refresh
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => handleRestore()} 
                        disabled={selectedIds.length === 0 || loading}
                    >
                        Restore Selected ({selectedIds.length})
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => handlePermanentDelete()} 
                        disabled={selectedIds.length === 0 || loading}
                        icon={Trash}
                    >
                        Delete Permanently
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden p-0 border-eco-border">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-primary"></div>
                        <p className="text-eco-muted italic">Fetching your digital waste...</p>
                    </div>
                ) : trashedFiles.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="mx-auto text-eco-primary mb-4" size={48} />
                        <h3 className="text-xl font-bold text-eco-text">Your trash is empty!</h3>
                        <p className="text-eco-muted mt-2">Good job keeping your digital life clean.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-eco-border">
                        <div className="bg-eco-section px-6 py-3 flex items-center text-xs font-bold text-eco-muted uppercase tracking-wider">
                            <div className="w-10"></div>
                            <div className="flex-1">File Name</div>
                            <div className="w-24">Type</div>
                            <div className="w-32">Size</div>
                            <div className="w-48 text-right">Actions</div>
                        </div>
                        {trashedFiles.map((file) => (
                            <div key={file.id} className={`px-6 py-4 flex items-center hover:bg-eco-primary/5 transition-colors ${selectedIds.includes(file.id) ? 'bg-eco-primary/10' : ''}`}>
                                <div className="w-10">
                                    <div 
                                        className="w-5 h-5 rounded border border-eco-border flex items-center justify-center cursor-pointer"
                                        onClick={() => toggleSelect(file.id)}
                                    >
                                        {selectedIds.includes(file.id) && <CheckCircle size={16} className="text-eco-primary" />}
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-eco-section rounded text-eco-muted flex-shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-eco-text truncate">{file.name}</p>
                                        <p className="text-xs text-eco-muted">{file.type === 'drive' ? `ID: ${String(file.id).substring(0, 8)}...` : file.path}</p>
                                    </div>
                                </div>
                                <div className="w-24">
                                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${file.type === 'drive' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                         {file.type}
                                     </span>
                                </div>
                                <div className="w-32 text-sm text-eco-muted">
                                    {formatSize(file.size)}
                                </div>
                                <div className="w-48 flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleRestore(file.id)}
                                        className="p-2 text-eco-primary hover:bg-eco-primary/10 rounded transition-colors"
                                        title="Restore"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handlePermanentDelete(file.id)}
                                        className="p-2 text-eco-critical hover:bg-eco-critical/10 rounded transition-colors"
                                        title="Delete Permanently"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {trashedFiles.length > 0 && (
                <div className="bg-eco-warning/10 border border-eco-warning/30 rounded-xl p-4 flex items-start gap-4">
                    <AlertCircle className="text-eco-warning shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-eco-text">Google Drive Storage Note</h4>
                        <p className="text-sm text-eco-muted mt-1">
                            Files in your Google Drive Trash still count towards your storage limit until they are permanently deleted or automatically removed after 30 days.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
