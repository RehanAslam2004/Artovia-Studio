/**
 * Orders Management Utilities
 * ===========================
 * This file provides functions for managing orders including creation,
 * retrieval, status updates, and payment approval.
 * 
 * When Firebase is not configured, returns mock data for development preview.
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Mock orders for demo mode
const mockOrders = [
    {
        id: 'mock-order-1',
        userId: 'demo-user',
        userEmail: 'demo@example.com',
        userName: 'Demo User',
        userPhone: '+923001234567',
        items: [
            {
                productId: 'mock-1',
                name: 'Elegant Wedding Card Design',
                productImage: '/images/placeholder-product.jpg',
                price: 2500,
                quantity: 1
            }
        ],
        subtotal: 2500,
        total: 2500,
        status: 'pending',
        paymentMethod: 'jazzcash',
        transactionId: 'DEMO123456',
        downloadLinks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} - Created order with success status
 */
export async function createOrder(orderData) {
    if (!isFirebaseConfigured) {
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase to create orders.'
        };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        // Fetch each product's details from Firestore to snapshot links
        const itemsWithLinks = await Promise.all(orderData.items.map(async (item) => {
            let canvaLink = item.canvaLink || null;
            let downloadUrl = item.downloadUrl || null;
            let bookmarkPdfUrl = item.bookmarkPdfUrl || null;
            let bookmarkPdfPath = item.bookmarkPdfPath || null;

            try {
                const productRef = doc(db, 'products', item.id);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                    const prodData = productSnap.data();
                    canvaLink = prodData.canvaLink || canvaLink;
                    downloadUrl = prodData.downloadUrl || downloadUrl;
                    bookmarkPdfUrl = prodData.bookmarkPdfUrl || bookmarkPdfUrl;
                    bookmarkPdfPath = prodData.bookmarkPdfPath || bookmarkPdfPath;
                }
            } catch (err) {
                console.error(`Failed to fetch product details for ${item.id} during order creation:`, err);
            }

            return {
                productId: item.id,
                name: item.name,
                productImage: item.imageUrl,
                price: item.price,
                canvaLink,
                downloadUrl,
                bookmarkPdfUrl,
                bookmarkPdfPath,
                quantity: item.quantity || 1
            };
        }));

        const orderId = uuidv4();
        const order = {
            id: orderId,
            userId: orderData.userId || null,
            userEmail: orderData.userEmail,
            userName: orderData.userName,
            userPhone: orderData.userPhone || null,
            items: itemsWithLinks,
            subtotal: orderData.subtotal,
            productDiscount: orderData.productDiscount || 0,
            rewardDiscount: orderData.rewardDiscount || 0,
            discount: orderData.discount || 0,
            discountPercent: orderData.discountPercent || 0,
            total: orderData.total,
            status: 'pending',
            paymentMethod: orderData.paymentMethod,
            transactionId: orderData.transactionId || null,
            paymentProof: orderData.paymentProof || null,
            downloadLinks: [],
            notes: orderData.notes || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            approvedAt: null,
            completedAt: null
        };

        await setDoc(doc(db, 'orders', orderId), order);

        // Send confirmation email to customer and notification to admin (Non-blocking)
        fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'order_confirmation',
                order: { ...order, id: orderId }
            })
        }).catch(err => console.error('Email send error (background):', err));

        return {
            success: true,
            order: { ...order, id: orderId }
        };
    } catch (error) {
        console.error('Create order error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create order'
        };
    }
}

/**
 * Get all orders (Admin only)
 * @param {string} status - Optional status filter
 * @returns {Promise<Object>} - Array of orders
 */
export async function getAllOrders(status = null) {
    if (!isFirebaseConfigured) {
        let orders = [...mockOrders];
        if (status) {
            orders = orders.filter(o => o.status === status);
        }
        return { success: true, orders };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        let q = query(ordersCollection, orderBy('createdAt', 'desc'));

        if (status) {
            q = query(
                ordersCollection,
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
                approvedAt: data.approvedAt?.toDate?.()?.toISOString() || null,
                completedAt: data.completedAt?.toDate?.()?.toISOString() || null
            };
        });

        return { success: true, orders };
    } catch (error) {
        console.error('Get all orders error:', error);
        return { success: false, error: error.message, orders: [] };
    }
}

/**
 * Get orders for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Array of user's orders
 */
export async function getOrdersByUser(userId) {
    console.log('Fetching orders for user:', userId);
    if (!isFirebaseConfigured) {
        console.log('Firebase not configured, returning mock orders');
        const orders = mockOrders.filter(o => o.userId === userId);
        return { success: true, orders };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        // Remove orderBy to avoid index requirement
        const q = query(
            ordersCollection,
            where('userId', '==', userId)
        );

        console.log('Executing Firestore query for user orders...');
        const snapshot = await getDocs(q);
        console.log('Firestore snapshot size:', snapshot.size);

        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
                approvedAt: data.approvedAt?.toDate?.()?.toISOString() || null,
                completedAt: data.completedAt?.toDate?.()?.toISOString() || null
            };
        });

        // Sort in memory
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Parsed and sorted orders:', orders.length);

        return { success: true, orders };
    } catch (error) {
        console.error('Get user orders error:', error);
        return { success: false, error: error.message, orders: [] };
    }
}

/**
 * Get orders by email (for guest checkout)
 * @param {string} email - User email
 * @returns {Promise<Object>} - Array of orders
 */
export async function getOrdersByEmail(email) {
    console.log('Fetching orders for email:', email);
    if (!isFirebaseConfigured) {
        const orders = mockOrders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase());
        return { success: true, orders };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        // Remove orderBy to avoid index requirement
        const q = query(
            ordersCollection,
            where('userEmail', '==', email.toLowerCase())
        );

        console.log('Executing Firestore query for user email...');
        const snapshot = await getDocs(q);
        console.log('Firestore snapshot size:', snapshot.size);

        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
                approvedAt: data.approvedAt?.toDate?.()?.toISOString() || null,
                completedAt: data.completedAt?.toDate?.()?.toISOString() || null
            };
        });

        // Sort in memory
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        console.log('Parsed and sorted orders:', orders.length);

        return { success: true, orders };
    } catch (error) {
        console.error('Get orders by email error:', error);
        return { success: false, error: error.message, orders: [] };
    }
}

/**
 * Get a single order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Order data
 */
export async function getOrderById(orderId) {
    if (!isFirebaseConfigured) {
        const order = mockOrders.find(o => o.id === orderId);
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        return { success: true, order };
    }

    try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'Order not found' };
        }

        const data = docSnap.data();
        return {
            success: true,
            order: {
                ...data,
                id: docSnap.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
                approvedAt: data.approvedAt?.toDate?.()?.toISOString() || null,
                completedAt: data.completedAt?.toDate?.()?.toISOString() || null
            }
        };
    } catch (error) {
        console.error('Get order by ID error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Success status
 */
export async function updateOrderStatus(orderId, status) {
    if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const docRef = doc(db, 'orders', orderId);
        const updateData = {
            status,
            updatedAt: serverTimestamp()
        };

        if (status === 'approved') {
            updateData.approvedAt = serverTimestamp();
        } else if (status === 'completed') {
            updateData.completedAt = serverTimestamp();
        }

        await updateDoc(docRef, updateData);

        return { success: true };
    } catch (error) {
        console.error('Update order status error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Approve order and provide download links
 * @param {string} orderId - Order ID
 * @param {Array} downloadLinks - Array of download link objects
 * @returns {Promise<Object>} - Success status
 */
export async function approveOrder(orderId, downloadLinks = []) {
    if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const docRef = doc(db, 'orders', orderId);

        // Fetch order to get user info and item count
        const orderSnap = await getDoc(docRef);
        if (!orderSnap.exists()) {
            return { success: false, error: 'Order not found' };
        }

        const orderData = orderSnap.data();
        const itemCount = orderData.items?.length || 0;
        const pointsEarned = itemCount * 50; // 50 points per item

        await updateDoc(docRef, {
            status: 'approved',
            downloadLinks: downloadLinks,
            pointsEarned: pointsEarned,
            approvedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Award loyalty points to registered users
        if (orderData.userId && pointsEarned > 0) {
            try {
                const { awardPurchasePoints } = await import('./points');
                await awardPurchasePoints(
                    orderData.userId,
                    orderData.userEmail,
                    orderId,
                    itemCount
                );
            } catch (err) {
                console.error('Failed to award purchase points:', err);
                // Don't fail the approval if points fail
            }
        }

        return { success: true, pointsEarned };
    } catch (error) {
        console.error('Approve order error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 * @returns {Promise<Object>} - Success status
 */
export async function cancelOrder(orderId, reason = null) {
    if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const docRef = doc(db, 'orders', orderId);

        await updateDoc(docRef, {
            status: 'cancelled',
            cancellationReason: reason,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Cancel order error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get order statistics (Admin)
 * @returns {Promise<Object>} - Order statistics
 */
export async function getOrderStats() {
    if (!isFirebaseConfigured) {
        return {
            success: true,
            stats: {
                total: mockOrders.length,
                pending: mockOrders.filter(o => o.status === 'pending').length,
                approved: mockOrders.filter(o => o.status === 'approved').length,
                completed: mockOrders.filter(o => o.status === 'completed').length,
                totalRevenue: mockOrders
                    .filter(o => ['approved', 'completed'].includes(o.status))
                    .reduce((sum, o) => sum + o.total, 0)
            }
        };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        const snapshot = await getDocs(ordersCollection);

        let totalOrders = 0;
        let pendingOrders = 0;
        let approvedOrders = 0;
        let completedOrders = 0;
        let totalRevenue = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            totalOrders++;

            switch (data.status) {
                case 'pending':
                    pendingOrders++;
                    break;
                case 'approved':
                    approvedOrders++;
                    totalRevenue += data.total || 0;
                    break;
                case 'completed':
                    completedOrders++;
                    totalRevenue += data.total || 0;
                    break;
            }
        });

        return {
            success: true,
            stats: {
                total: totalOrders,
                pending: pendingOrders,
                approved: approvedOrders,
                completed: completedOrders,
                totalRevenue
            }
        };
    } catch (error) {
        console.error('Get order stats error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get analytics data for dashboard
 * @returns {Promise<Object>} - Analytics data for charts
 */
export async function getAnalyticsData() {
    if (!isFirebaseConfigured) {
        // Mock data for demo
        return {
            success: true,
            revenueData: [
                { name: 'Jan', value: 12000 },
                { name: 'Feb', value: 19000 },
                { name: 'Mar', value: 15000 },
                { name: 'Apr', value: 22000 },
                { name: 'May', value: 28000 },
                { name: 'Jun', value: 25000 },
            ],
            topProducts: [
                { name: 'Wedding Card', value: 45 },
                { name: 'Business Card', value: 32 },
                { name: 'Logo Design', value: 28 },
                { name: 'Social Post', value: 15 },
            ],
            statusDistribution: [
                { name: 'Pending', value: 5, color: '#f59e0b' },
                { name: 'Approved', value: 12, color: '#3b82f6' },
                { name: 'Completed', value: 25, color: '#10b981' },
                { name: 'Cancelled', value: 2, color: '#ef4444' },
            ]
        };
    }

    try {
        const { orders } = await getAllOrders();

        if (!orders) return { success: false, error: 'Failed to fetch orders' };

        // 1. Calculate Monthly Revenue (Last 6 months)
        const revenueMap = {};
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = d.toLocaleString('default', { month: 'short' });
            months.push(monthName);
            revenueMap[monthName] = 0;
        }

        // 2. Calculate Top Products
        const productMap = {};

        // 3. Status Distribution
        const statusMap = {
            'pending': 0,
            'approved': 0,
            'completed': 0,
            'cancelled': 0
        };

        orders.forEach(order => {
            // Revenue
            if (['approved', 'completed'].includes(order.status)) {
                // Ensure valid date
                const date = order.createdAt ? new Date(order.createdAt) : new Date();
                const monthName = date.toLocaleString('default', { month: 'short' });
                if (revenueMap[monthName] !== undefined) {
                    revenueMap[monthName] += order.total || 0;
                }
            }

            // Products
            if (['approved', 'completed', 'pending'].includes(order.status)) {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(item => {
                        const productName = item.name || 'Unknown Product';
                        productMap[productName] = (productMap[productName] || 0) + (item.quantity || 1);
                    });
                }
            }

            // Status
            if (statusMap[order.status] !== undefined) {
                statusMap[order.status]++;
            }
        });

        // Format Revenue Data
        const revenueData = months.map(month => ({
            name: month,
            value: revenueMap[month]
        }));

        // Format Top Products (Top 5)
        const topProducts = Object.entries(productMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // Format Status Distribution
        const statusDistribution = [
            { name: 'Pending', value: statusMap.pending, color: '#f59e0b' },
            { name: 'Approved', value: statusMap.approved, color: '#3b82f6' },
            { name: 'Completed', value: statusMap.completed, color: '#10b981' },
            { name: 'Cancelled', value: statusMap.cancelled, color: '#ef4444' },
        ].filter(item => item.value > 0);

        return {
            success: true,
            revenueData,
            topProducts,
            statusDistribution
        };

    } catch (error) {
        console.error('Get analytics error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get count of pending orders (For Admin Badges)
 * @returns {Promise<number>} - Count of pending orders
 */
export async function getPendingOrdersCount() {
    if (!isFirebaseConfigured) {
        return mockOrders.filter(o => o.status === 'pending').length;
    }

    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Get pending orders count error:', error);
        return 0;
    }
}

/**
 * Get count of orders requiring user action (e.g. Approved/Downloads ready)
 * @param {string} userId 
 * @returns {Promise<number>}
 */
export async function getUserActionRequiredCount(userId) {
    if (!userId) return 0;
    if (!isFirebaseConfigured) {
        // Mock: count approved orders (ready for download)
        return mockOrders.filter(o => o.userId === userId && o.status === 'approved').length;
    }

    try {
        const ordersCollection = collection(db, 'orders');
        // Action required: 'approved' (Download needed) or maybe 'payment_failed' if we had it.
        // For now, let's show badge for 'approved' orders as they have downloads waiting.
        const q = query(
            ordersCollection,
            where('userId', '==', userId),
            where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Get user action count error:', error);
        return 0;
    }
}
