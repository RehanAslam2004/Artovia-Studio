'use client';

/**
 * Loader Component
 * ================
 * Animated loading spinner with brand colors.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Loader Component
 * @param {Object} props - Component props
 * @param {string} props.size - Loader size (sm, md, lg, xl)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.text - Optional loading text
 * @param {boolean} props.fullScreen - Show full screen overlay
 */
export default function Loader({
    size = 'md',
    className,
    text,
    fullScreen = false
}) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    const spinner = (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            <motion.div
                className={cn(
                    'rounded-full border-purple-200 border-t-purple-600',
                    sizeClasses[size]
                )}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
            {text && (
                <motion.p
                    className={cn('text-gray-600 dark:text-gray-400', textSizeClasses[size])}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-950/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {spinner}
            </motion.div>
        );
    }

    return spinner;
}

/**
 * Page Loader - Full page loading state
 */
export function PageLoader({ text = 'Loading...' }) {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <Loader size="lg" text={text} />
        </div>
    );
}

/**
 * Button Loader - Small loader for buttons
 */
export function ButtonLoader() {
    return <Loader size="sm" className="mr-2" />;
}

/**
 * Skeleton Loader - Content placeholder
 */
export function Skeleton({ className }) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
                className
            )}
        />
    );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <Skeleton className="mb-4 aspect-square w-full rounded-lg" />
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="mb-3 h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
        </div>
    );
}

/**
 * Products Grid Skeleton
 */
export function ProductsGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
