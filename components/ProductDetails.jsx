'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    Share2,
    Check,
    Download,
    Shield,
    Clock,
    Star,
    Mail,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Play,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/useToast';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
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
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Construct a unified media items list
    const initialImage = product?.images?.[0] || product?.imageUrl || '/images/placeholder-product.png';
    const otherImages = product?.images?.length > 1 ? product.images.slice(1) : [];

    const mediaItems = [];
    if (product) {
        // 1. Add main image
        mediaItems.push({
            type: 'image',
            url: initialImage
        });

        // 2. Add video if present (second item)
        if (product.previewVideoUrl) {
            mediaItems.push({
                type: 'video',
                url: product.previewVideoUrl,
                thumbnailUrl: product.previewVideoThumbnailUrl || initialImage
            });
        }

        // 3. Add other images
        otherImages.forEach(img => {
            mediaItems.push({
                type: 'image',
                url: img
            });
        });
    }

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowLeft') setSelectedMediaIndex(prev => prev > 0 ? prev - 1 : mediaItems.length - 1);
            if (e.key === 'ArrowRight') setSelectedMediaIndex(prev => prev < mediaItems.length - 1 ? prev + 1 : 0);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, mediaItems.length]);

    // Reset image error state on navigation
    useEffect(() => {
        setImageError(false);
    }, [selectedMediaIndex]);

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

    const discount = getDiscountPercent(product.price, product.compareAtPrice);

    const currentMediaItem = mediaItems[selectedMediaIndex] || mediaItems[0];
    const currentImageSrc = imageError ? '/images/placeholder-product.png' : currentMediaItem?.url || '/images/placeholder-product.png';

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
            {/* Lightbox Overlay */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsLightboxOpen(false)}
                            className="absolute right-4 top-4 z-[210] p-2 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        {/* Navigation Buttons */}
                        {mediaItems.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMediaIndex(prev => prev > 0 ? prev - 1 : mediaItems.length - 1);
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-[210] p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMediaIndex(prev => prev < mediaItems.length - 1 ? prev + 1 : 0);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-[210] p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            </>
                        )}

                        {/* Main Lightbox Media */}
                        <div
                            className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div
                                key={selectedMediaIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative w-full h-full select-none flex items-center justify-center"
                                onContextMenu={(e) => e.preventDefault()}
                            >
                                {currentMediaItem?.type === 'video' ? (
                                    <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden border border-gray-800 bg-black shadow-2xl">
                                        <video
                                            src={currentMediaItem.url}
                                            className="w-full h-full object-contain"
                                            controls
                                            autoPlay
                                            playsInline
                                        />
                                    </div>
                                ) : (
                                    <Image
                                        src={currentImageSrc}
                                        alt={product.name}
                                        fill
                                        className="object-contain"
                                        quality={100}
                                        priority
                                        draggable={false}
                                        sizes="(max-width: 1280px) 100vw, 1280px"
                                    />
                                )}

                                {/* Watermark Overlay (Visible in Lightbox, only on images) */}
                                {currentMediaItem?.type === 'image' && (
                                    <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-10">
                                        <div className="absolute inset-[-50%] flex flex-wrap items-center justify-center gap-12 rotate-[-30deg]">
                                            {Array.from({ length: 15 }).map((_, i) => (
                                                <span key={i} className="text-4xl font-bold text-white drop-shadow-md whitespace-nowrap select-none">
                                                    ARTOVIA STUDIO
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Lightbox Thumbnails */}
                        {mediaItems.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2" onClick={(e) => e.stopPropagation()}>
                                {mediaItems.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedMediaIndex(index)}
                                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${selectedMediaIndex === index ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-transparent opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={item.type === 'video' ? item.thumbnailUrl : item.url}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.style.backgroundColor = '#ffcccc';
                                            }}
                                        />
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Play className="h-4 w-4 text-white fill-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breadcrumb - Pink Theme */}
            <div className="border-b border-pink-100 bg-pink-50/30 dark:border-gray-800 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 py-3 sm:px-6">
                    <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <Link href="/" className="hover:text-pink-600 transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href="/shop" className="hover:text-pink-600 transition-colors">
                            Shop
                        </Link>
                        {product.category && (
                            <>
                                <span>/</span>
                                <Link
                                    href={`/shop?category=${product.category}`}
                                    className="hover:text-pink-600 capitalize transition-colors"
                                >
                                    {product.category.replace(/-/g, ' ')}
                                </Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="text-pink-600 truncate font-medium">
                            {product.name}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Product Details - Compact Layout */}
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:py-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-10 items-start">
                    {/* Product Image Section */}
                    <div className="lg:sticky lg:top-20 space-y-4">
                        {/* Main Media (Image or Video) */}
                        <motion.div
                            layoutId={`product-image-${product.id}`}
                            className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 cursor-zoom-in group shadow-md border border-pink-100 dark:border-gray-800"
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            {currentMediaItem?.type === 'video' ? (
                                <video
                                    src={currentMediaItem.url}
                                    className="w-full h-full object-cover animate-fade-in"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    poster={currentMediaItem.thumbnailUrl}
                                />
                            ) : (
                                <Image
                                    src={currentImageSrc}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    onError={() => setImageError(true)}
                                />
                            )}

                            {/* Zoom Hint */}
                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10">
                                <Maximize2 className="h-4 w-4 text-pink-600" />
                            </div>

                            {/* Watermark Overlay (Visible) */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-10">
                                <div className="absolute inset-[-50%] flex flex-wrap items-center justify-center gap-12 rotate-[-30deg]">
                                    {Array.from({ length: 15 }).map((_, i) => (
                                        <span key={i} className="text-3xl font-bold text-white drop-shadow-md whitespace-nowrap">
                                            ARTOVIA STUDIO
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Badge */}
                            {product.featured && !discount && (
                                <div className="absolute left-3 top-3 z-20">
                                    <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 px-2.5 py-0.5 text-xs shadow-sm">
                                        Featured
                                    </Badge>
                                </div>
                            )}

                            {/* EID SALE Badge */}
                            {discount && (
                                <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-xs font-bold shadow-lg shadow-yellow-500/30 px-3 py-1">
                                        SALE
                                    </Badge>
                                    <Badge className="bg-red-500 text-white border-0 text-xs font-bold px-2 py-0.5">
                                        -{discount}% OFF
                                    </Badge>
                                </div>
                            )}
                        </motion.div>

                        {/* Media Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto py-2">
                            {mediaItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedMediaIndex(index)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all overflow-hidden ${selectedMediaIndex === index
                                        ? 'border-pink-500 ring-2 ring-pink-200 shadow-sm'
                                        : 'border-pink-100 hover:border-pink-300'
                                        }`}
                                >
                                    {item.type === 'video' ? (
                                        <>
                                            <img
                                                src={item.thumbnailUrl}
                                                alt="Video Thumbnail"
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement.style.backgroundColor = '#ffcccc';
                                                }}
                                            />
                                            {/* Play Icon overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 text-white shadow-md">
                                                    <Play className="h-3 w-3 fill-white ml-0.5" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={`View ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement.style.backgroundColor = '#ffcccc';
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info - Compact & Pink Theme */}
                    <div className="flex flex-col space-y-6 pt-1">
                        <div>
                            {/* Category */}
                            {product.category && (
                                <Link
                                    href={`/shop?category=${product.category}`}
                                    className="inline-block mb-2 text-xs font-bold text-pink-600 hover:text-pink-700 uppercase tracking-wider bg-pink-100/50 dark:bg-pink-900/20 px-2.5 py-1 rounded-md"
                                >
                                    {product.category.replace(/-/g, ' ')}
                                </Link>
                            )}

                            {/* Title - Compact Size */}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                {product.name}
                            </h1>

                            {/* Rating (Real Data) */}
                            <div className="mt-3 flex items-center gap-2">
                                <div className="flex bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded-md">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < Math.round(ratingStats.averageRating || 0)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {ratingStats.totalReviews > 0 ? (
                                        <>
                                            <span className="font-bold text-gray-900 dark:text-white">{ratingStats.averageRating}</span> ( {ratingStats.totalReviews} reviews )
                                        </>
                                    ) : (
                                        'No reviews yet'
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Price Section - Compact */}
                        <div className="bg-pink-50/50 dark:bg-gray-900/50 p-4 rounded-xl border border-pink-100 dark:border-gray-800">
                            <div className="flex items-baseline gap-3">
                                <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                                    {formatPrice(product.price)}
                                </p>
                                {discount && (
                                    <p className="text-base text-gray-400 line-through decoration-pink-300">
                                        {formatPrice(product.compareAtPrice)}
                                    </p>
                                )}
                                {discount && (
                                    <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                                        SAVE {discount}%
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                                <Download className="h-3 w-3" />
                                Instant Download • Lifetime Access
                            </p>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm prose-pink dark:prose-invert max-w-none">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                About this design
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {product.description || 'No description available for this product.'}
                            </p>
                        </div>

                        {/* Action Buttons - Compact */}
                        <div className="flex flex-col gap-3 pt-2">
                            {/* Add to Cart */}
                            <Button
                                size="lg"
                                className={`w-full text-base font-bold h-12 rounded-lg shadow-lg transition-all hover:translate-y-[-1px] ${inCart
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-900/10'
                                    : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-pink-500/20'
                                    }`}
                                onClick={handleAddToCart}
                                disabled={inCart}
                            >
                                {inCart ? (
                                    <>
                                        <Check className="mr-2 h-5 w-5" />
                                        In Your Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Add to Cart • {formatPrice(product.price)}
                                    </>
                                )}
                            </Button>

                            {/* Secondary Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="w-full">
                                    <a href={`mailto:${supportEmail}?subject=Question about ${product.name}`}>
                                        <Button
                                            variant="outline"
                                            className="w-full h-11 border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-pink-700"
                                        >
                                            <Mail className="mr-2 h-4 w-4" />
                                            Ask Question
                                        </Button>
                                    </a>
                                </div>
                                <Button
                                    variant="outline"
                                    className="h-11 border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-pink-700"
                                    onClick={handleShare}
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </Button>
                            </div>

                            {/* Checkout Link if in cart */}
                            {inCart && (
                                <Link href="/cart" className="w-full">
                                    <Button variant="secondary" className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium border border-gray-200">
                                        Proceed to Checkout
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Features Grid - Compact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-pink-100 dark:border-gray-800">
                            {productFeatures.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-pink-50/50 dark:bg-gray-900/30">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-pink-500 shadow-sm border border-pink-100">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {feature.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Specifications */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="pt-4 border-t border-pink-100 dark:border-gray-800">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-3">
                                    Technical Specs
                                </h3>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key}>
                                            <dt className="text-[10px] text-gray-500 capitalize">{key}</dt>
                                            <dd className="text-xs font-medium text-gray-900 dark:text-white">{value}</dd>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section - Compact Header */}
                <section className="mt-12 border-t border-pink-100 pt-12 dark:border-gray-800" id="reviews">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Customer Reviews
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="ml-1 font-bold text-base">{ratingStats?.averageRating || 0}</span>
                                </div>
                                <span className="text-gray-500 text-sm">• {ratingStats?.totalReviews || 0} reviews</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* Review List */}
                        <div className="lg:col-span-7">
                            <ReviewList reviews={initialReviews} />
                        </div>

                        {/* Review Form */}
                        <div className="lg:col-span-5">
                            <div className="sticky top-24">
                                <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">
                                    Write a Review
                                </h3>
                                <ReviewForm productId={product.id} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mt-12 border-t border-pink-100 pt-12 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Related Products
                            </h2>
                            <Link href={`/shop?category=${product.category}`}>
                                <Button variant="outline" size="sm" className="h-9 border-pink-200">View All</Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
