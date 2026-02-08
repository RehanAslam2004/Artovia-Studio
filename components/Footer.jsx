'use client';

/**
 * Footer Component
 * ================
 * Simplified footer with pink theme, email contact, and Instagram only.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Instagram, Heart } from 'lucide-react';

// Footer navigation - Simplified
const footerLinks = {
    shop: {
        title: 'Shop',
        links: [
            { label: 'All Products', href: '/shop' },
            { label: 'Wedding Cards', href: '/shop?category=wedding-cards' },
            { label: 'Bundles', href: '/shop?category=bundles' },
            { label: 'Digital Art', href: '/shop?category=digital-art' },
        ],
    },
    support: {
        title: 'Support',
        links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
};

// Contact info - Email only
const contactEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'artovia.business@gmail.com';

// Social media - Instagram only
const instagramLink = 'https://instagram.com/artoviastudio';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-20 bg-pink-50/50 pt-20">
            {/* Wave Divider (Top) */}
            <div className="absolute top-0 left-0 right-0 -mt-20 overflow-hidden leading-none">
                <svg
                    className="relative block w-full h-20 text-pink-50/50"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className="fill-white"
                    ></path>
                </svg>
            </div>

            <div className="container mx-auto px-6 pb-12 pt-8">
                <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left lg:gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1 lg:col-span-2">
                        <Link href="/" className="inline-block group">
                            <div className="flex flex-col items-center md:items-start leading-none">
                                <span className="font-logo text-3xl md:text-4xl text-pink-500 drop-shadow-sm">
                                    Artovia
                                </span>
                                <span className="font-simple text-[8px] md:text-[10px] text-gray-500 tracking-[0.2em] uppercase mt-1 border-t border-pink-200 pt-0.5 w-full text-center md:text-left">
                                    By Ayesha Khan
                                </span>
                            </div>
                        </Link>

                        <p className="mt-4 text-sm leading-relaxed text-gray-500 font-medium max-w-xs mx-auto md:mx-0">
                            Crafting moments into memories with premium digital designs. From elegant wedding cards to stunning art.
                        </p>

                        <div className="mt-6 flex justify-center md:justify-start gap-4">
                            <motion.a
                                href={instagramLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-pink-500 hover:bg-pink-500 hover:text-white transition-all ring-1 ring-pink-100"
                            >
                                <Instagram className="h-5 w-5" />
                            </motion.a>
                            <a
                                href={`mailto:${contactEmail}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-pink-500 hover:bg-pink-500 hover:text-white transition-all ring-1 ring-pink-100"
                            >
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="col-span-1">
                        <h3 className="mb-6 text-sm font-heading font-bold uppercase tracking-wider text-gray-900 border-b-2 border-pink-200 inline-block pb-1">
                            Shop
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.shop.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h3 className="mb-6 text-sm font-heading font-bold uppercase tracking-wider text-gray-900 border-b-2 border-pink-200 inline-block pb-1">
                            Support
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.support.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 border-t border-pink-200/50 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-sm font-medium text-gray-500">
                            © {currentYear} Artovia Studio. All rights reserved.
                        </p>

                        <div className="flex gap-2 opacity-70 grayscale hover:grayscale-0 transition-all">
                            {['JazzCash', 'EasyPaisa', 'NayaPay', 'Bank'].map((method) => (
                                <span key={method} className="px-2 py-1 text-[10px] font-bold bg-white rounded border border-pink-100 text-gray-500">
                                    {method}
                                </span>
                            ))}
                        </div>

                        <p className="flex items-center gap-1 text-sm font-medium text-gray-500">
                            Made with <Heart className="h-3 w-3 text-pink-500 fill-pink-500 animate-pulse" />
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
