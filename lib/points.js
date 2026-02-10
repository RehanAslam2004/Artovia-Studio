/**
 * Loyalty Points Management
 * =========================
 * Handles all points operations: add, deduct, get balance, history, and rewards.
 * Points are stored in user documents and transactions are logged separately.
 */

import { db, isFirebaseConfigured } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    increment,
    serverTimestamp
} from 'firebase/firestore';

// Default reward tiers (can be overridden by admin settings)
const DEFAULT_REWARD_TIERS = [
    { id: 'tier1', pointsRequired: 250, discountPercent: 15, label: '15% OFF', enabled: true },
    { id: 'tier2', pointsRequired: 400, discountPercent: 25, label: '25% OFF', enabled: true },
];

/**
 * Get reward tiers from Firestore settings (or use defaults)
 * @returns {Promise<Array>} - Array of reward tiers
 */
export async function getRewardTiers() {
    if (!isFirebaseConfigured) {
        return DEFAULT_REWARD_TIERS;
    }

    try {
        const settingsRef = doc(db, 'settings', 'rewards');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists() && settingsSnap.data().tiers) {
            return settingsSnap.data().tiers.filter(t => t.enabled);
        }

        return DEFAULT_REWARD_TIERS;
    } catch (error) {
        console.error('Error fetching reward tiers:', error);
        return DEFAULT_REWARD_TIERS;
    }
}

/**
 * Save reward tiers to Firestore (Admin only)
 * @param {Array} tiers - Array of reward tier objects
 * @returns {Promise<Object>} - Success status
 */
export async function saveRewardTiers(tiers) {
    if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const settingsRef = doc(db, 'settings', 'rewards');
        await setDoc(settingsRef, {
            tiers,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error('Error saving reward tiers:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user's current points balance
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Current points balance
 */
export async function getUserPoints(userId) {
    if (!isFirebaseConfigured || !userId) {
        return 0;
    }

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data().points || 0;
        }

        return 0;
    } catch (error) {
        console.error('Error getting user points:', error);
        return 0;
    }
}

/**
 * Add points to a user's account
 * @param {string} userId - User ID
 * @param {string} userEmail - User email (for reference)
 * @param {number} amount - Points to add
 * @param {string} reason - Reason for adding points
 * @param {Object} metadata - Optional metadata (orderId, adminId, etc.)
 * @returns {Promise<Object>} - Success status with new balance
 */
export async function addPoints(userId, userEmail, amount, reason, metadata = {}) {
    if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase not configured' };
    }

    if (!userId || amount <= 0) {
        return { success: false, error: 'Invalid user ID or amount' };
    }

    try {
        const userRef = doc(db, 'users', userId);

        // Update user's points balance
        await updateDoc(userRef, {
            points: increment(amount),
            updatedAt: serverTimestamp()
        });

        // Log the transaction
        await addDoc(collection(db, 'points_transactions'), {
            userId,
            userEmail: userEmail || '',
            type: 'credit',
            amount,
            reason,
            orderId: metadata.orderId || null,
            adminId: metadata.adminId || null,
            note: metadata.note || null,
            createdAt: serverTimestamp()
        });

        // Get new balance
        const newBalance = await getUserPoints(userId);

        return { success: true, newBalance };
    } catch (error) {
        console.error('Error adding points:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Deduct points from a user's account
 * @param {string} userId - User ID
 * @param {string} userEmail - User email (for reference)
 * @param {number} amount - Points to deduct
 * @param {string} reason - Reason for deducting points
 * @param {Object} metadata - Optional metadata (orderId, adminId, etc.)
 * @returns {Promise<Object>} - Success status with new balance
 */
export async function deductPoints(userId, userEmail, amount, reason, metadata = {}) {
    if (!isFirebaseConfigured) {
        return { success: false, error: 'Firebase not configured' };
    }

    if (!userId || amount <= 0) {
        return { success: false, error: 'Invalid user ID or amount' };
    }

    // Check if user has enough points
    const currentBalance = await getUserPoints(userId);
    if (currentBalance < amount) {
        return { success: false, error: 'Insufficient points balance' };
    }

    try {
        const userRef = doc(db, 'users', userId);

        // Update user's points balance
        await updateDoc(userRef, {
            points: increment(-amount),
            updatedAt: serverTimestamp()
        });

        // Log the transaction
        await addDoc(collection(db, 'points_transactions'), {
            userId,
            userEmail: userEmail || '',
            type: 'debit',
            amount,
            reason,
            orderId: metadata.orderId || null,
            adminId: metadata.adminId || null,
            note: metadata.note || null,
            createdAt: serverTimestamp()
        });

        // Get new balance
        const newBalance = await getUserPoints(userId);

        return { success: true, newBalance };
    } catch (error) {
        console.error('Error deducting points:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get points transaction history for a user
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of transactions to return
 * @returns {Promise<Object>} - Array of transactions
 */
export async function getPointsHistory(userId, limitCount = 50) {
    if (!isFirebaseConfigured || !userId) {
        return { success: false, transactions: [] };
    }

    try {
        const q = query(
            collection(db, 'points_transactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
        }));

        return { success: true, transactions };
    } catch (error) {
        console.error('Error getting points history:', error);
        return { success: false, transactions: [], error: error.message };
    }
}

/**
 * Calculate discount based on points (using dynamic tiers)
 * @param {number} points - Points to redeem
 * @returns {Promise<Object>} - Discount info { discountPercent, pointsUsed, tier }
 */
export async function calculateDiscount(points) {
    const tiers = await getRewardTiers();

    // Sort tiers by points required (highest first)
    const sortedTiers = [...tiers].sort((a, b) => b.pointsRequired - a.pointsRequired);

    // Find the highest tier the user qualifies for
    for (const tier of sortedTiers) {
        if (points >= tier.pointsRequired) {
            return {
                discountPercent: tier.discountPercent,
                pointsUsed: tier.pointsRequired,
                tier: tier
            };
        }
    }

    return {
        discountPercent: 0,
        pointsUsed: 0,
        tier: null
    };
}

/**
 * Get available rewards for a user (which tiers they can/cannot unlock)
 * @param {number} userPoints - User's current points balance
 * @returns {Promise<Array>} - Array of rewards with unlock status
 */
export async function getAvailableRewards(userPoints) {
    const tiers = await getRewardTiers();

    return tiers.map(tier => ({
        ...tier,
        unlocked: userPoints >= tier.pointsRequired,
        pointsNeeded: Math.max(0, tier.pointsRequired - userPoints)
    }));
}

/**
 * Get all users with their points balance (Admin only)
 * @param {number} limitCount - Maximum number of users to return
 * @returns {Promise<Object>} - Array of users with points
 */
export async function getAllUsersWithPoints(limitCount = 100) {
    if (!isFirebaseConfigured) {
        return { success: false, users: [] };
    }

    try {
        // Fetch ALL users, not just those with points
        const q = query(
            collection(db, 'users'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            points: doc.data().points || 0
        }));

        // Sort by points descending (client-side)
        users.sort((a, b) => b.points - a.points);

        return { success: true, users };
    } catch (error) {
        console.error('Error getting users with points:', error);
        return { success: false, users: [], error: error.message };
    }
}

/**
 * Award signup bonus points to a new user
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} - Success status
 */
export async function awardSignupBonus(userId, userEmail) {
    const SIGNUP_BONUS = 100;

    return await addPoints(
        userId,
        userEmail,
        SIGNUP_BONUS,
        'signup_bonus',
        { note: 'Welcome bonus for new signup' }
    );
}

/**
 * Award purchase points after order approval
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @param {string} orderId - Order ID
 * @param {number} itemCount - Number of items in order
 * @returns {Promise<Object>} - Success status
 */
export async function awardPurchasePoints(userId, userEmail, orderId, itemCount) {
    const POINTS_PER_ITEM = 50;
    const totalPoints = POINTS_PER_ITEM * itemCount;

    return await addPoints(
        userId,
        userEmail,
        totalPoints,
        'order_approved',
        { orderId, note: `Earned ${totalPoints} points for ${itemCount} items` }
    );
}
