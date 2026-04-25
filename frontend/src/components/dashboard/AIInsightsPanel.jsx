import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from "lucide-react";
import Card from '../Card';
import { Link } from 'react-router-dom';

export default function AIInsightsPanel({ insights = [], loading = false }) {

    return (
        <Card className="border-ai-accent/20 bg-gradient-to-br from-white to-ai-accent/[0.02]">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-ai-accent/10 p-3 rounded-xl text-ai-accent">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        AI Storage Insights
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Automated recommendations to reduce your digital carbon footprint
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <p className="text-eco-muted animate-pulse">Analyzing storage patterns...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {Array.isArray(insights) ? insights.map((insight, index) => (
                        <Link
                            key={index}
                            to={insight.link}
                            className="bg-white border border-slate-200/60 p-5 rounded-2xl flex justify-between items-center hover:border-ai-accent/30 hover:shadow-md transition-all group cursor-pointer shadow-sm"
                        >
                            <div>
                                <p className="font-bold text-eco-text">{insight.title}</p>
                                <p className="text-sm text-eco-muted mt-1">{insight.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 text-ai-accent text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                {insight.action}
                                <ArrowRight size={16} />
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-2 text-center py-4 text-eco-muted">
                            No insights available at this time.
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
