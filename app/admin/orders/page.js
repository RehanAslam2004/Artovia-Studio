'use client';

/**
 * Admin Orders Page
 * =================
 * Order management page with status updates and approval workflow.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Eye,
    Check,
    X,
    Clock,
    Download,
    Mail,
    ChevronDown,
    Link as LinkIcon,
    Plus,
    Trash2,
    CreditCard,
    Calendar,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/Loader';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import {
    getAllOrders,
    updateOrderStatus,
    approveOrder,
    cancelOrder
} from '@/lib/orders';
import { getProductById } from '@/lib/products';
import {
    formatPrice,
    formatDate,
    getOrderStatusLabel,
    getOrderStatusColor,
    debounce
} from '@/lib/utils';

// Status filter options
const statusFilters = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    // State
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Approval modal state
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalOrder, setApprovalOrder] = useState(null);
    const [downloadLinks, setDownloadLinks] = useState([{ name: '', url: '', type: 'link' }]);
    const [isApproving, setIsApproving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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

    // Fetch orders
    useEffect(() => {
        async function loadOrders() {
            if (!isAdmin) return;

            try {
                const result = await getAllOrders();
                if (result.success) {
                    setOrders(result.orders);
                    setFilteredOrders(result.orders);
                }
            } catch (error) {
                console.error('Error loading orders:', error);
                toast.error({ title: 'Failed to load orders' });
            } finally {
                setLoading(false);
            }
        }

        if (isAdmin) {
            loadOrders();
        }
    }, [isAdmin]);

    // Filter orders
    useEffect(() => {
        let result = [...orders];

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                order =>
                    order.id.toLowerCase().includes(query) ||
                    (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
                    (order.userName && order.userName.toLowerCase().includes(query)) ||
                    (order.userPhone && order.userPhone.includes(query)) ||
                    (order.transactionId && order.transactionId.toLowerCase().includes(query))
            );
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter(order => order.status === statusFilter);
        }

        // Filter by payment method
        if (paymentFilter) {
            result = result.filter(order => order.paymentMethod === paymentFilter);
        }

        // Filter by date range
        if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            result = result.filter(order => new Date(order.createdAt) >= startDate);
        }

        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(order => new Date(order.createdAt) <= endDate);
        }

        setFilteredOrders(result);
    }, [orders, searchQuery, statusFilter, paymentFilter, dateRange]);

    // Handle search
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle Reset Filters
    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPaymentFilter('');
        setDateRange({ start: '', end: '' });
    };

    // Open approval modal
    const openApprovalModal = (order) => {
        setApprovalOrder(order);

        // Auto-populate
        if (order.items && order.items.length > 0) {
            const autoLinks = order.items.map(item => ({
                name: item.name || 'Design File',
                url: item.canvaLink || '', // Only populate if strict match
                type: item.canvaLink ? 'link' : 'file' // Default to file if no link exists
            }));
            setDownloadLinks(autoLinks);
        } else {
            setDownloadLinks([{ name: '', url: '', type: 'file' }]);
        }

        setShowApprovalModal(true);
    };

    const closeApprovalModal = () => {
        setShowApprovalModal(false);
        setApprovalOrder(null);
        setDownloadLinks([{ name: '', url: '', type: 'link' }]);
    };

    const addDownloadLink = () => {
        setDownloadLinks([...downloadLinks, { name: '', url: '', type: 'file' }]);
    };

    const removeDownloadLink = (index) => {
        const updated = [...downloadLinks];
        updated.splice(index, 1);
        setDownloadLinks(updated);
    };

    const updateDownloadLink = (index, field, value) => {
        const updated = [...downloadLinks];
        updated[index][field] = value;
        setDownloadLinks(updated);
    };

    // Handle File Upload
    const handleFileUpload = async (index, file) => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'orders'); // Upload to orders folder

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                updateDownloadLink(index, 'url', data.url);
                toast.success({ title: 'File uploaded successfully' });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error({ title: 'Failed to upload file' });
        } finally {
            setIsUploading(false);
        }
    };

    // Handle Approve
    const handleApprove = async () => {
        if (!approvalOrder) return;

        // Validation
        const validLinks = downloadLinks.filter(l => l.name && l.url);
        if (validLinks.length === 0) {
            toast.error({ title: 'Please provide at least one valid download link or file' });
            return;
        }

        setIsApproving(true);
        try {
            const result = await approveOrder(approvalOrder.id, validLinks);

            if (result.success) {
                // Send Email
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'order_approval',
                        order: approvalOrder,
                        downloadLinks: validLinks
                    })
                });

                toast.success({ title: 'Order approved and email sent' });

                // Update local state
                const updatedOrders = orders.map(o =>
                    o.id === approvalOrder.id ? { ...o, status: 'approved', downloadLinks: validLinks } : o
                );
                setOrders(updatedOrders);
                closeApprovalModal();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Approval error:', error);
            toast.error({ title: 'Failed to approve order' });
        } finally {
            setIsApproving(false);
        }
    };

    // Handle Cancel
    const handleCancelOrder = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;

        setLoading(true); // Re-use loading state or add specific one
        try {
            const result = await cancelOrder(orderId);
            if (result.success) {
                toast.success({ title: 'Order cancelled successfully' });
                const updatedOrders = orders.map(o =>
                    o.id === orderId ? { ...o, status: 'cancelled' } : o
                );
                setOrders(updatedOrders);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error({ title: 'Failed to cancel order' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-white">Orders</h1>
                </div>

                {/* Filters Section */}
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                            <Input
                                placeholder="Search by ID, Email, Name, or Transaction..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="pl-9 bg-gray-900 border-gray-700 text-white w-full"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="w-full lg:w-48">
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                                >
                                    <option value="">All Payments</option>
                                    <option value="jazzcash">JazzCash</option>
                                    <option value="easypaisa">EasyPaisa</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-40">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="w-full pl-9 pr-2 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Start Date"
                                />
                            </div>
                            <div className="relative flex-1 lg:w-40">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="w-full pl-9 pr-2 py-2 bg-gray-900 border border-gray-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="End Date"
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                            title="Reset Filters"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === filter.value
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                        {/* Order Info */}
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-full ${order.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {order.status === 'approved' ? <Check className="h-6 w-6" /> :
                                                    order.status === 'cancelled' ? <X className="h-6 w-6" /> :
                                                        <Clock className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-white">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                                    <Badge variant={
                                                        order.status === 'approved' ? 'success' :
                                                            order.status === 'cancelled' ? 'destructive' :
                                                                'warning'
                                                    }>
                                                        {getOrderStatusLabel(order.status)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {order.userName} • {order.userEmail}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                                {order.transactionId && (
                                                    <div className="mt-2 flex items-center">
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20">
                                                            <CreditCard className="h-3 w-3 mr-1" />
                                                            ID: {order.transactionId}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price and Actions */}
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-white text-pink-500">
                                                    {formatPrice(order.total)}
                                                </p>
                                                <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                                                >
                                                    {expandedOrder === order.id ? 'Hide' : 'Details'}
                                                </Button>

                                                {order.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => openApprovalModal(order)}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedOrder === order.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-6 pt-6 border-t border-gray-800 grid gap-6 md:grid-cols-2">

                                                    {/* Order Items */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Items</h4>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, i) => (
                                                                <div key={i} className="flex gap-3 text-sm">
                                                                    <div className="h-10 w-10 rounded bg-gray-800 flex-shrink-0 overflow-hidden">
                                                                        {/* Placeholder for image */}
                                                                        <img
                                                                            src={item.productImage || '/images/placeholder.jpg'}
                                                                            alt={item.name}
                                                                            className="h-full w-full object-cover"
                                                                            onError={(e) => e.target.style.display = 'none'}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-200">{item.name}</p>
                                                                        <p className="text-gray-500">Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Details</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Phone</span>
                                                                <span className="text-gray-300">{order.userPhone || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Payment</span>
                                                                <span className="text-gray-300 capitalize">{order.paymentMethod}</span>
                                                            </div>
                                                            {order.transactionId && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Transaction ID</span>
                                                                    <span className="text-gray-300 font-mono">{order.transactionId}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {order.downloadLinks?.length > 0 && (
                                                            <div className="mt-4">
                                                                <p className="text-xs text-gray-500 mb-2">Delivered Files:</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {order.downloadLinks.map((link, i) => (
                                                                        <a key={i} href={link.url} target="_blank" className="text-xs bg-gray-800 text-purple-400 px-2 py-1 rounded hover:text-purple-300 truncate max-w-[200px]">
                                                                            {link.type === 'link' ? '🔗 ' : '📥 '} {link.name}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-gray-500 mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No orders found</h3>
                        <p className="text-gray-400 mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            <AnimatePresence>
                {showApprovalModal && approvalOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeApprovalModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-800 shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-gray-800 p-4">
                                <h2 className="text-xl font-bold text-white">Approve Order & Deliver</h2>
                                <button onClick={closeApprovalModal} className="text-gray-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Customer</p>
                                    <p className="text-white font-medium">{approvalOrder.userName}</p>
                                    <p className="text-xs text-gray-500">{formatDate(approvalOrder.createdAt)}</p>
                                </div>

                                {/* Delivery Items */}
                                <div>
                                    <Label className="text-gray-300 mb-2 block">Delivery Items</Label>
                                    <div className="space-y-4">
                                        {Array.isArray(downloadLinks) && downloadLinks.map((link, index) => (
                                            <div key={index} className="bg-gray-800/50 p-3 rounded-lg border border-gray-800 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item {index + 1}</span>
                                                    {downloadLinks.length > 1 && (
                                                        <button onClick={() => removeDownloadLink(index)} className="text-red-400 hover:text-red-300">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Download Link Management */}
                                                <div className="space-y-2">
                                                    {/* Name Input */}
                                                    <Input
                                                        placeholder="Item Name (e.g. Wedding Invitation)"
                                                        value={link.name}
                                                        onChange={(e) => updateDownloadLink(index, 'name', e.target.value)}
                                                        className="bg-gray-800 border-gray-700 text-white"
                                                    />

                                                    {/* URL Input */}
                                                    <div className="relative">
                                                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                                        <Input
                                                            placeholder="https://..."
                                                            value={link.url}
                                                            onChange={(e) => updateDownloadLink(index, 'url', e.target.value)}
                                                            className="pl-9 bg-gray-800 border-gray-700 text-white w-full pr-10"
                                                        />
                                                        {link.url && (
                                                            <a
                                                                href={link.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                                                                title="Test Link"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Action Toolbar */}
                                                    <div className="flex gap-2">
                                                        {/* 1. Auto-Generate Button */}
                                                        <Button
                                                            type="button"
                                                            onClick={async () => {
                                                                try {
                                                                    const itemData = approvalOrder.items?.[index];
                                                                    if (!itemData) {
                                                                        toast.error({ title: "Item data missing" });
                                                                        return;
                                                                    }
                                                                    const productId = itemData.productId || itemData.id;

                                                                    // 1. Snapshot
                                                                    if (itemData.downloadUrl || itemData.canvaLink) {
                                                                        const snapshotLink = itemData.downloadUrl || itemData.canvaLink;
                                                                        updateDownloadLink(index, 'url', snapshotLink);
                                                                        updateDownloadLink(index, 'type', (snapshotLink.includes('cloudinary') ? 'file' : 'link'));
                                                                        toast.success({ title: "Restored from order!" });
                                                                        return;
                                                                    }

                                                                    // 2. Fetch
                                                                    if (productId) {
                                                                        setIsUploading(true);
                                                                        try {
                                                                            const result = await getProductById(productId);
                                                                            if (result.success && result.product) {
                                                                                const p = result.product;
                                                                                // Fallback: downloadUrl -> canvaLink -> Cloudinary Image
                                                                                const fetchedLink = p.downloadUrl || p.canvaLink || (p.imageUrl?.includes('cloudinary') ? p.imageUrl : null);

                                                                                if (fetchedLink) {
                                                                                    updateDownloadLink(index, 'url', fetchedLink);
                                                                                    updateDownloadLink(index, 'type', (fetchedLink.includes('cloudinary') ? 'file' : 'link'));
                                                                                    toast.success({ title: "Fetched from product!" });
                                                                                } else {
                                                                                    toast.error({ title: "No link/file found in product." });
                                                                                }
                                                                            } else {
                                                                                toast.error({ title: "Product fetch failed." });
                                                                            }
                                                                        } catch (e) { toast.error({ title: "Connection error" }); }
                                                                        finally { setIsUploading(false); }
                                                                    } else {
                                                                        toast.error({ title: "Product ID missing" });
                                                                    }
                                                                } catch (err) { toast.error({ title: "Error" }); }
                                                            }}
                                                            disabled={isUploading}
                                                            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 border-0 hover:from-pink-700 hover:to-purple-700 h-9 text-xs"
                                                        >
                                                            {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                                            Auto-Generate
                                                        </Button>

                                                        {/* 2. Upload Button */}
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="file"
                                                                id={`file-upload-${index}`}
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(index, e.target.files[0])}
                                                            />
                                                            <label
                                                                htmlFor={`file-upload-${index}`}
                                                                className={`flex items-center justify-center w-full h-9 px-3 text-xs font-medium text-white transition-colors border rounded-md cursor-pointer ${isUploading
                                                                    ? 'bg-gray-800 border-gray-700 cursor-not-allowed'
                                                                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                                                                    }`}
                                                            >
                                                                {isUploading ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                                ) : (
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                )}
                                                                Upload New File
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={addDownloadLink}
                                        className="mt-3 border-gray-700 text-gray-300 w-full hover:bg-gray-800"
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add Another Item
                                    </Button>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-800">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                                        onClick={closeApprovalModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700"
                                        onClick={handleApprove}
                                        loading={isApproving || isUploading}
                                        disabled={isApproving || isUploading}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve & Send
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout >
    );
}
