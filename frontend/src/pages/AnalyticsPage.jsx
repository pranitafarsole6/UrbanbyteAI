import React, { useState, useEffect } from 'react';
import { Calendar, Download, RefreshCw, Cloud, HardDrive, Server, ChevronDown, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function AnalyticsPage() {
    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState({
        cleanup_efficiency: "...",
        active_storage: "...",
        savings_usd: "...",
        efficiency_change: "..."
    });
    const [datatypes, setDatatypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchWithAuth } = useAuth();

    const fetchData = React.useCallback(async () => {
        try {
            const [histRes, summaryRes, typesRes] = await Promise.all([
                fetchWithAuth(`${API_BASE_URL}/api/analytics/historical`),
                fetchWithAuth(`${API_BASE_URL}/api/analytics/summary`),
                fetchWithAuth(`${API_BASE_URL}/api/analytics/datatypes`)
            ]);
            
            const histData = await histRes.json();
            const summaryData = await summaryRes.json();
            const typesData = await typesRes.json();
            
            setChartData(Array.isArray(histData) ? histData : []);
            setSummary(summaryData || {});
            setDatatypes(Array.isArray(typesData) ? typesData : []);
        } catch (error) {
            console.error("Failed to fetch analytics data:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchWithAuth]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalFiles = Array.isArray(datatypes) ? datatypes.reduce((a, b) => a + (b.value || 0), 0) : 0;
    const getPercentage = (count) => totalFiles > 0 ? (count / totalFiles) * 100 : 0;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="text-xs text-eco-muted font-medium mb-4 tracking-wide">
                Home <span className="mx-1">&gt;</span> <span className="text-eco-text">Analytics Deep-Dive</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-eco-text">Analytics Deep-Dive</h1>
                    <p className="text-sm text-eco-muted mt-1">Detailed insights into your digital footprint and storage efficiency over time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white" icon={RefreshCw} onClick={() => fetchData()}>
                        Refresh Data
                    </Button>
                    <Button variant="primary" icon={Download}>
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-bold text-eco-muted uppercase tracking-wider">Cleanup Efficiency</h3>
                        <div className="p-2 bg-green-50 rounded-lg text-eco-primary">
                            <RefreshCw size={16} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-eco-text uppercase">{summary.cleanup_efficiency}</span>
                            <span className="text-sm font-bold text-eco-primary flex items-center">
                                <svg className="w-3 h-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {summary.efficiency_change}
                            </span>
                        </div>
                        <p className="text-xs text-eco-muted mt-2">Historical efficiency average</p>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-bold text-eco-muted uppercase tracking-wider">Active Storage</h3>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                            <HardDrive size={16} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-eco-text uppercase">{summary.active_storage}</span>
                        </div>
                        <p className="text-xs text-eco-muted mt-2">Total scanned storage across sources</p>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-bold text-eco-muted uppercase tracking-wider">Storage Savings</h3>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-eco-text uppercase">{summary.savings_usd}</span>
                        </div>
                        <p className="text-xs text-eco-muted mt-2">Estimated cost reduction value</p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 flex flex-col h-96">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-eco-text">Storage Growth vs. Cleanup</h3>
                        {loading ? (
                             <p className="text-xs text-eco-muted italic">Processing chart data...</p>
                        ) : (
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <div className="flex items-center gap-1.5 text-eco-text">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    Growth (GB)
                                </div>
                                <div className="flex items-center gap-1.5 text-eco-text">
                                    <div className="w-2.5 h-2.5 rounded-full bg-eco-primary"></div>
                                    Cleanup (GB)
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 w-full relative min-h-0">
                        {!loading && Array.isArray(chartData) && chartData.length > 0 && (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                    />
                                    <Line type="monotone" dataKey="growth" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="cleanup" stroke="#22C55E" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card className="p-6 flex flex-col h-96">
                    <h3 className="font-bold text-eco-text mb-6">Data Type Distribution</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-hide">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : Array.isArray(datatypes) && datatypes.length > 0 ? (
                            datatypes.sort((a, b) => b.value - a.value).map((item) => {
                                const type = item.name.toLowerCase();
                                return (
                                <div key={item.name} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-eco-text capitalize">
                                            {type.includes('image') && <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                            {type.includes('video') && <svg className="w-4 h-4 text-eco-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                            {type.includes('document') && <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                            {!['image', 'video', 'document'].some(t => type.includes(t)) && <HardDrive className="w-4 h-4 text-gray-400" />}
                                            {item.name}
                                        </div>
                                        <span className="text-xs font-bold text-eco-muted">{item.value} files</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                type.includes('image') ? 'bg-blue-500' : 
                                                type.includes('video') ? 'bg-eco-primary' : 
                                                type.includes('document') ? 'bg-orange-400' : 'bg-gray-400'
                                            }`} 
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )})
                        ) : (
                            <p className="text-sm text-eco-muted italic px-4">No data type distribution available.</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-eco-border flex justify-between items-center">
                    <h3 className="font-bold text-eco-text">Top Storage Consumers by Source</h3>
                    <button className="text-sm font-semibold text-eco-muted flex items-center gap-1 hover:text-eco-text">
                        Filter by period <ChevronDown size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-eco-border bg-gray-50/50">
                                <th className="py-4 px-6 text-xs font-bold text-eco-muted uppercase tracking-wider">Source</th>
                                <th className="py-4 px-6 text-xs font-bold text-eco-muted uppercase tracking-wider">Storage Used</th>
                                <th className="py-4 px-6 text-xs font-bold text-eco-muted uppercase tracking-wider">Redundant Data</th>
                                <th className="py-4 px-6 text-xs font-bold text-eco-muted uppercase tracking-wider">Potential Cleanup</th>
                                <th className="py-4 px-6 text-xs font-bold text-eco-muted uppercase tracking-wider">Efficiency Score</th>
                                <th className="py-4 px-6 text-xs font-bold text-eco-muted uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-eco-border text-sm">
                            <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <Cloud className="text-blue-500 w-5 h-5" />
                                        <div>
                                            <p className="font-bold text-eco-text">Google Drive</p>
                                            <p className="text-xs text-eco-muted">Active connection</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 font-semibold text-eco-text uppercase">{summary.active_storage}</td>
                                <td className="py-4 px-6 font-bold text-red-500">Calculating...</td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-1.5 text-eco-muted">
                                        <CheckCircle2 className="w-4 h-4 text-eco-primary" />
                                        Optimizer active
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-eco-primary rounded-full" style={{ width: summary.cleanup_efficiency }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-eco-text uppercase">{summary.cleanup_efficiency}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <button className="text-xs font-bold text-eco-primary hover:text-eco-primary/80 transition-colors tracking-wide uppercase">
                                        Deep Scan
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="flex justify-center pt-4">
                <Button variant="outline" className="bg-white px-8 font-bold border-gray-300 text-eco-text hover:bg-gray-50" icon={RefreshCw}>
                    Re-run All Scans
                </Button>
            </div>

        </div>
    );
}
