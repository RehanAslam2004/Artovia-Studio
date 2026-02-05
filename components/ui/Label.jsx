/**
 * Label Component
 * ===============
 * Styled form label component for inputs.
 */

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * Label Component
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.required - Show required asterisk
 */
const Label = React.forwardRef(
    ({ className, required, children, ...props }, ref) => (
        <LabelPrimitive.Root
            ref={ref}
            className={cn(
                'text-sm font-medium text-gray-700 dark:text-gray-300',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                className
            )}
            {...props}
        >
            {children}
            {required && <span className="ml-1 text-red-500">*</span>}
        </LabelPrimitive.Root>
    )
);

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
