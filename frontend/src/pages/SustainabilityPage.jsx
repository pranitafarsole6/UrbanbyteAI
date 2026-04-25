import React, { useState, useEffect } from 'react';
import { Leaf, ArrowUpRight, Trophy } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function SustainabilityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/sustainability/metrics`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch sustainability metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [fetchWithAuth]);

  if (loading || !data) {
    return <div className="p-8 text-center text-eco-muted">Loading sustainability report...</div>;
  }

  const impactMetrics = data && Array.isArray(data.metrics) ? data.metrics : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-eco-text flex items-center gap-3">
            <Leaf className="text-eco-primary" size={28} />
            Sustainability Impact
          </h1>
          <p className="text-lg text-eco-muted mt-1">Track how your digital decluttering helps the planet.</p>
        </div>
        <Button variant="outline" icon={ArrowUpRight}>
          Share Impact
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {impactMetrics.map((metric, i) => (
          <Card key={i} className="flex flex-col justify-center">
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-eco-primary/10 text-eco-primary`}>
                 <Leaf size={24} />
              </div>
            </div>
            <h3 className="text-4xl font-extrabold text-eco-text mb-2">{metric.value} <span className="text-xl font-normal text-eco-muted">{metric.unit}</span></h3>
            <p className="font-bold text-eco-text">{metric.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-eco-bg to-eco-primary/5 border-eco-primary/20">
          <div className="relative mb-6">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-eco-border" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * (data.score / 100))}
                className="text-eco-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-eco-text">{data.score}</span>
              <span className="text-sm font-bold text-eco-primary uppercase tracking-wider mt-1">Eco Score</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-eco-text mb-2">You're doing great!</h3>
          <p className="text-eco-muted max-w-sm mb-6">
            Your Eco Score is in the top 20% of users. Clean up another 5GB to reach the "Digital Forester" rank.
          </p>
          <Button variant="primary">View Leaderboard</Button>
        </Card>

        <Card>
          <h3 className="font-bold text-lg text-eco-text mb-6 flex items-center gap-2">
            <Trophy className="text-eco-warning" size={20} />
            Recent Milestones
          </h3>
          <ul className="space-y-6">
             {data.milestones && data.milestones.length > 0 ? (
               data.milestones.slice(0, 3).map((m, idx) => (
                 <li key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-eco-primary/10 text-eco-primary flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="pb-4">
                      <h4 className="font-semibold text-eco-text">{m.title}</h4>
                      <p className="text-xs font-medium text-eco-muted mt-1 mb-2">
                        {new Date(m.achieved_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-eco-muted">{m.description}</p>
                    </div>
                  </li>
               ))
             ) : (
                <li className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                      !
                    </div>
                  </div>
                  <div className="pb-4">
                    <h4 className="font-semibold text-eco-text">No Milestones Yet</h4>
                    <p className="text-sm text-eco-muted mt-2">Complete scans and delete waste to earn badges!</p>
                  </div>
                </li>
             )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
