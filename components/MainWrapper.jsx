'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MainWrapper({ children, className }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <main
            id="main-content"
            className={cn(
                "min-h-screen",
                !isAdmin && "pt-16 lg:pt-20", // Only apply padding for non-admin routes
                className
            )}
        >
            {children}
        </main>
    );
}
