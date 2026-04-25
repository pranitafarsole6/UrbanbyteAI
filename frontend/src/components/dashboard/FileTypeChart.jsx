import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Card from '../Card';

const colors = ["#22C55E", "#3B82F6", "#F59E0B", "#E2E8F0"];

export default function FileTypeChart({ categories }) {
    const chartData = React.useMemo(() => {
        if (!categories) return [
            { name: "Videos", value: 0 },
            { name: "Images", value: 0 },
            { name: "Docs", value: 0 },
            { name: "Others", value: 0 }
        ];

        return [
            { name: "Videos", value: categories.video || 0 },
            { name: "Images", value: categories.image || 0 },
            { name: "Docs", value: categories.document || 0 },
            { name: "Others", value: categories.other || 0 }
        ];
    }, [categories]);

    return (
        <Card>
            <h3 className="font-bold text-lg text-eco-text mb-6">
                File Type Distribution
            </h3>
            <div className="h-[250px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
                {chartData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-eco-muted font-medium">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                        {entry.name}
                    </div>
                ))}
            </div>
        </Card>
    );
}
