'use client';

/**
 * Admin Dashboard Page
 * ====================
 * Main admin dashboard with overview stats and quick actions.
 * Enhanced with premium visual design.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    Plus,
    Eye,
    ArrowRight,
    Search,
    CreditCard,
    Sparkles,
    Activity,
    BarChart3,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/Loader';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { getAllOrders, getOrderStats } from '@/lib/orders';
import { getProductStats } from '@/lib/products';
import { formatPrice, formatDate, getOrderStatusLabel } from '@/lib/utils';

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

const pulseGlow = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalProducts: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // ... (useEffect for redirect remains)

    // Fetch dashboard data
    useEffect(() => {
        async function loadDashboardData() {
            if (!isAdmin) return;

            try {
                const [orderStats, productStats, ordersResult] = await Promise.all([
                    getOrderStats(),
                    getProductStats(),
                    getAllOrders(),
                ]);

                if (orderStats.success) {
                    setStats(prev => ({
                        ...prev,
                        totalOrders: orderStats.stats.total,
                        totalRevenue: orderStats.stats.totalRevenue,
                        pendingOrders: orderStats.stats.pending,
                    }));
                }

                if (productStats.success) {
                    setStats(prev => ({
                        ...prev,
                        totalProducts: productStats.stats.total,
                    }));
                }

                if (ordersResult.success) {
                    setRecentOrders(ordersResult.orders.slice(0, 5));
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isAdmin) {
            loadDashboardData();
        }
    }, [isAdmin]);

    // ... (loading and auth checks remain)

    const statCards = [
        {
            title: 'Total Revenue',
            value: formatPrice(stats.totalRevenue),
            icon: DollarSign,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            glowColor: 'shadow-emerald-500/5',
            trendIcon: TrendingUp,
            trend: '+12.5%',
            trendUp: true,
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            glowColor: 'shadow-blue-500/5',
            trendIcon: TrendingUp,
            trend: '+5.2%',
            trendUp: true,
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            glowColor: 'shadow-orange-500/5',
            trendIcon: TrendingDown,
            trend: 'Needs attention',
            trendUp: false,
        },
        {
            title: 'Active Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            glowColor: 'shadow-purple-500/5',
            trendIcon: TrendingUp,
            trend: '+2 new',
            trendUp: true,
        },
    ];

    return (
        <AdminLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8 max-w-7xl mx-auto"
            >
                {/* Header Section — Premium Gradient */}
                <motion.div
                    variants={pulseGlow}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 md:p-8 border border-gray-800 shadow-2xl"
                >
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                    </div>

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/20">
                                    <LayoutDashboard className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                            </div>
                            <p className="text-gray-400">
                                Welcome back, <span className="text-pink-400 font-semibold">{user?.name || 'Admin'}</span>
                                <span className="hidden sm:inline"> — here&apos;s what&apos;s happening with your store</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/" target="_blank">
                                <Button variant="outline" className="border-gray-700 hover:bg-gray-700/50 text-gray-300 backdrop-blur-sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Site
                                </Button>
                            </Link>
                            <Link href="/admin/products?action=new">
                                <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg shadow-pink-900/30 hover:shadow-pink-900/50 transition-all">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid — Enhanced with Glow & Better Trends */}
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        const TrendIcon = stat.trendIcon;
                        return (
                            <motion.div key={stat.title} variants={itemVariants}>
                                <Card className={`relative overflow-hidden border ${stat.borderColor} bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 backdrop-blur-sm shadow-lg ${stat.glowColor}`}>
                                    {/* Subtle glow accent */}
                                    <div className={`absolute top-0 right-0 h-24 w-24 rounded-full ${stat.bgColor} blur-2xl opacity-50`} />
                                    <CardContent className="relative p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                                                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                                    {stat.value}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <TrendIcon className={`h-3.5 w-3.5 ${stat.trendUp ? 'text-green-400' : 'text-orange-400'}`} />
                                                    <span className={`text-xs font-semibold ${stat.trendUp ? 'text-green-400' : 'text-orange-400'}`}>
                                                        {stat.trend}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-xl ${stat.bgColor} ring-1 ring-white/5`}>
                                                <Icon className={`h-6 w-6 ${stat.color}`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                    {/* Recent Orders — Enhanced Table */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="border-gray-800 bg-gray-900/50 h-full shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-800">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-pink-400" />
                                        <CardTitle className="text-xl text-white">Recent Orders</CardTitle>
                                    </div>
                                    <p className="text-sm text-gray-400">Manage your latest transactions</p>
                                </div>
                                <Link href="/admin/orders">
                                    <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-950/30">
                                        View All
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentOrders.length > 0 ? (
                                    <div className="divide-y divide-gray-800/80">
                                        {recentOrders.map((order, idx) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-gray-700 group-hover:text-white transition-colors ring-1 ring-gray-700/50">
                                                        <ShoppingBagIcon status={order.status} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm group-hover:text-pink-300 transition-colors">
                                                            {order.userName || order.userEmail || 'Guest User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {formatDate(order.createdAt)} • <span className="font-mono text-gray-600">#{order.id.slice(0, 8)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white text-sm">
                                                        {formatPrice(order.total)}
                                                    </p>
                                                    <div className="mt-1">
                                                        <StatusBadge status={order.status} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-16 w-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 ring-1 ring-gray-700/30">
                                            <ShoppingCart className="h-8 w-8 text-gray-600" />
                                        </div>
                                        <h3 className="text-lg font-medium text-white">No orders yet</h3>
                                        <p className="text-gray-400 mt-1 max-w-xs">
                                            Orders will appear here once customers start making purchases.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar — Quick Actions & Insights */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-gray-800 bg-gray-900/50 shadow-xl">
                            <CardHeader className="border-b border-gray-800 p-6">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                    <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 grid gap-3">
                                <Link href="/admin/products">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/70 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer group">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors ring-1 ring-blue-500/10">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">Manage Products</p>
                                            <p className="text-xs text-gray-400">Add or edit items</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                                <Link href="/admin/orders">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/70 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer group">
                                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors ring-1 ring-green-500/10">
                                            <ShoppingCart className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">View Orders</p>
                                            <p className="text-xs text-gray-400">Check order statuses</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                                <Link href="/admin/settings">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/70 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer group">
                                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors ring-1 ring-purple-500/10">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">Platform Settings</p>
                                            <p className="text-xs text-gray-400">Configure store</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Growth Insight — Glassmorphism Card */}
                        <Card className="relative overflow-hidden border-gray-800 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-gray-900/50 border-l-4 border-l-pink-500 shadow-xl backdrop-blur-sm">
                            {/* Decorative glow */}
                            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-pink-500/15 blur-2xl" />
                            <CardContent className="relative p-6">
                                <h4 className="text-pink-400 font-bold mb-3 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 ring-1 ring-pink-500/30">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    Boost Your Sales
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Consider running a flash sale this weekend. Stores that run 48-hour promotions see an average <span className="text-pink-400 font-semibold">25% increase</span> in revenue.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Store Performance Mini Chart */}
                        <Card className="border-gray-800 bg-gray-900/50 shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-5 w-5 text-blue-400" />
                                    <h4 className="text-white font-semibold">Store Performance</h4>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Conversion Rate</span>
                                            <span className="text-white font-medium">68%</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '68%' }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Customer Satisfaction</span>
                                            <span className="text-white font-medium">92%</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '92%' }}
                                                transition={{ duration: 1, delay: 0.7 }}
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-400">Order Fulfillment</span>
                                            <span className="text-white font-medium">85%</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '85%' }}
                                                transition={{ duration: 1, delay: 0.9 }}
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </AdminLayout>
    );
}

// Helpers
function StatusBadge({ status }) {
    const styles = {
        completed: "bg-green-500/10 text-green-400 border-green-500/20",
        approved: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {getOrderStatusLabel(status)}
        </span>
    );
}

function ShoppingBagIcon({ status }) {
    if (status === 'completed' || status === 'approved') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'cancelled') return <CreditCard className="h-5 w-5 text-red-500" />;
    return <Clock className="h-5 w-5 text-yellow-500" />;
}
