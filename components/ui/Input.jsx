/**
 * Input Component
 * ===============
 * Styled form input component with consistent styling.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Input type
 * @param {string} props.error - Error message to display
 */
const Input = React.forwardRef(
    ({ className, type = 'text', error, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base md:text-sm text-gray-900 shadow-sm transition-all duration-200',
                        'placeholder:text-gray-400',
                        'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                        'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500',
                        'dark:focus:border-purple-400 dark:focus:ring-purple-400/20',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
