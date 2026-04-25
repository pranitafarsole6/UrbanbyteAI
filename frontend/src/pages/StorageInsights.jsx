import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Sparkles, Image as ImageIcon, ImageOff, ArchiveX, HardDrive, Trash2, TrendingDown } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

// Sub-pages
import SimilarImagesPage from './SimilarImages';
import LowQualityPage from './LowQualityPage';
import JunkFilesPage from './JunkFilesPage';
import LargeFilesPage from './LargeFilesPage';

export default function StorageInsights() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Deep Analysis' },
    { id: 'similar', label: 'Similar Images' },
    { id: 'low-quality', label: 'Low Quality' },
    { id: 'junk', label: 'Junk Files' },
    { id: 'large', label: 'Large Files' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 w-full overflow-x-hidden">

      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto pb-2 -mb-2 scrollbar-hide">
        <div className="flex border-b border-eco-border min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold text-sm transition-colors relative whitespace-nowrap ${activeTab === tab.id
                  ? 'text-eco-primary'
                  : 'text-eco-muted hover:text-eco-text'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-eco-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Render Active View */}
      <div className="mt-6 w-full">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'similar' && <SimilarImagesPage />}
        {activeTab === 'low-quality' && <LowQualityPage />}
        {activeTab === 'junk' && <JunkFilesPage />}
        {activeTab === 'large' && <LargeFilesPage />}
      </div>

    </div>
  );
}

function OverviewTab() {
  const [summary, setSummary] = React.useState({
    junk_files: { size: "...", trend: "" },
    large_files: { size: "...", trend: "" },
    old_downloads: { size: "...", trend: "" }
  });
  const [insights, setInsights] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { fetchWithAuth } = useAuth();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, insRes] = await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/api/insights/summary`),
          fetchWithAuth(`${API_BASE_URL}/api/dashboard/ai-insights`)
        ]);
        const sumData = await sumRes.json();
        const insData = await insRes.json();
        
        if (sumData && sumData.junk_files) setSummary(sumData);
        setInsights(Array.isArray(insData) ? insData : []);
      } catch (error) {
        console.error("Failed to fetch insight data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchWithAuth]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-eco-text">Deep Analysis</h1>
        <p className="text-lg text-eco-muted mt-1">AI-driven breakdown of your digital waste and carbon footprint.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <Trash2 className="text-eco-primary w-5 h-5" />
          </div>
          <h3 className="font-bold text-eco-text mb-1">Junk Files</h3>
          <p className="text-sm text-eco-muted mb-4">Redundant cache and temporary data</p>

          <div className="mt-auto flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-eco-text">{summary.junk_files.size}</span>
            <span className="text-xs font-bold text-eco-primary bg-green-50 px-2 py-0.5 rounded-full">{summary.junk_files.trend}</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <svg className="text-eco-primary w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="font-bold text-eco-text mb-1">Large Files</h3>
          <p className="text-sm text-eco-muted mb-4">High-resolution media and assets</p>

          <div className="mt-auto flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-eco-text">{summary.large_files.size}</span>
            <span className="text-xs font-bold text-eco-muted border border-gray-200 px-2 py-0.5 rounded-full">{summary.large_files.trend}</span>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <ArchiveX className="text-eco-primary w-5 h-5" />
          </div>
          <h3 className="font-bold text-eco-text mb-1">Old Downloads</h3>
          <p className="text-sm text-eco-muted mb-4">Unused installers and zip files</p>

          <div className="mt-auto flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-eco-text">{summary.old_downloads.size}</span>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">{summary.old_downloads.trend}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">

        {/* Recommendations Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-eco-text">AI Recommendations</h3>
            <span className="text-xs font-bold text-eco-primary bg-green-50 px-2 py-1 rounded tracking-widest uppercase">Smart Scan</span>
          </div>

          {loading ? (
            <p className="text-sm text-eco-muted italic px-2">Processing recommendations...</p>
          ) : Array.isArray(insights) && insights.length > 0 ? (
            insights.map((insight, idx) => (
              <Card key={idx} className={`${idx === 0 ? 'border-l-4 border-l-eco-primary' : ''} py-4 px-5`}>
                <div className="flex gap-3 items-start">
                  <div className={`mt-0.5 ${idx === 0 ? 'text-eco-primary' : 'text-gray-400'}`}>
                    {idx === 0 ? (
                      <Sparkles size={18} />
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-eco-text">
                       {insight.desc}. <span className="font-medium text-eco-muted italic">Part of {insight.title.toLowerCase()}</span>.
                    </p>
                    <Link to={insight.link || '/insights'} className="text-xs font-bold text-eco-primary mt-3 hover:text-eco-primary/80 flex items-center gap-1 uppercase tracking-tight">
                      {insight.action} &gt;
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-eco-muted italic px-2">No recommendations available.</p>
          )}
        </div>

        {/* Graph Column */}
        <Card className="lg:col-span-2 p-6 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-bold text-lg text-eco-text">Cleanup History</h3>
              <p className="text-sm text-eco-muted mt-1">Storage reclaimed over the last 6 months</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-eco-primary bg-green-50 px-2 py-1 rounded">Monthly</span>
              <span className="text-eco-muted hover:text-eco-text cursor-pointer self-center">Yearly</span>
            </div>
          </div>

          <div className="flex-1 w-full relative flex flex-col justify-end min-h-[200px]">
            {/* Horizontal grid lines */}
            <div className="absolute inset-x-0 bottom-[20%] border-t border-gray-100"></div>
            <div className="absolute inset-x-0 bottom-[40%] border-t border-gray-100"></div>
            <div className="absolute inset-x-0 bottom-[60%] border-t border-gray-100"></div>
            <div className="absolute inset-x-0 bottom-[80%] border-t border-gray-100"></div>

            {/* Simple SVG Graph instead of Recharts for this specific simple mockup */}
            <svg className="w-full h-32 text-eco-primary z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M0,80 L20,90 L40,85 L60,95 L80,60 L100,70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-4 px-2 uppercase tracking-wide">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span className="text-eco-primary">Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-eco-border flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-eco-primary"></div>
              <span className="text-sm text-eco-text font-medium">Total Reclaimed: <span className="font-bold text-black">124.5 GB</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-eco-primary">
              <TrendingDown className="w-4 h-4" />
              Est. 14kg CO2 saved
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
