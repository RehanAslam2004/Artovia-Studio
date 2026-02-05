'use client';

/**
 * Download Page
 * =============
 * Customer-facing page to download their purchased files.
 * Accessible via /download/[orderId] with order ID and email verification.
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Download,
    CheckCircle,
    Package,
    ArrowLeft,
    Loader2,
    AlertCircle,
    FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getOrderById } from '@/lib/orders';

export default function DownloadPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.orderId;
    const emailParam = searchParams.get('email');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingIndex, setDownloadingIndex] = useState(null);

    useEffect(() => {
        async function loadOrder() {
            if (!orderId) {
                setError('Invalid download link');
                setLoading(false);
                return;
            }

            try {
                const result = await getOrderById(orderId);

                if (!result.success || !result.order) {
                    setError('Order not found');
                    setLoading(false);
                    return;
                }

                const orderData = result.order;

                // Check if order is approved
                if (orderData.status !== 'approved' && orderData.status !== 'completed') {
                    setError('This order is not yet approved for download');
                    setLoading(false);
                    return;
                }

                // Check if download links exist
                if (!orderData.downloadLinks || orderData.downloadLinks.length === 0) {
                    setError('No download links available yet');
                    setLoading(false);
                    return;
                }

                setOrder(orderData);
            } catch (err) {
                console.error('Error loading order:', err);
                setError('Failed to load download page');
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [orderId]);

    // Convert Cloudinary URL to force download
    const getDownloadUrl = (url) => {
        if (!url) return '#';

        // If it's a Cloudinary URL, add fl_attachment to force download
        if (url.includes('cloudinary.com') && url.includes('/upload/')) {
            // Check if there are existing transformations
            const parts = url.split('/upload/');
            if (parts.length === 2) {
                // Check if transformations already exist
                const secondPart = parts[1];
                if (secondPart.startsWith('v') || secondPart.match(/^[a-zA-Z]/)) {
                    // No transformations, add fl_attachment
                    return `${parts[0]}/upload/fl_attachment/${parts[1]}`;
                } else {
                    // Has transformations, insert fl_attachment
                    return `${parts[0]}/upload/fl_attachment,${parts[1]}`;
                }
            }
        }

        return url;
    };

    // Handle download click - uses server API to proxy download
    const handleDownload = (link, index) => {
        setDownloadingIndex(index);

        // Use our API to proxy the download with proper headers
        const downloadUrl = `/api/download?url=${encodeURIComponent(link.url)}&name=${encodeURIComponent(link.name || 'download')}`;

        // Navigate to download URL directly - browser will download the file
        window.location.href = downloadUrl;

        setTimeout(() => setDownloadingIndex(null), 1500);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading your downloads...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Download Unavailable
                    </h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/">
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Your Downloads are Ready!
                    </h1>
                    <p className="text-gray-600">
                        Order #{orderId.slice(0, 8).toUpperCase()} • Thank you for your purchase
                    </p>
                </motion.div>

                {/* Download Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-pink-500 to-pink-400 px-6 py-4">
                        <div className="flex items-center gap-3 text-white">
                            <Package className="h-6 w-6" />
                            <span className="font-semibold">
                                {order.downloadLinks.length} File{order.downloadLinks.length > 1 ? 's' : ''} Available
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {order.downloadLinks.map((link, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * (index + 1) }}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                                        <FileDown className="h-6 w-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {link.name || `File ${index + 1}`}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Click to download
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleDownload(link, index)}
                                    disabled={downloadingIndex === index}
                                    className="min-w-[120px]"
                                >
                                    {downloadingIndex === index ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Downloading
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Download All Button */}
                    {order.downloadLinks.length > 1 && (
                        <div className="border-t border-gray-100 p-6">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    order.downloadLinks.forEach((link, index) => {
                                        setTimeout(() => handleDownload(link, -1), index * 500);
                                    });
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download All Files
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Help Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center text-sm text-gray-500"
                >
                    <p>
                        Having trouble downloading? Contact us at{' '}
                        <a
                            href="mailto:artovia.business@gmail.com"
                            className="text-pink-500 hover:underline"
                        >
                            artovia.business@gmail.com
                        </a>
                    </p>
                </motion.div>

                {/* Back to Shop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 text-center"
                >
                    <Link href="/shop">
                        <Button variant="ghost" className="text-pink-500">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
