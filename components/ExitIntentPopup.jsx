'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

export default function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false); // Only show once per session
    const { cart } = useCart();

    useEffect(() => {
        // Only activate if cart has items
        if (cart.length === 0) return;

        const handleMouseLeave = (e) => {
            // Check if mouse left the window from the top (intent to close tab/switch)
            if (e.clientY <= 0 && !hasShown) {
                setIsVisible(true);
                setHasShown(true);
            }
        };

        const handleBeforeUnload = (e) => {
            // For mobile/refresh attempts (optional, can be annoying so kept minimal)
            // e.preventDefault();
            // e.returnValue = '';
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        // window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            // window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [cart, hasShown]);

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Popup Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
                    >
                        {/* Decorative Header */}
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-white">
                            <h3 className="text-lg font-bold">Wait! Don't Miss Out</h3>
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 rounded-full bg-white/20 p-1 text-white hover:bg-white/30"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        You have items in your cart
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Complete your order now and get your digital downloads instantly!
                                    </p>
                                </div>
                            </div>

                            {/* Cart Preview (First 2 items) */}
                            <div className="mb-6 space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                                {cart.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-md bg-white">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                                {item.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {cart.length > 2 && (
                                    <p className="text-xs text-center text-gray-500">
                                        and {cart.length - 2} more items...
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleClose}
                                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                                >
                                    Complete My Order
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <button
                                    onClick={handleClose}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    No thanks, I'll risk missing out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
