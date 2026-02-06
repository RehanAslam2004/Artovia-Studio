'use client';

/**
 * Admin Layout Component
 * ======================
 * Shared layout for admin pages with sidebar navigation.
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
    ChevronRight,
    Home,
    BarChart2,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// Navigation items
const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
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

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-64 transform bg-gray-900 border-r border-gray-800 transition-transform duration-300 lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <span className="text-sm font-bold text-white">A</span>
                        </div>
                        <span className="text-lg font-bold text-white">Admin</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col h-[calc(100vh-4rem)]">
                    <div className="flex-1 space-y-1 p-4">
                        <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Main Menu
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
                                        'group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-pink-600/10 text-pink-500 border-l-4 border-pink-500'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border-l-4 border-transparent'
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-pink-500" : "text-gray-500 group-hover:text-gray-300")} />
                                    {item.label}
                                    {isActive && (
                                        <ChevronRight className="ml-auto h-4 w-4 text-pink-500" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-gray-800 p-4 space-y-2">
                        <Link
                            href="/"
                            target="_blank"
                            className="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border-l-4 border-transparent"
                        >
                            <Home className="h-5 w-5 text-gray-500 group-hover:text-gray-300" />
                            View Website
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors border-l-4 border-transparent"
                        >
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="border-t border-gray-800 p-4 bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold shadow-lg shadow-pink-900/20 ring-2 ring-gray-800">
                                {(user?.email?.charAt(0) || 'A').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Administrator</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Mobile Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur px-4 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold text-white">Admin Panel</span>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
