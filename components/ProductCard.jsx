'use client';

/**
 * ProductCard Component
 * =====================
 * Elegant product card with pink theme and add to cart functionality.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

/**
 * ProductCard Component
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {string} props.className - Additional CSS classes
 */
export default function ProductCard({ product, className }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { addToCart, isInCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        addToCart(product);
        toast.success({
            title: 'Added to Cart',
            description: `${product.name} has been added to your cart.`,
        });
    };

    const inCart = isInCart(product.id);

    // Placeholder image if product image fails to load
    const productImage = imageError || !(product.imageUrl || product.images?.[0])
        ? '/images/placeholder-product.png'
        : (product.imageUrl || product.images?.[0]);

    return (
        <motion.div
            className={cn(
                'group relative overflow-hidden rounded-xl border border-pink-100 bg-white transition-all duration-300',
                'hover:border-pink-200 hover:shadow-lg',
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Link href={`/product/${product.id}`}>
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-pink-50">
                    {/* Product Image */}
                    <motion.div
                        className="relative h-full w-full"
                        animate={{ scale: isHovered ? 1.05 : 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            onError={() => setImageError(true)}
                        />
                    </motion.div>

                    {/* Overlay on Hover */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    />

                    {/* Featured Badge */}
                    {product.featured && (
                        <div className="absolute left-2 top-2">
                            <Badge variant="default" className="bg-pink-500 text-white border-0 text-xs">
                                Featured
                            </Badge>
                        </div>
                    )}

                    {/* Quick Action Buttons */}
                    <motion.div
                        className="absolute bottom-3 left-3 right-3 flex justify-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <Eye className="h-4 w-4 text-gray-600" />
                        </Button>

                        <Button
                            variant={inCart ? 'success' : 'default'}
                            size="icon"
                            className={cn(
                                "h-9 w-9",
                                !inCart && "bg-pink-500 hover:bg-pink-600"
                            )}
                            onClick={handleAddToCart}
                            disabled={inCart}
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </Button>
                    </motion.div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                    {/* Product Name */}
                    <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 transition-colors group-hover:text-pink-500">
                        {product.name}
                    </h3>

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-pink-500">
                            {formatPrice(product.price)}
                        </span>

                        {/* Mobile Add to Cart Button */}
                        <Button
                            variant={inCart ? 'success' : 'outline'}
                            size="sm"
                            className={cn(
                                "lg:hidden text-xs px-3 py-1 h-8 rounded-full",
                                !inCart && "border-pink-300 text-pink-500 hover:bg-pink-50"
                            )}
                            onClick={handleAddToCart}
                            disabled={inCart}
                        >
                            {inCart ? '✓' : 'Add'}
                        </Button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/**
 * ProductCardHorizontal - Horizontal layout variant
 */
export function ProductCardHorizontal({ product, className }) {
    const [imageError, setImageError] = useState(false);
    const { addToCart, isInCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
        toast.success({
            title: 'Added to Cart',
            description: `${product.name} has been added to your cart.`,
        });
    };

    const inCart = isInCart(product.id);
    const productImage = imageError || !(product.imageUrl || product.images?.[0])
        ? '/images/placeholder-product.png'
        : (product.imageUrl || product.images?.[0]);

    return (
        <div
            className={cn(
                'flex gap-4 rounded-xl border border-pink-100 bg-white p-4 transition-all hover:border-pink-200 hover:shadow-md',
                className
            )}
        >
            <Link href={`/product/${product.id}`} className="shrink-0">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-pink-50">
                    <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
            </Link>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="mb-1 font-medium text-gray-800 hover:text-pink-500 text-sm">
                            {product.name}
                        </h3>
                    </Link>
                    <p className="line-clamp-1 text-xs text-gray-500">{product.description}</p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-500">{formatPrice(product.price)}</span>
                    <Button
                        variant={inCart ? 'success' : 'outline'}
                        size="sm"
                        className={cn(
                            "text-xs rounded-full",
                            !inCart && "border-pink-300 text-pink-500 hover:bg-pink-50"
                        )}
                        onClick={handleAddToCart}
                        disabled={inCart}
                    >
                        {inCart ? 'In Cart' : 'Add'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
