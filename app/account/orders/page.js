'use client';

/**
 * Orders Page
 * ===========
 * User's order history with detailed order information.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    ArrowLeft,
    Download,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Mail,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth';
import { getOrdersByUser, getOrdersByEmail } from '@/lib/orders';
import {
    formatPrice,
    formatDate,
    getOrderStatusColor,
    getOrderStatusLabel
} from '@/lib/utils';

export default function OrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

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
                let result;
                if (user.uid) {
                    result = await getOrdersByUser(user.uid);
                }

                if (!result?.success || result.orders.length === 0) {
                    result = await getOrdersByEmail(user.email);
                }

                if (result?.success) {
                    setOrders(result.orders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated && user) {
            loadOrders();
        }
    }, [user, isAuthenticated]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-yellow-600" />;
        }
    };

    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'artovia.business@gmail.com';

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
                <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <Link
                        href="/account"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Account
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        My Orders
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="pt-6">
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                                        <div className="h-20 rounded bg-gray-200 dark:bg-gray-800" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card>
                                    <CardContent className="pt-6">
                                        {/* Order Header */}
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(order.status)}
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Placed on {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge variant={order.status === 'completed' || order.status === 'approved' ? 'success' : 'secondary'}>
                                                    {getOrderStatusLabel(order.status)}
                                                </Badge>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {formatPrice(order.total)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {order.items?.slice(0, 3).map((item, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {item.name}
                                                </Badge>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <Badge variant="secondary">
                                                    +{order.items.length - 3} more
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Expand/Collapse Button */}
                                        <button
                                            onClick={() => setExpandedOrder(
                                                expandedOrder === order.id ? null : order.id
                                            )}
                                            className="mt-4 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            <Eye className="h-4 w-4" />
                                            {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                            {expandedOrder === order.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                                        {/* Items List */}
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                            Order Items
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                                >
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                                            {item.name}
                                                                        </p>
                                                                        <p className="text-gray-500 text-xs mt-0.5">
                                                                            Qty: {item.quantity} • {formatPrice(item.price)} each
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                                            {formatPrice(item.price * item.quantity)}
                                                                        </p>


                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Payment Info */}
                                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Payment Method</p>
                                                                <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                                    {order.paymentMethod || 'Not specified'}
                                                                </p>
                                                            </div>
                                                            {order.transactionId && (
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Transaction ID</p>
                                                                    <p className="font-medium text-gray-900 dark:text-white font-mono">
                                                                        {order.transactionId}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Download Links / Access Links */}
                                                        {(order.status === 'approved' || order.status === 'completed') &&
                                                            order.downloadLinks?.length > 0 && (
                                                                <div className="mt-4">
                                                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                                                        Your Deliverables
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {order.downloadLinks.map((link, index) => (
                                                                            <a
                                                                                key={index}
                                                                                href={link.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                <Button
                                                                                    size="sm"
                                                                                    className={link.type === 'link' ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                                                                                >
                                                                                    {link.type === 'link' ? (
                                                                                        <Eye className="mr-1 h-4 w-4" />
                                                                                    ) : (
                                                                                        <Download className="mr-1 h-4 w-4" />
                                                                                    )}
                                                                                    {link.type === 'link'
                                                                                        ? `Access ${link.name || 'Link'}`
                                                                                        : `Download ${link.name || 'File'}`
                                                                                    }
                                                                                </Button>
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* Need Help */}
                                                        {order.status === 'pending' && (
                                                            <div className="mt-4">
                                                                <a
                                                                    href={`mailto:${supportEmail}?subject=Help with Order ${order.id.slice(0, 8).toUpperCase()}`}
                                                                >
                                                                    <Button variant="outline" size="sm">
                                                                        <Mail className="mr-2 h-4 w-4" />
                                                                        Need Help? Email Us
                                                                    </Button>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Package className="mx-auto h-16 w-16 text-gray-300" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                                No Orders Yet
                            </h2>
                            <p className="mt-2 text-gray-500">
                                Start shopping to see your orders here.
                            </p>
                            <Link href="/shop" className="mt-6 inline-block">
                                <Button>Browse Products</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
