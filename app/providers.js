'use client';

/**
 * Client Providers
 * ================
 * Client-side providers for context and state management.
 * Separated from root layout to keep server components working.
 */

import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/hooks/useAuth';

/**
 * ClientProviders Component
 * Wraps the application with all necessary providers
 */
export default function ClientProviders({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
    );
}
