'use client';

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PieChart as PieIcon } from 'lucide-react';

export default function StatusChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="border-gray-800 bg-gray-900/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-800/50">
                <div className="space-y-1">
                    <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                        <PieIcon className="h-5 w-5 text-blue-500" />
                        Order Status
                    </CardTitle>
                    <p className="text-xs text-gray-400">Distribution of order statuses</p>
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="h-[250px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
