import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatsCard from '../components/dashboard/StatsCard';
import FileTypeChart from '../components/dashboard/FileTypeChart';
import StorageTrendChart from '../components/dashboard/StorageTrendChart';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function DashboardPage() {
    const [stats, setStats] = useState([]);
    const [insights, setInsights] = useState([]);
    const [categories, setCategories] = useState({});
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const { fetchWithAuth, user } = useAuth();

    const handleExportReport = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // 1. Title & Header
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(34, 197, 94); // Eco green
            doc.text("UrbanByte AI Sustainability Report", pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            const dateStr = new Date().toLocaleString();
            doc.text(`Generated on: ${dateStr}`, pageWidth / 2, 28, { align: 'center' });

            // Extract dynamic values from state
            const totalFiles = stats.find(s => s.id === 'total_files')?.value || '0';
            const totalSize = stats.find(s => s.id === 'total_size')?.value || '0 GB';
            const imagesCount = categories?.image || 0;
            const videosCount = categories?.video || 0;
            const docsCount = categories?.document || 0;

            // 1. User Information
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text("User Information", 14, 45);
            autoTable(doc, {
                startY: 50,
                theme: 'grid',
                headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
                body: [
                    ["Name", user?.full_name || 'N/A'],
                    ["Eco Level", user?.eco_level || 'Bronze']
                ]
            });

            // 2. Storage Overview
            const finalY1 = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text("Storage Overview", 14, finalY1);
            autoTable(doc, {
                startY: finalY1 + 5,
                theme: 'grid',
                headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
                body: [
                    ["Total Files Scanned", String(totalFiles)],
                    ["Total Storage Size", String(totalSize)]
                ]
            });

            // 3. File Distribution
            const finalY2 = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text("File Distribution", 14, finalY2);
            autoTable(doc, {
                startY: finalY2 + 5,
                theme: 'grid',
                headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
                body: [
                    ["Images", String(imagesCount)],
                    ["Videos", String(videosCount)],
                    ["Documents", String(docsCount)],
                    ["Others", String(categories?.other || 0)]
                ]
            });

            // 4. Sustainability Impact
            const finalY3 = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text("Sustainability Impact", 14, finalY3);
            autoTable(doc, {
                startY: finalY3 + 5,
                theme: 'grid',
                headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
                body: [
                    ["Eco Score", String(user?.eco_score || 0)],
                    ["Eco Points Earned", String(user?.eco_points || 0)],
                    ["Carbon Footprint (CO2) Saved", `${user?.carbon_saved_kg || 0} kg CO2`]
                ]
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
                doc.text("UrbanByte AI - Smart City Digital Sustainability", 14, pageHeight - 10);
            }

            // Save the document
            doc.save("UrbanByte_Report.pdf");

        } catch (error) {
            console.error("Failed to generate report", error);
            alert("Report generation failed");
        } finally {
            setIsExporting(false);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, insightsRes] = await Promise.all([
                    fetchWithAuth(`${API_BASE_URL}/api/dashboard/stats`),
                    fetchWithAuth(`${API_BASE_URL}/api/dashboard/ai-insights`)
                ]);

                if (statsRes.ok && insightsRes.ok) {
                    const statsData = await statsRes.json();
                    const insightsData = await insightsRes.json();
                    setStats(statsData.stats);
                    setCategories(statsData.categories);
                    setTrendData(statsData.trend || []);
                    setInsights(insightsData);
                } else {
                    console.error('Failed to fetch dashboard data:', statsRes.status, insightsRes.status);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [fetchWithAuth]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Storage Overview</h1>
                        <p className="text-lg text-slate-500 mt-1">Your cloud footprint and efficiency metrics</p>
                    </div>
                    <Button variant="outline" icon={Download} disabled>
                        Export Report
                    </Button>
                </div>
                <div className="text-center text-eco-muted">Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Storage Overview</h1>
                    <p className="text-lg text-slate-500 mt-1">Your cloud footprint and efficiency metrics</p>
                </div>
                <Button variant="outline" icon={Download} onClick={handleExportReport} disabled={isExporting}>
                    {isExporting ? 'Generating...' : 'Export Report'}
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {stats.map((stat) => (
                    <StatsCard
                        key={stat.id}
                        title={stat.title}
                        value={stat.value}
                        change={stat.change}
                        positive={stat.positive}
                    />
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div id="file-type-chart-container">
                    <FileTypeChart categories={categories} />
                </div>
                <Card id="storage-trend-container">
                    <div className="h-full flex flex-col">
                        <h3 className="font-bold text-lg text-slate-900 tracking-tight mb-6">Monthly Storage Usage</h3>
                        <StorageTrendChart data={trendData} />
                    </div>
                </Card>
            </div>

            <AIInsightsPanel insights={insights} loading={loading} />
        </div>
    );
}
