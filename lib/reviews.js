/**
 * Reviews Management Utilities
 * ============================
 * Handles product reviews, ratings, and moderation.
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// Helper to generate IDs
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Mock reviews for demo mode
const mockReviews = [
    {
        id: 'review-1',
        productId: 'mock-1',
        userId: 'user-1',
        userName: 'Alice Johnson',
        rating: 5,
        comment: 'Absolutely love this design! The layers were well organized.',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
    },
    {
        id: 'review-2',
        productId: 'mock-1',
        userId: 'user-2',
        userName: 'Mark Smith',
        rating: 4,
        comment: 'Great quality, but the font needed a specific download.',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
    },
    {
        id: 'review-3',
        productId: 'mock-2',
        userId: 'user-3',
        userName: 'Sarah Lee',
        rating: 5,
        comment: 'Perfect for my business cards. Highly recommended!',
        status: 'pending',
        createdAt: new Date().toISOString()
    }
];

/**
 * Add a new review
 * @param {Object} reviewData - { productId, userId, userName, rating, comment }
 * @returns {Promise<Object>} - Success status and new review
 */
export async function addReview(reviewData) {
    if (!isFirebaseConfigured) {
        const newReview = {
            id: `review-${Date.now()}`,
            ...reviewData,
            status: 'pending', // Default to pending moderation
            createdAt: new Date().toISOString()
        };
        mockReviews.unshift(newReview);
        return { success: true, review: newReview };
    }

    try {
        // basic validation
        if (!reviewData.productId || !reviewData.userId || !reviewData.rating) {
            return { success: false, error: 'Missing required fields' };
        }

        const reviewId = generateId();
        const review = {
            id: reviewId,
            productId: reviewData.productId,
            userId: reviewData.userId,
            userName: reviewData.userName || 'Anonymous',
            rating: Number(reviewData.rating),
            comment: reviewData.comment || '',
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'reviews', reviewId), review);

        return { success: true, review: { ...review, id: reviewId } };
    } catch (error) {
        console.error('Add review error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get approved reviews for a product
 * @param {string} productId 
 * @returns {Promise<Object>} - Reviews list and average rating
 */
export async function getProductReviews(productId) {
    if (!isFirebaseConfigured) {
        const reviews = mockReviews.filter(
            r => r.productId === productId && r.status === 'approved'
        );
        const average = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

        return { success: true, reviews, averageRating: average, totalReviews: reviews.length };
    }

    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('productId', '==', productId),
            where('status', '==', 'approved'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
        }));

        const average = reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

        return {
            success: true,
            reviews,
            averageRating: Number(average.toFixed(1)),
            totalReviews: reviews.length
        };
    } catch (error) {
        console.error('Get product reviews error:', error);
        return { success: false, error: error.message, reviews: [] };
    }
}

/**
 * Check if user has already reviewed a product
 * @param {string} userId 
 * @param {string} productId 
 * @returns {Promise<boolean>}
 */
export async function hasUserReviewedProduct(userId, productId) {
    if (!isFirebaseConfigured) {
        return mockReviews.some(r => r.userId === userId && r.productId === productId);
    }

    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
            reviewsRef,
            where('userId', '==', userId),
            where('productId', '==', productId)
        );

        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Check user review error:', error);
        return false;
    }
}

/**
 * Get all reviews (Admin)
 * @param {Object} options - { status: 'pending' | 'approved' | 'rejected' | 'all' }
 * @returns {Promise<Object>}
 */
export async function getAllReviews(options = { status: 'all' }) {
    if (!isFirebaseConfigured) {
        let reviews = [...mockReviews];
        if (options.status && options.status !== 'all') {
            reviews = reviews.filter(r => r.status === options.status);
        }
        // sort mock by date desc
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return { success: true, reviews };
    }

    try {
        const reviewsRef = collection(db, 'reviews');
        let q;

        if (options.status && options.status !== 'all') {
            q = query(
                reviewsRef,
                where('status', '==', options.status),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(reviewsRef, orderBy('createdAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const reviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
        }));

        return { success: true, reviews };
    } catch (error) {
        console.error('Get all reviews error:', error);
        // Fallback for missing index error
        if (error.code === 'failed-precondition') {
            return { success: false, error: 'Requires Firestore Index: reviews(status ASC, createdAt DESC). Please create it in Firebase Console.', requiresIndex: true };
        }
        return { success: false, error: error.message };
    }
}

/**
 * Update review status (Admin)
 * @param {string} reviewId 
 * @param {string} status - 'approved' | 'rejected'
 * @returns {Promise<Object>}
 */
export async function updateReviewStatus(reviewId, status) {
    if (!isFirebaseConfigured) {
        const index = mockReviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
            mockReviews[index].status = status;
            return { success: true };
        }
        return { success: false, error: 'Review not found' };
    }

    try {
        const reviewRef = doc(db, 'reviews', reviewId);
        await updateDoc(reviewRef, {
            status,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Update review status error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a review (Admin/User)
 * @param {string} reviewId 
 * @returns {Promise<Object>}
 */
export async function deleteReview(reviewId) {
    if (!isFirebaseConfigured) {
        const index = mockReviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
            mockReviews.splice(index, 1);
            return { success: true };
        }
        return { success: true }; // treat as success even if not found
    }

    try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        return { success: true };
    } catch (error) {
        console.error('Delete review error:', error);
        return { success: false, error: error.message };
    }
}
