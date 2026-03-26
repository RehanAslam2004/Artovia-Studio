'use client';

/**
 * CartItem Component
 * ==================
 * Individual cart item with quantity controls and remove button.
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { formatPrice, cn } from '@/lib/utils';

/**
 * CartItem Component
 * @param {Object} props - Component props
 * @param {Object} props.item - Cart item data
 * @param {string} props.className - Additional CSS classes
 */
export default function CartItem({ item, className }) {
    const [imageError, setImageError] = useState(false);
    const { updateQuantity, removeFromCart, incrementQuantity, decrementQuantity } = useCart();

    const productImage = imageError || !item.imageUrl
        ? '/images/placeholder-product.png'
        : item.imageUrl;

    const lineTotal = item.price * item.quantity;

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
                'flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all',
                'dark:border-gray-800 dark:bg-gray-950',
                className
            )}
        >
            {/* Product Image */}
            <Link href={`/product/${item.id}`} className="shrink-0">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24 dark:bg-gray-900">
                    <Image
                        src={productImage}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        onError={() => setImageError(true)}
                        unoptimized={true}
                        priority={true}
                        style={{ opacity: 1 }}
                    />
                </div>
            </Link>

            {/* Product Details */}
            <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <Link href={`/product/${item.id}`}>
                            <h3 className="font-medium text-gray-900 transition-colors hover:text-purple-600 dark:text-gray-100">
                                {item.name}
                            </h3>
                        </Link>
                        {item.category && (
                            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                {item.category}
                            </p>
                        )}
                    </div>

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleRemove}
                        className="shrink-0 text-gray-400 hover:text-red-600"
                        aria-label="Remove item"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Price & Quantity */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => decrementQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>

                        <span className="min-w-[2.5rem] text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.quantity}
                        </span>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => incrementQuantity(item.id)}
                            className="h-8 w-8"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatPrice(item.price)} × {item.quantity}
                        </p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                            {formatPrice(lineTotal)}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * CartItemCompact - Compact version for sidebars/modals
 */
export function CartItemCompact({ item, className }) {
    const [imageError, setImageError] = useState(false);
    const { removeFromCart } = useCart();

    const productImage = imageError || !item.imageUrl
        ? '/images/placeholder-product.png'
        : item.imageUrl;

    return (
        <div
            className={cn(
                'flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 dark:border-gray-800',
                className
            )}
        >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-900">
                <Image
                    src={productImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    unoptimized={true}
                    priority={true}
                    style={{ opacity: 1 }}
                />
            </div>

            <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                </p>
                <p className="text-xs text-gray-500">
                    Qty: {item.quantity} × {formatPrice(item.price)}
                </p>
            </div>

            <button
                onClick={() => removeFromCart(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

/**
 * CartSummary - Order summary component
 */
export function CartSummary({ className }) {
    const { cart, getSubtotal, getOriginalSubtotal, getTotal, getItemCount } = useCart();

    const subtotal = getSubtotal();
    const originalSubtotal = getOriginalSubtotal();
    const productDiscount = originalSubtotal - subtotal;
    const total = getTotal();
    const itemCount = getItemCount();

    return (
        <div
            className={cn(
                'rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900',
                className
            )}
        >
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Order Summary
            </h3>

            <div className="space-y-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                {productDiscount > 0 ? (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Items ({itemCount})
                            </span>
                            <span className="text-gray-500 line-through">
                                {formatPrice(originalSubtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Product Discounts
                            </span>
                            <span className="text-pink-500 font-medium">
                                -{formatPrice(productDiscount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <span className="text-gray-800 dark:text-gray-200">
                                Item Subtotal
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Items ({itemCount})
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                            {formatPrice(subtotal)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                    <span className="text-green-600 font-medium">Digital Delivery</span>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Total
                </span>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {formatPrice(total)}
                </span>
            </div>

            <p className="mt-3 text-xs text-gray-500 text-center">
                You will receive download links after payment confirmation
            </p>
        </div>
    );
}
