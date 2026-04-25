import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Card from '../components/Card';
import Button from '../components/Button';

export default function SimilarImagesPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useAuth();

  const fetchGroups = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/insights/similar-images`);
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch similar images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchWithAuth]);

  const handleDeleteOthers = async (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const filesToDelete = group.images.filter(img => !img.best).map(img => img.path);
    if (filesToDelete.length === 0) return;

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/files/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesToDelete })
      });
      const result = await response.json();

      if (result.success) {
        alert(`Successfully cleaned up ${result.detailed_results.reclaimed_str}!`);
        fetchGroups();
      } else {
        alert("Some files failed to delete.");
      }
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("Failed to reach backend for deletion.");
    }
  };

  const totalFiles = Array.isArray(groups) ? groups.reduce((acc, g) => acc + parseInt(g.count || 0), 0) : 0;
  const totalSavings = Array.isArray(groups) ? groups.reduce((acc, g) => acc + parseFloat(g.saving || 0), 0) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-eco-text">Similar Image Detection</h1>
          <p className="text-sm text-eco-muted mt-1">UrbanByte AI has identified {groups.length} groups of visually redundant photos.</p>
        </div>
        <Button variant="primary" icon={RefreshCcw} className="bg-eco-primary hover:bg-eco-hover text-white font-bold py-2.5 px-6">
          Scan Library Again
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-eco-muted">Total Redundant Files</h3>
            <span className="text-xs font-bold text-eco-primary bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <span className="text-3xl font-extrabold text-eco-text">{loading ? "..." : `${totalFiles} images`}</span>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-eco-muted">Potential Savings</h3>
            <span className="text-xs font-bold text-eco-primary bg-green-50 px-2 py-0.5 rounded-full">+15%</span>
          </div>
          <span className="text-3xl font-extrabold text-eco-text">{loading ? "..." : `${totalSavings.toFixed(1)} MB`}</span>
        </Card>
        <Card className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-eco-muted">AI Confidence</h3>
            <span className="text-xs font-bold text-eco-primary bg-green-50 px-2 py-0.5 rounded-full">Stable</span>
          </div>
          <span className="text-3xl font-extrabold text-eco-text">98.4%</span>
        </Card>
      </div>

      <div className="space-y-12">
        {loading ? (
          <p className="text-eco-muted italic">Scanning for similarities...</p>
        ) : !Array.isArray(groups) || groups.length === 0 ? (
          <p className="text-eco-muted italic text-center py-12">No similar images found in the current scan.</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg text-eco-text">{group.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-200/50 px-2.5 py-1 rounded-full">{group.count}</span>
                  <span className="text-xs font-bold text-eco-primary flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    {group.saving}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="text-eco-primary border-eco-primary hover:bg-eco-primary/5 font-bold px-5">
                    Keep All
                  </Button>
                  <Button 
                    variant="primary" 
                    className="bg-eco-primary font-bold px-5"
                    onClick={() => handleDeleteOthers(group.id)}
                  >
                    Keep Best &amp; Delete Others
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.isArray(group.images) && group.images.map((img) => (
                  <div key={img.id} className="flex flex-col">
                    <div
                      className={`relative rounded-2xl overflow-hidden aspect-square transition-all ${img.best
                        ? 'border-[3px] border-eco-primary shadow-sm'
                        : 'border border-transparent opacity-60 grayscale-[30%] hover:opacity-100 hover:grayscale-0'
                        }`}
                    >
                      {/* Badge */}
                      {img.best && (
                        <div className="absolute top-3 left-3 bg-eco-primary text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 z-10">
                          BEST SELECTION
                        </div>
                      )}

                      <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="mt-3 flex justify-between items-start">
                      <div>
                        <p className={`font-bold text-sm ${img.best ? 'text-eco-text' : 'text-gray-400'}`}>{img.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{img.meta}</p>
                      </div>
                      {img.best && (
                        <div className="text-eco-primary">
                          <CheckCircle size={18} strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
