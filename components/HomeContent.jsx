'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Sparkles,
    Download,
    Shield,
    Zap,
    Heart,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ProductCard from '@/components/ProductCard';

// Categories data
const categories = [
    {
        id: 'wedding-cards',
        name: 'Wedding Cards',
        description: 'Elegant invitations for your special day',
        color: 'from-pink-400 to-rose-400',
    },
    {
        id: 'custom-request',
        name: 'Custom Request',
        description: 'Get a design tailored just for you',
        color: 'from-pink-500 to-fuchsia-400',
        href: '/custom-request', // Direct link
    },
    {
        id: 'digital-art',
        name: 'Digital Art',
        description: 'Unique artistic creations',
        color: 'from-rose-400 to-pink-500',
    },
    {
        id: 'social-media',
        name: 'Social Media',
        description: 'Posts, stories & banners',
        color: 'from-fuchsia-400 to-pink-400',
    },
];

// Features data
const features = [
    {
        icon: Download,
        title: 'Instant Download',
        description: 'Get your files immediately after payment confirmation',
    },
    {
        icon: Shield,
        title: 'Secure Payment',
        description: 'JazzCash, EasyPaisa, NayaPay & Bank Transfer',
    },
    {
        icon: Zap,
        title: 'Premium Quality',
        description: 'High-resolution files ready for print or digital use',
    },
    {
        icon: Heart,
        title: 'Made with Love',
        description: 'Each design is crafted with attention to detail',
    },
];

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function HomeContent({ featuredProducts }) {
    return (
        <div className="overflow-hidden">
            {/* Hero Section - Centered */}
            <section className="relative min-h-[60vh] sm:min-h-[75vh] flex items-center justify-center hero-pattern overflow-hidden">
                {/* Animated Background Decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                            rotate: [0, 90, 0]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-pink-300/20 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3],
                            x: [0, 50, 0]
                        }}
                        transition={{
                            duration: 12,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-purple-300/20 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                        className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-rose-200/20 blur-2xl"
                    />
                </div>

                <div className="container relative mx-auto px-4 py-16 sm:px-6 lg:px-8 z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div variants={fadeInUp}>
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-pink-600 shadow-sm ring-1 ring-pink-200">
                                <Sparkles className="h-4 w-4" />
                                Premium Digital Designs
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="mt-6 sm:mt-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-7xl font-logo"
                        >
                            Beautiful Designs for<br />
                            <span className="block mt-2 font-decorative text-pink-500 drop-shadow-sm">
                                Your Special Moments
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="mt-8 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto leading-relaxed"
                        >
                            Discover elegant wedding cards, creative templates, and stunning
                            digital art. make your occasions truly unforgettable with Artovia Studio.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link href="/shop">
                                <Button size="lg" className="group h-12 min-w-[180px] text-base bg-pink-500 hover:bg-pink-600 rounded-full shadow-lg shadow-pink-500/25">
                                    Browse Collection
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="/custom-request">
                                <Button size="lg" variant="outline" className="h-12 min-w-[180px] text-base border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full">
                                    Custom Design Request
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-white relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Browse by Category
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Find the perfect design for your needs
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 gap-3 sm:gap-8 lg:grid-cols-4"
                    >
                        {categories.map((category) => (
                            <motion.div key={category.id} variants={fadeInUp}>
                                <Link href={category.href || `/shop?category=${category.id}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl border border-pink-100 h-full"
                                    >
                                        {/* Category Image Placeholder */}
                                        <div className={`aspect-[4/3] bg-gradient-to-br ${category.color} relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
                                            <div className="flex h-full items-center justify-center">
                                                <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-white/80 drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                                            </div>
                                        </div>

                                        {/* Category Info */}
                                        <div className="p-5">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="mt-2 text-xs sm:text-sm text-gray-500 hidden sm:block line-clamp-2">
                                                {category.description}
                                            </p>
                                            <div className="mt-4 flex items-center text-xs sm:text-sm font-semibold text-pink-500">
                                                Explore
                                                <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-pink-50/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center justify-between gap-4 mb-10 sm:flex-row"
                    >
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                                Featured Designs
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Our most popular designs
                            </p>
                        </div>
                        <Link href="/shop">
                            <Button variant="outline" className="group border-pink-300 text-pink-500 hover:bg-pink-50 rounded-full">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </motion.div>

                    {featuredProducts && featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">
                                No featured products yet. Check back soon!
                            </p>
                            <Link href="/shop" className="mt-4 inline-block">
                                <Button className="bg-pink-500 hover:bg-pink-600 rounded-full">
                                    Browse All Products
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gradient-to-br from-pink-400 to-pink-500 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl font-bold sm:text-3xl">Why Choose Us?</h2>
                        <p className="mt-3 text-pink-100">
                            We're committed to providing the best experience
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4"
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="text-center"
                                >
                                    <div className="mx-auto mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-white/20">
                                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold">{feature.title}</h3>
                                    <p className="mt-1 text-xs sm:text-sm text-pink-100">{feature.description}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-400 to-pink-500 px-6 py-12 sm:px-12 sm:py-16 text-center"
                    >
                        {/* Background decorations */}
                        <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3" />

                        <div className="relative">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                Ready to Create Something Beautiful?
                            </h2>
                            <p className="mt-3 text-base text-pink-100 max-w-xl mx-auto">
                                Browse our collection of premium digital designs.
                            </p>
                            <div className="mt-6">
                                <Link href="/shop">
                                    <Button size="lg" className="bg-white text-pink-500 hover:bg-pink-50 rounded-full px-8">
                                        Start Shopping
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
