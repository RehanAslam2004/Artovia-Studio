'use client';

/**
 * Cart Page
 * =========
 * Shopping cart page with item management and checkout navigation.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    ArrowRight,
    ArrowLeft,
    Trash2,
    ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CartItem, { CartSummary } from '@/components/CartItem';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const { cart, isLoaded, clearCart, getItemCount, getTotal } = useCart();
    const [isClearing, setIsClearing] = useState(false);

    const handleClearCart = () => {
        setIsClearing(true);
        setTimeout(() => {
            clearCart();
            setIsClearing(false);
        }, 300);
    };

    const itemCount = getItemCount();
    const total = getTotal();

    // Loading state
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-800" />
                        <div className="h-24 bg-gray-200 rounded dark:bg-gray-800" />
                        <div className="h-24 bg-gray-200 rounded dark:bg-gray-800" />
                    </div>
                </div>
            </div>
        );
    }

    // Empty cart state
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-md text-center"
                    >
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <ShoppingCart className="h-12 w-12 text-gray-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Your cart is empty
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Looks like you haven't added any items to your cart yet.
                        </p>

                        <Link href="/shop" className="mt-6 inline-block">
                            <Button size="lg" className="gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Start Shopping
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
            {/* Page Header */}
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                                Shopping Cart
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>

                        {cart.length > 0 && (
                            <Button
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                onClick={handleClearCart}
                                disabled={isClearing}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Cart
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Content */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="popLayout">
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>
                        </AnimatePresence>

                        {/* Continue Shopping */}
                        <div className="mt-6">
                            <Link href="/shop">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <CartSummary />

                        {/* Checkout Button */}
                        <Link href="/checkout" className="mt-6 block">
                            <Button size="lg" className="w-full group">
                                Proceed to Checkout
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>

                        {/* Payment Methods */}
                        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Accepted Payment Methods
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    JazzCash
                                </span>
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    EasyPaisa
                                </span>
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    Bank Transfer
                                </span>
                                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    NayaPay
                                </span>
                            </div>
                        </div>

                        {/* Secure Checkout Notice */}
                        <p className="mt-4 text-center text-xs text-gray-500">
                            🔒 Your information is safe and secure
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
