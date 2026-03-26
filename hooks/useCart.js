'use client';

/**
 * useCart Hook
 * ============
 * Custom hook for managing shopping cart state with localStorage persistence.
 * Provides cart operations: add, remove, update quantity, clear, and calculate totals.
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getFromStorage, setToStorage } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// Cart storage key
const CART_STORAGE_KEY = 'artovia_cart';

// Cart Context
const CartContext = createContext(null);

/**
 * Cart Provider Component
 * Wraps the application to provide cart state globally
 */
export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = getFromStorage(CART_STORAGE_KEY, []);
        setCart(savedCart);
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            setToStorage(CART_STORAGE_KEY, cart);
        }
    }, [cart, isLoaded]);

    // NEW: Sync with Firestore for logged-in users
    const { user } = useAuth(); // Helper to access user inside provider (might need refactoring if useAuth uses useCart)
    // NOTE: useAuth likely wraps CartProvider or vice versa. 
    // If CartProvider is inside AuthProvider, we can use useAuth().
    // Let's assume AuthProvider > CartProvider for now.

    useEffect(() => {
        async function syncCartToFirestore() {
            if (!user?.uid || !isLoaded) return;

            try {
                // Dynamic import to avoid circular dependencies or server-side issues
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('@/lib/firebase');

                const cartRef = doc(db, 'carts', user.uid);
                await setDoc(cartRef, {
                    items: cart,
                    userId: user.uid,
                    email: user.email,
                    updatedAt: serverTimestamp(),
                    itemCount: cart.length,
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                }, { merge: true });

            } catch (error) {
                // Silently handle permission errors (e.g., user not fully authenticated yet)
                if (error?.code !== 'permission-denied') {
                    console.warn('Cart sync issue:', error?.message);
                }
            }
        }

        // Debounce sync
        const timeoutId = setTimeout(syncCartToFirestore, 2000);
        return () => clearTimeout(timeoutId);
    }, [cart, user, isLoaded]);

    /**
     * Add item to cart
     * If item already exists, increment quantity
     */
    const addToCart = useCallback((product, quantity = 1) => {
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.id === product.id);

            if (existingIndex > -1) {
                // Item exists, update quantity
                const updatedCart = [...prevCart];
                updatedCart[existingIndex] = {
                    ...updatedCart[existingIndex],
                    quantity: updatedCart[existingIndex].quantity + quantity
                };
                return updatedCart;
            }

            // New item, add to cart
            return [...prevCart, {
                id: product.id,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice || null,
                imageUrl: product.imageUrl,
                category: product.category,
                quantity: quantity
            }];
        });
    }, []);

    /**
     * Remove item from cart
     */
    const removeFromCart = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    /**
     * Update item quantity
     */
    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    }, [removeFromCart]);

    /**
     * Increment item quantity by 1
     */
    const incrementQuantity = useCallback((productId) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }, []);

    /**
     * Decrement item quantity by 1
     */
    const decrementQuantity = useCallback((productId) => {
        setCart(prevCart => {
            const item = prevCart.find(i => i.id === productId);
            if (item && item.quantity <= 1) {
                return prevCart.filter(i => i.id !== productId);
            }
            return prevCart.map(i =>
                i.id === productId
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            );
        });
    }, []);

    /**
     * Clear all items from cart
     */
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    /**
     * Check if item is in cart
     */
    const isInCart = useCallback((productId) => {
        return cart.some(item => item.id === productId);
    }, [cart]);

    /**
     * Get item from cart
     */
    const getCartItem = useCallback((productId) => {
        return cart.find(item => item.id === productId);
    }, [cart]);

    /**
     * Calculate cart subtotal (after product discounts)
     */
    const getSubtotal = useCallback(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);

    /**
     * Calculate original cart subtotal (before product discounts)
     */
    const getOriginalSubtotal = useCallback(() => {
        return cart.reduce((total, item) => total + ((item.compareAtPrice || item.price) * item.quantity), 0);
    }, [cart]);

    /**
     * Calculate total cart items count
     */
    const getItemCount = useCallback(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    /**
     * Calculate cart total (with any discounts/taxes - currently same as subtotal)
     */
    const getTotal = useCallback(() => {
        // Add tax/discount calculations here if needed
        return getSubtotal();
    }, [getSubtotal]);

    const value = {
        cart,
        isLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        isInCart,
        getCartItem,
        getSubtotal,
        getOriginalSubtotal,
        getItemCount,
        getTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

/**
 * useCart Hook
 * Access cart state and operations anywhere in the app
 */
export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
}

export default useCart;
