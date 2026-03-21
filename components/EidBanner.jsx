'use client';

/**
 * Eid Mubarak Banner
 * ==================
 * Festive animated banner with crescent moon, stars, and Islamic design elements.
 * Dismissible per session. Gold/emerald/dark theme.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles } from 'lucide-react';

const DISMISS_KEY = 'eid_banner_dismissed';

export default function EidBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const dismissed = sessionStorage.getItem(DISMISS_KEY);
        if (!dismissed) setVisible(true);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.setItem(DISMISS_KEY, 'true');
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="relative overflow-hidden"
                >
                    <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 overflow-hidden">
                        {/* Geometric Pattern Overlay */}
                        <div className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        />

                        {/* Animated Gold Particles */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute h-1 w-1 rounded-full bg-yellow-400/40"
                                    style={{
                                        left: `${10 + i * 12}%`,
                                        top: `${20 + (i % 3) * 25}%`,
                                    }}
                                    animate={{
                                        y: [0, -15, 0],
                                        opacity: [0.2, 0.6, 0.2],
                                        scale: [1, 1.5, 1],
                                    }}
                                    transition={{
                                        duration: 2 + i * 0.3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.4,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Content */}
                        <div className="relative flex items-center justify-center gap-3 sm:gap-4 px-4 py-3 sm:py-3.5">
                            {/* Left Crescent */}
                            <motion.span
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-xl sm:text-2xl hidden sm:inline-block"
                            >
                                🌙
                            </motion.span>

                            {/* Main Text */}
                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-center">
                                <span className="text-yellow-300 font-bold text-sm sm:text-base tracking-wide">
                                    Eid Mubarak!
                                </span>
                                <span className="text-emerald-100/90 text-xs sm:text-sm">
                                    Up to <span className="text-yellow-300 font-bold">30% OFF</span> on all designs
                                </span>
                                <span className="text-yellow-400/60 hidden sm:inline">✦</span>
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-900 bg-yellow-400 hover:bg-yellow-300 px-3 py-1 rounded-full transition-colors shadow-lg shadow-yellow-400/20"
                                >
                                    <Sparkles className="h-3 w-3" />
                                    Shop Now
                                </Link>
                            </div>

                            {/* Right Star */}
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-xl sm:text-2xl hidden sm:inline-block"
                            >
                                ⭐
                            </motion.span>

                            {/* Close Button */}
                            <button
                                onClick={handleDismiss}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-emerald-300/60 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Bottom gold line */}
                        <div className="h-[2px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
