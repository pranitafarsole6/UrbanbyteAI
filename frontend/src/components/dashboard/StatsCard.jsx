import React from 'react';
import Card from '../Card';

export default function StatsCard({ title, value, change, positive = true }) {
    return (
        <Card className="flex flex-col justify-between h-full">
            <p className="text-sm font-medium text-slate-500 mb-2">
                {title}
            </p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {value}
                </h3>
            </div>
            <p className={`text-sm font-semibold mt-3 flex items-center justify-center gap-1 px-2.5 py-1 rounded-full w-fit
        ${positive ? "text-eco-primary bg-eco-primary/10" : "text-amber-600 bg-amber-50"}
      `}>
                {change}
            </p>
        </Card>
    );
}
