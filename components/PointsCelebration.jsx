'use client';

/**
 * Points Celebration Popup
 * ========================
 * Animated popup that celebrates when a user earns loyalty points.
 * Shows sparkle animation, points earned, current balance, and next reward tier.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PointsCelebration({ 
    isOpen, 
    onClose, 
    pointsEarned = 0, 
    newBalance = 0, 
    reason = 'signup', // 'signup' | 'purchase'
    autoDismiss = true,
    autoDismissDelay = 6000 
}) {
    const [visible, setVisible] = useState(isOpen);

    useEffect(() => {
        setVisible(isOpen);
    }, [isOpen]);

    // Auto-dismiss
    useEffect(() => {
        if (visible && autoDismiss) {
            const timer = setTimeout(() => {
                setVisible(false);
                onClose?.();
            }, autoDismissDelay);
            return () => clearTimeout(timer);
        }
    }, [visible, autoDismiss, autoDismissDelay, onClose]);

    const handleClose = () => {
        setVisible(false);
        onClose?.();
    };

    const messages = {
        signup: {
            title: 'Welcome to Artovia Studio! 🎉',
            subtitle: `You just earned ${pointsEarned} bonus points for signing up!`,
            cta: 'Start shopping to earn more points with every purchase.',
        },
        purchase: {
            title: 'Points Incoming! 🎉',
            subtitle: `You'll earn ${pointsEarned} points when your order is approved!`,
            cta: 'Keep shopping to unlock exclusive discounts.',
        },
    };

    const msg = messages[reason] || messages.signup;

    // Next reward tier info
    const nextTier = newBalance < 250 
        ? { name: '15% OFF', points: 250, remaining: 250 - newBalance }
        : newBalance < 400
        ? { name: '25% OFF', points: 400, remaining: 400 - newBalance }
        : null;

    const progress = nextTier 
        ? Math.min(100, ((newBalance) / nextTier.points) * 100)
        : 100;

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-gray-200 dark:border-gray-800">
                            
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>

                            {/* Gradient Header */}
                            <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 px-6 pt-8 pb-10 text-center overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute top-0 left-0 h-20 w-20 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute bottom-0 right-0 h-16 w-16 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />
                                <div className="absolute top-1/2 right-1/4 h-8 w-8 rounded-full bg-yellow-300/20" />

                                {/* Icon */}
                                <motion.div
                                    initial={{ rotate: -15, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                    className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4 ring-2 ring-white/30"
                                >
                                    <Sparkles className="h-8 w-8 text-white" />
                                </motion.div>

                                {/* Points Amount */}
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="text-5xl font-extrabold text-white tracking-tight mb-1">
                                        +{pointsEarned}
                                    </div>
                                    <div className="text-pink-100 text-sm font-medium uppercase tracking-wider">
                                        Points Earned
                                    </div>
                                </motion.div>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-6 space-y-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {msg.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {msg.subtitle}
                                    </p>
                                </div>

                                {/* Balance Card */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                            <Star className="h-5 w-5 text-pink-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Your Balance</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">{newBalance} pts</p>
                                        </div>
                                    </div>
                                    <Link href="/account" onClick={handleClose}>
                                        <div className="text-xs text-pink-500 hover:text-pink-600 font-semibold flex items-center gap-0.5">
                                            View <ChevronRight className="h-3 w-3" />
                                        </div>
                                    </Link>
                                </div>

                                {/* Next Reward Progress */}
                                {nextTier && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Gift className="h-3 w-3" /> Next Reward: {nextTier.name}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                                                {nextTier.remaining} pts to go
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* CTA Text */}
                                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                                    {msg.cta}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
