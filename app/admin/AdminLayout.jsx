'use client';

/**
 * Admin Layout Component
 * ======================
 * Shared layout for admin pages with compact sidebar navigation.
 */

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    BarChart2,
    MessageCircle,
    Star,
    Gift
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Navigation items
const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/requests', label: 'Custom Requests', icon: MessageCircle },
    { href: '/admin/points', label: 'Points', icon: Star },
    { href: '/admin/rewards', label: 'Rewards', icon: Gift },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageCircle },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Compact Design */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-56 transform bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="text-xs font-bold text-white">A</span>
                        </div>
                        <span className="text-base font-bold text-white">Admin</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col h-[calc(100vh-3.5rem)]">
                    <div className="flex-1 py-2 px-2">
                        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                            Menu
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-150',
                                        isActive
                                            ? 'bg-pink-600/10 text-pink-500'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-pink-500" : "text-gray-500 group-hover:text-gray-300")} />
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-gray-800 py-2 px-2">
                        <Link
                            href="/"
                            target="_blank"
                            className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                            <Home className="h-4 w-4 text-gray-500 group-hover:text-gray-300" />
                            <span>View Site</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Log Out</span>
                        </button>
                    </div>

                    {/* User Info - Compact */}
                    <div className="border-t border-gray-800 p-3 bg-gray-900/50">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm font-bold">
                                {(user?.email?.charAt(0) || 'A').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">Admin</p>
                                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-56">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur px-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <span className="text-base font-bold text-white">Admin Panel</span>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-5 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
