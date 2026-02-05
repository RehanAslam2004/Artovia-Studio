/**
 * Badge Component
 * ===============
 * Small badge/tag component for labels and status indicators.
 */

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default:
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                secondary:
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                success:
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                warning:
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                destructive:
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                outline:
                    'border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

/**
 * Badge Component
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Badge variant
 */
const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
    return (
        <span
            ref={ref}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
