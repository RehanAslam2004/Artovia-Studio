'use client';

/**
 * useAuth Hook
 * ============
 * Custom hook for managing authentication state.
 * Provides user state, login/logout functions, and admin role verification.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { onAuthChange, signOutUser, isAdmin as checkIsAdmin } from '@/lib/auth';

// Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps the application to provide auth state globally
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Subscribe to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange(async (authUser) => {
            setUser(authUser);

            if (authUser) {
                // Check if user is admin
                const adminStatus = await checkIsAdmin();
                setIsAdmin(adminStatus);
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    /**
     * Sign out the current user
     */
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await signOutUser();
            setUser(null);
            setIsAdmin(false);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Refresh admin status
     * Call this after login to ensure admin status is updated
     */
    const refreshAdminStatus = useCallback(async () => {
        if (user) {
            const adminStatus = await checkIsAdmin();
            setIsAdmin(adminStatus);
        }
    }, [user]);

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = !!user;

    const value = {
        user,
        loading,
        isAdmin,
        isAuthenticated,
        logout,
        refreshAdminStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Hook
 * Access authentication state anywhere in the app
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default useAuth;
