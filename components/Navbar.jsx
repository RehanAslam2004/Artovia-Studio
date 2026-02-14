'use client';

/**
 * Navbar Component
 * ================
 * Responsive navigation header with pink theme and cart integration.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    ShoppingCart,
    User,
    LogOut,
    Settings,
    Package
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getPendingOrdersCount, getUserActionRequiredCount } from '@/lib/orders';

// Navigation links - Simplified (no About)
const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const pathname = usePathname();
    const { getItemCount, isLoaded } = useCart();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setShowUserMenu(false);
    }, [pathname]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    };

    const cartItemCount = isLoaded ? getItemCount() : 0;

    // Notification State
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [userActionCount, setUserActionCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchNotifications = async () => {
            // Admin Badge
            if (isAdmin) {
                const count = await getPendingOrdersCount();
                if (isMounted) setPendingOrdersCount(count);
            }

            // User Badge
            if (user?.uid) {
                const count = await getUserActionRequiredCount(user.uid);
                if (isMounted) setUserActionCount(count);
            }
        };

        fetchNotifications();

        // Poll every 1 minute or on navigation? 
        // For now, fetch once on mount/auth change.
        const interval = setInterval(fetchNotifications, 60000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [isAdmin, user]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    isScrolled || isOpen
                        ? 'bg-white/90 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60'
                        : 'bg-transparent'
                )}
            >
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between lg:h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center group">
                            <motion.div
                                className="relative flex flex-col items-center leading-none py-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="font-logo text-2xl sm:text-3xl lg:text-4xl text-pink-500 drop-shadow-sm font-medium tracking-tight">
                                    Artovia
                                </span>
                                <span className="font-simple text-[8px] sm:text-[10px] text-gray-500 tracking-[0.2em] uppercase mt-0.5 group-hover:text-pink-400 transition-colors border-t border-pink-200 pt-0.5 px-1">
                                    By Ayesha Khan
                                </span>
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex lg:items-center lg:gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'relative text-sm font-medium transition-colors hover:text-pink-500',
                                        pathname === link.href
                                            ? 'text-pink-500'
                                            : 'text-gray-600'
                                    )}
                                >
                                    {link.label}
                                    {pathname === link.href && (
                                        <motion.div
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400"
                                            layoutId="navbar-indicator"
                                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex lg:items-center lg:gap-3">
                            {/* Cart Button */}
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" className="relative">
                                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                                    {cartItemCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs font-medium text-white"
                                        >
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </motion.span>
                                    )}
                                </Button>
                            </Link>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative user-menu-container">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <User className="h-5 w-5 text-gray-600" />
                                    </Button>

                                    <AnimatePresence>
                                        {showUserMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-pink-100 bg-white p-2 shadow-lg"
                                            >
                                                <div className="border-b border-pink-50 px-3 py-2">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {user?.name || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {user?.email}
                                                    </p>
                                                </div>

                                                <div className="py-2">
                                                    <Link
                                                        href="/account"
                                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-pink-50"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        My Profile
                                                    </Link>
                                                    <Link
                                                        href="/account/orders"
                                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4" />
                                                            My Orders
                                                        </div>
                                                        {userActionCount > 0 && (
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                                                                {userActionCount}
                                                            </span>
                                                        )}
                                                    </Link>

                                                    {isAdmin && (
                                                        <Link
                                                            href="/admin/dashboard"
                                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-pink-50 justify-between"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Settings className="h-4 w-4" />
                                                                Admin Dashboard
                                                            </div>
                                                            {pendingOrdersCount > 0 && (
                                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                                    {pendingOrdersCount}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="border-t border-pink-50 pt-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <Button
                                        size="sm"
                                        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-5"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-3 lg:hidden">
                            {/* Mobile Cart */}
                            <Link href="/cart">
                                <Button variant="ghost" size="icon-sm" className="relative">
                                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-medium text-white">
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>

                            {/* Hamburger Menu - Z-Index fix for overlay */}
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle menu"
                                className="relative z-50"
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>

                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay - Move outside header to avoid backdrop-filter issues */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", stiffness: 260, damping: 30 }}
                        className="fixed inset-0 z-[100] bg-white lg:hidden flex flex-col"
                    >
                        {/* Mobile Menu Header with Close Button */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
                            <span className="font-logo text-xl text-pink-500">Menu</span>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Scrollable Container */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            <div className="py-6 space-y-6">
                                {/* Mobile Nav Links */}
                                <div className="space-y-4">
                                    {navLinks.map((link, index) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + index * 0.1 }}
                                        >
                                            <Link
                                                href={link.href}
                                                className={cn(
                                                    'block text-2xl font-bold tracking-tight transition-colors',
                                                    pathname === link.href
                                                        ? 'text-pink-500'
                                                        : 'text-gray-900 hover:text-pink-500'
                                                )}
                                            >
                                                {link.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mobile User Section */}
                                <div className="mt-4 border-t border-pink-100 pt-4">
                                    {isAuthenticated ? (
                                        <div className="space-y-2">
                                            <div className="px-4 py-2">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                            </div>

                                            <Link
                                                href="/account"
                                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-pink-50"
                                            >
                                                <User className="h-5 w-5" />
                                                My Profile
                                            </Link>

                                            <Link
                                                href="/account/orders"
                                                className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-pink-50 justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Package className="h-5 w-5" />
                                                    My Orders
                                                </div>
                                                {userActionCount > 0 && (
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                                                        {userActionCount}
                                                    </span>
                                                )}
                                            </Link>

                                            {isAdmin && (
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 hover:bg-pink-50 justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Settings className="h-5 w-5" />
                                                        Admin Dashboard
                                                    </div>
                                                    {pendingOrdersCount > 0 && (
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                            {pendingOrdersCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-500 hover:bg-red-50"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="px-4">
                                            <Link href="/login" className="block">
                                                <Button className="w-full bg-pink-500 hover:bg-pink-600 rounded-full">
                                                    Sign In
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
