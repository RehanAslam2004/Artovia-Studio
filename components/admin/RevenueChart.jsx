'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

export default function RevenueChart({ data }) {
    if (!data || data.length === 0) return null;

    const totalRevenue = data.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <Card className="border-gray-800 bg-gray-900/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-800/50">
                <div className="space-y-1">
                    <CardTitle className="text-lg text-white font-semibold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                        Revenue Trend
                    </CardTitle>
                    <p className="text-xs text-gray-400">Past 6 months performance</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-400">Total (Period)</p>
                    <p className="text-xl font-bold text-emerald-400">{formatPrice(totalRevenue)}</p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pl-0">
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Rs.${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value) => [formatPrice(value), 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
