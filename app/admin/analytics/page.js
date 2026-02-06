'use client';

/**
 * Admin Analytics Page
 * ====================
 * Dedicated page for data visualization and business insights.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Download,
    Calendar,
    BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Loader from '@/components/Loader';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import RevenueChart from '@/components/admin/RevenueChart';
import TopProductsChart from '@/components/admin/TopProductsChart';
import StatusChart from '@/components/admin/StatusChart';
import { getAnalyticsData } from '@/lib/orders';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function AnalyticsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/admin/login');
            } else if (!isAdmin) {
                router.push('/');
            }
        }
    }, [user, isAdmin, authLoading, router]);

    // Fetch analytics data
    useEffect(() => {
        async function loadAnalytics() {
            if (!isAdmin) return;

            try {
                const result = await getAnalyticsData();
                if (result.success) {
                    setAnalytics(result);
                } else {
                    toast.error({ title: 'Failed to load analytics data' });
                }
            } catch (error) {
                console.error('Error loading analytics:', error);
                toast.error({ title: 'Failed to load analytics' });
            } finally {
                setLoading(false);
            }
        }

        if (isAdmin) {
            loadAnalytics();
        }
    }, [isAdmin]);

    if (loading || authLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader size="lg" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8 max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics & Reports</h1>
                        <p className="text-gray-400 mt-1">
                            Insights into revenue, product performance, and order trends.
                        </p>
                    </div>
                    {/* Placeholder for future date filter */}
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 cursor-not-allowed opacity-50">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 6 Months
                    </Button>
                </div>

                {/* Charts Grid */}
                {analytics ? (
                    <div className="grid gap-6">
                        {/* Revenue (Main Chart) */}
                        <motion.div variants={itemVariants}>
                            <RevenueChart data={analytics.revenueData} />
                        </motion.div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Order Status */}
                            <motion.div variants={itemVariants}>
                                <StatusChart data={analytics.statusDistribution} />
                            </motion.div>

                            {/* Top Products */}
                            <motion.div variants={itemVariants}>
                                <TopProductsChart data={analytics.topProducts} />
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                        <BarChart2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white">No analytics data available</h3>
                        <p className="text-gray-400 mt-1">Try checking your order data.</p>
                    </div>
                )}
            </motion.div>
        </AdminLayout>
    );
}
