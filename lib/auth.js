/**
 * Authentication Utilities
 * ========================
 * This file provides authentication functions for both admin and customer users.
 * It handles sign-in, sign-up, sign-out, and user role verification.
 * 
 * When Firebase is not configured, auth functions return demo mode responses.
 */

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import Cookies from 'js-cookie';

// Admin emails (default + environment variable)
const defaultAdminEmails = ['admin@artoviastudio.com', 'artovia.business@gmail.com', 'ayeshakhann.1519@gmail.com'];
const envAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
    : [];
const ADMIN_EMAILS = Array.from(new Set([...defaultAdminEmails, ...envAdminEmails]))
    .filter(Boolean);

/**
 * Check if an email is an admin email
 * @param {string} email - Email to check
 * @returns {boolean} - True if admin email
 */
function isAdminEmail(email) {
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Helper to set auth cookie
const setAuthCookie = (role) => {
    Cookies.set('user_role', role, { expires: 7, sameSite: 'strict', secure: window.location.protocol === 'https:' });
};

// Helper to remove auth cookie
const removeAuthCookie = () => {
    Cookies.remove('user_role');
};

/**
 * Sign in as admin
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<Object>} - User object with success status
 */
export async function signInAdmin(email, password) {
    if (!isFirebaseConfigured) {
        setAuthCookie('admin'); // Demo mode
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase for authentication.'
        };
    }

    try {
        // First, verify this is an admin email
        if (!isAdminEmail(email)) {
            throw new Error('This email is not authorized for admin access.');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user document exists and has admin role
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
            // Update user role to admin if email matches
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: user.displayName || 'Admin',
                role: 'admin',
                updatedAt: serverTimestamp()
            }, { merge: true });
        }

        setAuthCookie('admin'); // Set admin cookie
        return { success: true, user };
    } catch (error) {
        console.error('Admin sign in error:', error);
        return {
            success: false,
            error: error.message || 'Failed to sign in as admin'
        };
    }
}

/**
 * Sign up a new customer
 * @param {string} email - Customer email
 * @param {string} password - Customer password
 * @param {string} name - Customer name
 * @returns {Promise<Object>} - User object with success status
 */
export async function signUpCustomer(email, password, name) {
    if (!isFirebaseConfigured) {
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase for authentication.'
        };
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, { displayName: name });

        // Create user document in Firestore with signup bonus
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: name,
            role: 'customer',
            points: 100, // Signup bonus
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Log signup bonus transaction
        try {
            const { addDoc, collection } = await import('firebase/firestore');
            await addDoc(collection(db, 'points_transactions'), {
                userId: user.uid,
                userEmail: user.email,
                type: 'credit',
                amount: 100,
                reason: 'signup_bonus',
                note: 'Welcome bonus for new signup',
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error('Failed to log signup bonus:', err);
        }

        setAuthCookie('customer'); // Set customer cookie

        // Send Welcome Email
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'welcome',
                    user: {
                        email: user.email,
                        displayName: name
                    }
                })
            });
        } catch (err) {
            console.error('Failed to send welcome email:', err);
        }

        return { success: true, user };
    } catch (error) {
        console.error('Customer sign up error:', error);

        // Handle specific error codes
        let errorMessage = 'Failed to create account';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Sign in an existing customer
 * @param {string} email - Customer email
 * @param {string} password - Customer password
 * @returns {Promise<Object>} - User object with success status
 */
export async function signInCustomer(email, password) {
    if (!isFirebaseConfigured) {
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase for authentication.'
        };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setAuthCookie('customer'); // Set customer cookie
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Customer sign in error:', error);

        // Handle specific error codes
        let errorMessage = 'Failed to sign in';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }

        return { success: false, error: errorMessage };
    }
}

/**
 * Sign out the current user
 * @returns {Promise<Object>} - Success status
 */
export async function signOutUser() {
    if (!isFirebaseConfigured || !auth) {
        removeAuthCookie();
        return { success: true };
    }

    try {
        await signOut(auth);
        removeAuthCookie(); // Remove cookie
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get the current authenticated user
 * @returns {Object|null} - Current user or null
 */
export function getCurrentUser() {
    if (!isFirebaseConfigured || !auth) {
        return null;
    }
    return auth.currentUser;
}

/**
 * Check if the current user is an admin
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function isAdmin() {
    if (!isFirebaseConfigured || !auth) {
        return false;
    }

    const user = auth.currentUser;
    if (!user) return false;

    try {
        // First check if email matches admin emails
        if (isAdminEmail(user.email)) {
            return true;
        }

        // Then check Firestore for admin role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
}

/**
 * Get user data from Firestore
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} - User data or null
 */
export async function getUserData(uid) {
    if (!isFirebaseConfigured || !db) {
        return null;
    }

    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Get user data error:', error);
        return null;
    }
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function receiving user object
 * @returns {Function} - Unsubscribe function
 */
export function onAuthChange(callback) {
    if (!isFirebaseConfigured || !auth) {
        // Return a no-op unsubscribe function
        removeAuthCookie();
        callback(null);
        return () => { };
    }

    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Get additional user data from Firestore
            const userData = await getUserData(user.uid);
            const role = userData?.role || (isAdminEmail(user.email) ? 'admin' : 'customer');
            const userWithRole = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: role,
                name: userData?.name || user.displayName
            };

            // Set auth cookie whenever user state changes
            setAuthCookie(role);

            callback(userWithRole);
        } else {
            // Remove cookie when user logs out
            removeAuthCookie();
            callback(null);
        }
    });
}
