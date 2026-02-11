'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    Share2,
    Check,
    Download,
    Shield,
    Clock,
    Star,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/useToast';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewList from '@/components/reviews/ReviewList';

// Product features/benefits
const productFeatures = [
    { icon: Download, text: 'Digital download' },
    { icon: Shield, text: 'Customized for you' },
    { icon: Clock, text: 'Fast delivery' },
];

export default function ProductDetails({ product, relatedProducts, initialReviews = [], ratingStats = { averageRating: 0, totalReviews: 0 } }) {
    const router = useRouter();
    const { addToCart, isInCart } = useCart();

    const [imageError, setImageError] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    // If product is not provided (shouldn't happen in normal flow if parent handles it)
    if (!product) {
        return null; // Or some fallback
    }

    const handleAddToCart = () => {
        addToCart(product);
        toast.success({
            title: 'Added to Cart!',
            description: `${product.name} has been added to your cart.`,
        });
    };

    const handleShare = async () => {
        const shareData = {
            title: product?.name,
            text: product?.description,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success({ title: 'Link copied to clipboard!' });
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'artovia.business@gmail.com';
    const inCart = isInCart(product.id);

    const productImage = imageError || !(product.imageUrl || product.images?.[selectedImage])
        ? '/images/placeholder-product.png'
        : (product.images?.[selectedImage] || product.imageUrl);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Breadcrumb */}
            <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-500 hover:text-pink-500">
                            Home
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/shop" className="text-gray-500 hover:text-pink-500">
                            Shop
                        </Link>
                        {product.category && (
                            <>
                                <span className="text-gray-400">/</span>
                                <Link
                                    href={`/shop?category=${product.category}`}
                                    className="text-gray-500 hover:text-pink-500 capitalize"
                                >
                                    {product.category.replace(/-/g, ' ')}
                                </Link>
                            </>
                        )}
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 dark:text-white truncate">
                            {product.name}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Product Details */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Product Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="sticky top-24">
                            {/* Main Image */}
                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
                                <Image
                                    src={productImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    onError={() => setImageError(true)}
                                />

                                {/* Watermark Overlay */}
                                <div
                                    className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden"
                                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                >
                                    <div
                                        className="absolute inset-[-50%] flex flex-wrap items-center justify-center gap-12"
                                        style={{ transform: 'rotate(-30deg)' }}
                                    >
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <span
                                                key={i}
                                                className="text-2xl sm:text-3xl font-bold whitespace-nowrap"
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.12)',
                                                    textShadow: '0 0 4px rgba(0, 0, 0, 0.08)',
                                                    letterSpacing: '0.1em'
                                                }}
                                            >
                                                ARTOVIA STUDIO
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Featured Badge */}
                                {product.featured && (
                                    <div className="absolute left-4 top-4 z-20">
                                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                                            Featured
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Image Thumbnails (if multiple images) */}
                            {product.images && product.images.length > 1 && (
                                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all bg-gray-100 ${selectedImage === index
                                                ? 'border-purple-600 ring-2 ring-purple-200'
                                                : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.name} - ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col"
                    >
                        {/* Category */}
                        {product.category && (
                            <Link
                                href={`/shop?category=${product.category}`}
                                className="mb-2 text-sm font-medium text-pink-500 hover:text-pink-600 capitalize"
                            >
                                {product.category.replace(/-/g, ' ')}
                            </Link>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            {product.name}
                        </h1>

                        {/* Rating (placeholder) */}
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">(5.0) • 50+ sold</span>
                        </div>

                        {/* Price */}
                        <div className="mt-6">
                            <p className="text-3xl font-bold text-pink-500">
                                {formatPrice(product.price)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                One-time purchase • Instant download
                            </p>
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Description
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                                {product.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Features */}
                        <div className="mt-6 space-y-3">
                            {productFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {feature.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                    Specifications
                                </h3>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                                    {Object.entries(product.specifications).map(([key, value], index) => (
                                        <div
                                            key={key}
                                            className={`flex justify-between px-4 py-3 text-sm ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                                                }`}
                                        >
                                            <span className="text-gray-500 capitalize">{key}</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 space-y-4">
                            {/* Add to Cart Button */}
                            <Button
                                size="lg"
                                className="w-full bg-pink-500 hover:bg-pink-600 rounded-full"
                                onClick={handleAddToCart}
                                disabled={inCart}
                            >
                                {inCart ? (
                                    <>
                                        <Check className="mr-2 h-5 w-5" />
                                        Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Add to Cart
                                    </>
                                )}
                            </Button>

                            {/* Secondary Actions */}
                            <div className="flex gap-3">
                                <a
                                    href={`mailto:${supportEmail}?subject=Inquiry about ${product.name}`}
                                    className="flex-1"
                                >
                                    <Button variant="outline" className="w-full border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email Inquiry
                                    </Button>
                                </a>

                                <Button variant="outline" size="icon" onClick={handleShare} className="border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Buy Now */}
                            {inCart && (
                                <Link href="/cart" className="block">
                                    <Button variant="secondary" className="w-full rounded-full">
                                        View Cart & Checkout
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-8 flex items-center justify-center gap-6 border-t border-gray-200 pt-8 dark:border-gray-800">
                            <div className="text-center">
                                <Shield className="mx-auto h-6 w-6 text-green-600" />
                                <p className="mt-1 text-xs text-gray-500">Secure Payment</p>
                            </div>
                            <div className="text-center">
                                <Download className="mx-auto h-6 w-6 text-blue-600" />
                                <p className="mt-1 text-xs text-gray-500">Digital Design</p>
                            </div>
                            <div className="text-center">
                                <Clock className="mx-auto h-6 w-6 text-purple-600" />
                                <p className="mt-1 text-xs text-gray-500">24/7 Support</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <section className="mt-16 border-t border-gray-200 pt-16 dark:border-gray-800" id="reviews">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Customer Reviews
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="ml-1 font-bold text-lg">{ratingStats?.averageRating || 0}</span>
                                </div>
                                <span className="text-gray-500">• {ratingStats?.totalReviews || 0} reviews</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-12">
                        {/* Review List - Takes up 7/12 columns on large screens */}
                        <div className="lg:col-span-7">
                            <ReviewList reviews={initialReviews} />
                        </div>

                        {/* Review Form - Takes up 5/12 columns, sticky on large screens */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                    Write a Review
                                </h3>
                                <ReviewForm productId={product.id} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mt-16 border-t border-gray-200 pt-16 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Related Products
                            </h2>
                            <Link href={`/shop?category=${product.category}`}>
                                <Button variant="outline">View All</Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
