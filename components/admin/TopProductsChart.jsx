'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Package } from 'lucide-react';

const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'];

export default function TopProductsChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="border-gray-800 bg-gray-900/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-800/50">
                <div className="space-y-1">
                    <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5 text-pink-500" />
                        Top Products
                    </CardTitle>
                    <p className="text-xs text-gray-400">Most sold items by quantity</p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pl-0">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                            <XAxis type="number" stroke="#9ca3af" fontSize={12} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                stroke="#9ca3af"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
