'use client';

/**
 * Account Page
 * ============
 * User account dashboard displaying profile info and recent orders.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    User,
    Package,
    Settings,
    LogOut,
    ChevronRight,
    Download,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import { getOrdersByUser, getOrdersByEmail } from '@/lib/orders';
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';

export default function AccountPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated, logout } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch orders
    useEffect(() => {
        async function loadOrders() {
            if (!user) return;

            try {
                // Try fetching by user ID first, fallback to email
                let result;
                if (user.uid) {
                    result = await getOrdersByUser(user.uid);
                }

                // If no orders found by user ID, try email
                if (!result?.success || result.orders.length === 0) {
                    result = await getOrdersByEmail(user.email);
                }

                if (result?.success) {
                    setOrders(result.orders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoadingOrders(false);
            }
        }

        if (isAuthenticated && user) {
            loadOrders();
        }
    }, [user, isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success({ title: 'Logged out successfully' });
            router.push('/');
        } catch (error) {
            toast.error({ title: 'Failed to log out' });
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />;
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                    >
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                My Account
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Welcome back, {user?.name || user?.email || 'User'}!
                            </p>
                        </div>

                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Profile Card */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                                        {(user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <Card>
                            <CardContent className="p-0">
                                <nav className="divide-y divide-gray-100 dark:divide-gray-800">
                                    <Link
                                        href="/account/orders"
                                        className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">My Orders</span>
                                        </div>
                                        <Badge variant="secondary">{orders.length}</Badge>
                                    </Link>

                                    <Link
                                        href="/account/settings"
                                        className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Settings className="h-5 w-5 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">Settings</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </Link>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Recent Orders */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Recent Orders</CardTitle>
                                <Link href="/account/orders">
                                    <Button variant="ghost" size="sm">
                                        View All
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {loadingOrders ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="animate-pulse flex items-center gap-4">
                                                <div className="h-12 w-12 rounded bg-gray-200 dark:bg-gray-800" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                                                    <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {orders.slice(0, 5).map((order) => (
                                            <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(order.status)}
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {order.items?.length || 0} items • {formatDate(order.createdAt)}
                                                        </p>
                                                        {order.items && (
                                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                                                                {order.items.map(i => i.name).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="text-right">
                                                        <Badge variant={order.status === 'completed' ? 'success' : 'secondary'}>
                                                            {getOrderStatusLabel(order.status)}
                                                        </Badge>
                                                        <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                                                            {formatPrice(order.total)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Download Links (if approved) */}
                                                {order.status === 'approved' && order.downloadLinks?.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {order.downloadLinks.map((link, index) => (
                                                            <a
                                                                key={index}
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="mr-1 h-3 w-3" />
                                                                    {link.name || `Download ${index + 1}`}
                                                                </Button>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="mx-auto h-12 w-12 text-gray-300" />
                                        <p className="mt-4 text-gray-500">No orders yet</p>
                                        <Link href="/shop" className="mt-4 inline-block">
                                            <Button>Start Shopping</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
