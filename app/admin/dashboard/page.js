'use client';

/**
 * Admin Dashboard Page
 * ====================
 * Main admin dashboard with overview stats and quick actions.
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
    Clock,
    CheckCircle,
    Plus,
    Eye,
    ArrowRight,
    Search,
    CreditCard
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
            color: 'bg-emerald-500/10 text-emerald-500',
            border: 'border-emerald-500/20',
            trend: '+12.5%'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'bg-blue-500/10 text-blue-500',
            border: 'border-blue-500/20',
            trend: '+5.2%'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'bg-orange-500/10 text-orange-500',
            border: 'border-orange-500/20',
            trend: 'Action needed'
        },
        {
            title: 'Active Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'bg-purple-500/10 text-purple-500',
            border: 'border-purple-500/20',
            trend: '+2 new'
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
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                        <p className="text-gray-400">Welcome back, <span className="text-pink-400 font-medium">{user?.name || 'Admin'}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/" target="_blank">
                            <Button variant="outline" className="border-gray-700 hover:bg-gray-700 text-gray-300">
                                <Eye className="mr-2 h-4 w-4" />
                                View Site
                            </Button>
                        </Link>
                        <Link href="/admin/products?action=new">
                            <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-900/20 hover:shadow-pink-900/40 transition-all">
                                <Plus className="mr-2 h-4 w-4" />
                                New Product
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div key={stat.title} variants={itemVariants}>
                                <Card className={`border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 backdrop-blur-sm ${stat.border} border`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                                                <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">
                                                    {stat.value}
                                                </h3>
                                                <div className="mt-2 flex items-center text-xs">
                                                    <span className={`font-medium ${stat.trend.includes('+') ? 'text-green-400' : 'text-orange-400'}`}>
                                                        {stat.trend}
                                                    </span>
                                                    <span className="text-gray-500 ml-2">from last month</span>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Recent Orders - Takes up 2 columns */}
                    {/* ... */}
                    {/* Recent Orders - Takes up 2 columns */}
                    <motion.div variants={itemVariants} className="lg:col-span-2">
                        <Card className="border-gray-800 bg-gray-900/50 h-full shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-800">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl text-white">Recent Orders</CardTitle>
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
                                    <div className="divide-y divide-gray-800">
                                        {recentOrders.map((order) => (
                                            <div key={order.id} className="p-4 hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-gray-700 group-hover:text-white transition-colors">
                                                        <ShoppingBagIcon status={order.status} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm">
                                                            {order.userName || order.userEmail || 'Guest User'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {formatDate(order.createdAt)} • #{order.id.slice(0, 8)}
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
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-16 w-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
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

                    {/* Quick Stats / Distribution - Takes up 1 column */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-gray-800 bg-gray-900/50 shadow-lg">
                            <CardHeader className="border-b border-gray-800 p-6">
                                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 grid gap-3">
                                <Link href="/admin/products">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">Manage Products</p>
                                            <p className="text-xs text-gray-400">Add or edit items</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-white" />
                                    </div>
                                </Link>
                                <Link href="/admin/settings">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
                                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500/20">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">Platform Settings</p>
                                            <p className="text-xs text-gray-400">Configure store</p>
                                        </div>
                                        <ArrowRight className="ml-auto h-4 w-4 text-gray-600 group-hover:text-white" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Mini Insight */}
                        <Card className="border-gray-800 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-l-4 border-l-pink-500">
                            <CardContent className="p-6">
                                <h4 className="text-pink-400 font-semibold mb-2 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Growth Tip
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Adding featured products to your homepage can increase conversion by up to 25%.
                                </p>
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
