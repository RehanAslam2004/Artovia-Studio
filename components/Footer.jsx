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
            { label: 'Templates', href: '/shop?category=templates' },
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
        <footer className="bg-gray-900 text-gray-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="font-logo text-2xl font-semibold text-pink-400">
                                Artovia <span className="text-gray-200">Studio</span>
                            </span>
                        </Link>

                        <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-400">
                            Your destination for premium digital designs. Beautiful wedding cards,
                            creative templates, and stunning digital art for your special moments.
                        </p>

                        {/* Contact - Email Only */}
                        <div className="mt-5">
                            <a
                                href={`mailto:${contactEmail}`}
                                className="flex items-center gap-3 text-sm transition-colors hover:text-pink-400"
                            >
                                <Mail className="h-4 w-4 text-pink-400" />
                                <span>{contactEmail}</span>
                            </a>
                        </div>

                        {/* Social Link - Instagram Only */}
                        <div className="mt-5">
                            <motion.a
                                href={instagramLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-pink-500 hover:text-white"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Instagram className="h-5 w-5" />
                            </motion.a>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([key, section]) => (
                        <div key={key}>
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 transition-colors hover:text-pink-400"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Payment Methods */}
                <div className="mt-10 border-t border-gray-800 pt-6">
                    <div>
                        <h4 className="mb-3 text-sm font-semibold text-white">
                            Accepted Payment Methods
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300">
                                JazzCash
                            </span>
                            <span className="rounded-full bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300">
                                EasyPaisa
                            </span>
                            <span className="rounded-full bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300">
                                NayaPay
                            </span>
                            <span className="rounded-full bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300">
                                Bank Transfer
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 bg-gray-950">
                <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-500">
                        © {currentYear} Artovia. All rights reserved.
                    </p>
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                        Made with <Heart className="h-3 w-3 text-pink-500" /> in Pakistan
                    </p>
                </div>
            </div>
        </footer>
    );
}
