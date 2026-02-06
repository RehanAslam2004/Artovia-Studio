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
        const orderId = uuidv4();
        const order = {
            id: orderId,
            userId: orderData.userId || null,
            userEmail: orderData.userEmail,
            userName: orderData.userName,
            userPhone: orderData.userPhone || null,
            items: orderData.items.map(item => ({
                productId: item.id,
                name: item.name,
                productImage: item.imageUrl,
                price: item.price,
                canvaLink: item.canvaLink || null, // Snapshot the Canva link
                quantity: item.quantity || 1
            })),
            subtotal: orderData.subtotal,
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
    if (!isFirebaseConfigured) {
        const orders = mockOrders.filter(o => o.userId === userId);
        return { success: true, orders };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(
            ordersCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

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
    if (!isFirebaseConfigured) {
        const orders = mockOrders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase());
        return { success: true, orders };
    }

    try {
        const ordersCollection = collection(db, 'orders');
        const q = query(
            ordersCollection,
            where('userEmail', '==', email.toLowerCase()),
            orderBy('createdAt', 'desc')
        );

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

        await updateDoc(docRef, {
            status: 'approved',
            downloadLinks: downloadLinks,
            approvedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return { success: true };
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
