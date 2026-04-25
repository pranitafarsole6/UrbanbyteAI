import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StorageTrendChart({ data }) {
    return (
        <div className="h-[250px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `${value}G`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#FFFFFF',
                            padding: '12px'
                        }}
                        formatter={(value) => [`${value} GB`, 'Storage']}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="storage" 
                        stroke="#22C55E" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorStorage)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
