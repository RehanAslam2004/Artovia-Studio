'use client';

/**
 * Checkout Page
 * =============
 * Checkout page with customer information form and manual payment instructions.
 * Email-based order confirmation - no WhatsApp.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CreditCard,
    Building,
    Smartphone,
    Check,
    Copy,
    ShoppingBag,
    Mail,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CartItemCompact } from '@/components/CartItem';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import { createOrder } from '@/lib/orders';
import { formatPrice, isValidEmail, isValidPakistaniPhone } from '@/lib/utils';

// Payment methods configuration - No WhatsApp
const paymentMethods = [
    {
        id: 'jazzcash',
        name: 'JazzCash',
        icon: Smartphone,
        color: 'bg-red-500',
        accountNumber: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER || '03001234567',
        accountTitle: 'Artovia Studio',
        instructions: 'Send payment to the JazzCash number below and note down the Transaction ID.',
    },
    {
        id: 'easypaisa',
        name: 'EasyPaisa',
        icon: Smartphone,
        color: 'bg-green-500',
        accountNumber: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER || '03001234567',
        accountTitle: 'Artovia Studio',
        instructions: 'Send payment to the EasyPaisa number below and note down the Transaction ID.',
    },
    {
        id: 'nayapay',
        name: 'NayaPay',
        icon: CreditCard,
        color: 'bg-purple-500',
        accountNumber: process.env.NEXT_PUBLIC_NAYAPAY_NUMBER || '03001234567',
        accountTitle: 'Artovia Studio',
        instructions: 'Send payment to the NayaPay account below and note down the Transaction ID.',
    },
    {
        id: 'bank',
        name: 'Bank Transfer',
        icon: Building,
        color: 'bg-blue-500',
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'Bank Name',
        accountTitle: process.env.NEXT_PUBLIC_BANK_ACCOUNT_TITLE || 'Account Holder Name',
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '1234567890123',
        iban: process.env.NEXT_PUBLIC_BANK_IBAN || 'PK00BANK0000001234567890',
        instructions: 'Transfer the amount to the bank account below. Use your order email as reference.',
    },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, isLoaded, clearCart, getTotal, getItemCount } = useCart();
    const { user, isAuthenticated } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        transactionId: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [selectedPayment, setSelectedPayment] = useState('jazzcash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!isValidPakistaniPhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid Pakistani phone number';
        }

        if (!formData.transactionId.trim()) {
            newErrors.transactionId = 'Transaction ID is required for verification';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error({ title: 'Please fill in all required fields correctly' });
            return;
        }

        if (cart.length === 0) {
            toast.error({ title: 'Your cart is empty' });
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                userId: user?.uid || null,
                userEmail: formData.email.toLowerCase(),
                userName: formData.name,
                userPhone: formData.phone,
                items: cart,
                subtotal: getTotal(),
                total: getTotal(),
                paymentMethod: selectedPayment,
                transactionId: formData.transactionId || null,
                notes: formData.notes || null,
            };

            // Race against a timeout to give better feedback
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Connection timed out. Please check your internet.')), 15000);
            });

            const result = await Promise.race([
                createOrder(orderData),
                timeoutPromise
            ]);

            if (result.success) {
                setOrderId(result.order.id);
                setOrderPlaced(true);
                clearCart();
                toast.success({ title: 'Order placed successfully!' });
            } else {
                throw new Error(result.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Checkout error:', error);

            // Check for specific Firestore connectivity errors
            if (error.message.includes('offline') || error.message.includes('backend') || error.message.includes('timed out')) {
                toast.error({
                    title: 'Connection Error',
                    description: 'Could not connect to the server. Please check your internet and try again.'
                });
            } else {
                toast.error({ title: 'Failed to place order', description: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success({ title: 'Copied to clipboard!' });
        } catch (error) {
            console.error('Copy error:', error);
        }
    };

    const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);
    const total = getTotal();
    const itemCount = getItemCount();

    // Loading state
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    // Empty cart redirect
    if (cart.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-screen bg-pink-50/30">
                <div className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
                    <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Your cart is empty
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Add some items to your cart before checkout.
                    </p>
                    <Link href="/shop" className="mt-6 inline-block">
                        <Button className="bg-pink-500 hover:bg-pink-600 rounded-full">Browse Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Order success state
    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-pink-50/30">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-auto max-w-lg text-center"
                    >
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-10 w-10 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Order Placed Successfully!
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Thank you for your order. Your Order ID is:
                        </p>
                        <p className="mt-2 font-mono text-lg font-bold text-pink-500">
                            #{orderId?.slice(0, 8).toUpperCase()}
                        </p>

                        <Card className="mt-8 text-left border-pink-100">
                            <CardHeader>
                                <CardTitle className="text-lg">What's Next?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">
                                        1
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Complete the payment using your selected method ({selectedMethod?.name})
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">
                                        2
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        We'll verify your payment and process your order
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-600">
                                        3
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        You'll receive the download links via email within 24 hours
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-6 p-4 bg-pink-50 rounded-xl border border-pink-100">
                            <div className="flex items-center gap-2 justify-center text-pink-600 mb-2">
                                <Mail className="h-5 w-5" />
                                <span className="font-medium">Check Your Email</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                We'll send order updates and download links to <span className="font-medium">{formData.email}</span>
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            {isAuthenticated && (
                                <Link href="/account/orders">
                                    <Button className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 rounded-full">
                                        View My Orders
                                    </Button>
                                </Link>
                            )}
                            <Link href="/shop">
                                <Button variant="outline" className="w-full sm:w-auto border-pink-300 text-pink-500 hover:bg-pink-50 rounded-full">
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Load Firestore for guest sync
    const syncGuestCart = async (email) => {
        if (!email || !isLoaded || cart.length === 0) return;

        try {
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            // Use email as ID (sanitized) or just email
            // Storing in a separate collection 'guest_carts' or 'carts'
            // Let's use 'carts' with a prefix to keep it simple, or 'carts' implies users.
            // Let's use 'guest_carts' to differentiate.
            await setDoc(doc(db, 'guest_carts', email), {
                email,
                items: cart,
                updatedAt: serverTimestamp(),
                itemCount: cart.length,
                total: getTotal(),
                recovered: false
            }, { merge: true });

        } catch (error) {
            console.error('Error syncing guest cart:', error);
        }
    };

    // Debounce email sync
    useEffect(() => {
        if (!user && isValidEmail(formData.email)) {
            const timer = setTimeout(() => {
                syncGuestCart(formData.email);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [formData.email, cart, user]);

    return (
        <div className="min-h-screen bg-pink-50/30">
            <ExitIntentPopup />

            {/* Page Header */}
            <div className="border-b border-pink-100 bg-white">
                <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-pink-500 mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cart
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        Checkout
                    </h1>
                </div>
            </div>

            {/* Checkout Content */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Left Column - Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <Card className="border-pink-100">
                                <CardHeader>
                                    <CardTitle>Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" required>Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            error={errors.name}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email" required>Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your@email.com"
                                            error={errors.email}
                                            className="mt-1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Download links will be sent to this email
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="phone" required>Phone Number</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="03001234567"
                                            error={errors.phone}
                                            className="mt-1"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card className="border-pink-100">
                                <CardHeader>
                                    <CardTitle>Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setSelectedPayment(method.id)}
                                                    className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${selectedPayment === method.id
                                                        ? 'border-pink-400 bg-pink-50'
                                                        : 'border-gray-200 hover:border-pink-200'
                                                        }`}
                                                >
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${method.color} text-white`}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <span className="font-medium text-gray-800">
                                                        {method.name}
                                                    </span>
                                                    {selectedPayment === method.id && (
                                                        <Check className="ml-auto h-5 w-5 text-pink-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Payment Instructions */}
                                    {selectedMethod && (
                                        <motion.div
                                            key={selectedMethod.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 rounded-lg bg-pink-50 p-4 border border-pink-100"
                                        >
                                            <p className="text-sm text-gray-600 mb-4">
                                                {selectedMethod.instructions}
                                            </p>

                                            {['jazzcash', 'easypaisa', 'nayapay'].includes(selectedMethod.id) ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-pink-100">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Account Number</p>
                                                            <p className="font-mono font-bold text-gray-800">
                                                                {selectedMethod.accountNumber}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => copyToClipboard(selectedMethod.accountNumber, 'number')}
                                                        >
                                                            {copiedField === 'number' ? (
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-pink-100">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Account Title</p>
                                                            <p className="font-medium text-gray-800">
                                                                {selectedMethod.accountTitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : selectedMethod.id === 'bank' ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-pink-100">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Bank Name</p>
                                                            <p className="font-medium text-gray-800">
                                                                {selectedMethod.bankName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-pink-100">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Account Title</p>
                                                            <p className="font-medium text-gray-800">
                                                                {selectedMethod.accountTitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-pink-100">
                                                        <div>
                                                            <p className="text-xs text-gray-500">Account Number</p>
                                                            <p className="font-mono font-bold text-gray-800">
                                                                {selectedMethod.accountNumber}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => copyToClipboard(selectedMethod.accountNumber, 'account')}
                                                        >
                                                            {copiedField === 'account' ? (
                                                                <Check className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    {selectedMethod.iban && (
                                                        <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-pink-100">
                                                            <div>
                                                                <p className="text-xs text-gray-500">IBAN</p>
                                                                <p className="font-mono text-sm font-bold text-gray-800">
                                                                    {selectedMethod.iban}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                onClick={() => copyToClipboard(selectedMethod.iban, 'iban')}
                                                            >
                                                                {copiedField === 'iban' ? (
                                                                    <Check className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}

                                    {/* Transaction ID */}
                                    <div className="mt-4">
                                        <Label htmlFor="transactionId" required>Transaction ID</Label>
                                        <Input
                                            id="transactionId"
                                            name="transactionId"
                                            value={formData.transactionId}
                                            onChange={handleInputChange}
                                            placeholder="Enter transaction ID after payment"
                                            error={errors.transactionId}
                                            className="mt-1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Enter your transaction ID to verify payment
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Notes */}
                            <Card className="border-pink-100">
                                <CardHeader>
                                    <CardTitle>Additional Notes (Optional)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any special instructions or requests..."
                                        rows={3}
                                        className="w-full rounded-lg border border-pink-200 bg-white px-4 py-3 text-sm transition-all focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <Card className="border-pink-100">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Cart Items */}
                                    <div className="max-h-[300px] overflow-auto">
                                        {cart.map((item) => (
                                            <CartItemCompact key={item.id} item={item} />
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="mt-4 space-y-2 border-t border-pink-100 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Subtotal ({itemCount} items)
                                            </span>
                                            <span className="text-gray-800">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Delivery
                                            </span>
                                            <span className="text-green-600 font-medium">
                                                Digital (Free)
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between border-t border-pink-100 pt-4">
                                        <span className="font-semibold text-gray-800">
                                            Total
                                        </span>
                                        <span className="text-xl font-bold text-pink-500">
                                            {formatPrice(total)}
                                        </span>
                                    </div>

                                    {/* Place Order Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="mt-6 w-full bg-pink-500 hover:bg-pink-600 rounded-full"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                    </Button>

                                    <p className="mt-4 text-center text-xs text-gray-500">
                                        By placing this order, you agree to our Terms of Service
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Help */}
                            <div className="mt-4 rounded-lg border border-pink-100 bg-white p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-pink-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            Need Help?
                                        </p>
                                        <a
                                            href="mailto:artovia.business@gmail.com"
                                            className="text-sm text-pink-500 hover:underline"
                                        >
                                            Email us at artovia.business@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
