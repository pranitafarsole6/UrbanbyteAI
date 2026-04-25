import React, { useState, useEffect } from 'react';
import { Award, Calendar, CheckCircle, ChevronRight, History, Star, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Card from '../components/Card';
import Button from '../components/Button';

export default function MilestonesPage() {
    const { fetchWithAuth } = useAuth();
    const [milestones, setMilestones] = useState([]);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile which includes milestones
                const profileRes = await fetchWithAuth(`${API_BASE_URL}/api/auth/profile`);
                const profileData = await profileRes.json();
                setMilestones(Array.isArray(profileData.milestones) ? profileData.milestones : []);

                // Fetch scanning history (could be a dedicated endpoint, but we can reuse summary for now or add one)
                const summaryRes = await fetchWithAuth(`${API_BASE_URL}/api/insights/summary`);
                const summaryData = await summaryRes.json();
                // If summary contains recent scans, use them. 
                // Let's assume we'll need a dedicated history endpoint for a full list
                setScans([]); 
            } catch (error) {
                console.error("Failed to fetch milestones:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchWithAuth]);

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-eco-text flex items-center gap-3">
                        <Trophy className="text-eco-warning" size={32} />
                        Your Achievements
                    </h1>
                    <p className="text-eco-muted mt-2 text-lg">Track your progress and celebrate your digital sustainability milestones.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-eco-text flex items-center gap-2">
                            <Star className="text-eco-primary" size={20} />
                            Unlocked Milestones
                        </h3>
                        <span className="text-xs font-bold text-eco-primary bg-eco-primary/10 px-2 py-1 rounded-full">
                            {milestones.length} Total
                        </span>
                    </div>

                    {milestones.length > 0 ? (
                        <div className="space-y-4">
                            {milestones.map((m, idx) => (
                                <div key={idx} className="p-4 rounded-xl border border-eco-border bg-eco-section/30 flex items-start gap-4 hover:border-eco-primary/50 transition-colors group">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-eco-warning shrink-0 group-hover:scale-110 transition-transform">
                                        <Award size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-eco-text group-hover:text-eco-primary transition-colors">{m.title}</h4>
                                            <span className="text-[10px] font-bold text-eco-muted flex items-center gap-1">
                                                <Calendar size={10} />
                                                {new Date(m.achieved_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-eco-muted mt-1">{m.description}</p>
                                    </div>
                                    <CheckCircle size={20} className="text-eco-primary shrink-0 self-center" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-eco-bg rounded-full flex items-center justify-center mx-auto mb-4 text-eco-muted opacity-50">
                                <Award size={32} />
                            </div>
                            <p className="text-eco-muted font-medium">No milestones achieved yet. Keep scanning!</p>
                            <Button variant="outline" className="mt-4" onClick={() => window.location.href='/scanner'}>Start First Scan</Button>
                        </div>
                    )}
                </Card>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-eco-primary/20 to-eco-primary/10 border-eco-primary/30">
                        <h3 className="font-bold text-eco-text mb-4">Eco Progress</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-eco-muted uppercase mb-2">
                                    <span>Next Reward</span>
                                    <span>75%</span>
                                </div>
                                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                     <div className="bg-eco-primary h-full rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <p className="text-xs text-eco-muted italic">"Scan 5 times to unlock 'Consistent Cleaner' badge"</p>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-eco-text mb-4 flex items-center gap-2">
                            <History size={18} className="text-eco-muted" />
                            Recent activity
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-eco-primary mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="font-medium text-eco-text">Completed Local Scan</p>
                                    <p className="text-xs text-eco-muted">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-eco-critical mt-1.5 shrink-0"></div>
                                <div>
                                    <p className="font-medium text-eco-text">Deleted 1.2 GB of Duplicates</p>
                                    <p className="text-xs text-eco-muted">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
