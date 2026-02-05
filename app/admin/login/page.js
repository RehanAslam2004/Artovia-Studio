'use client';

/**
 * Admin Login Page
 * ================
 * Admin authentication page with email/password login.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import { signInAdmin } from '@/lib/auth';
import { isValidEmail } from '@/lib/utils';

export default function AdminLoginPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already logged in as admin
    useEffect(() => {
        if (!authLoading && user && isAdmin) {
            router.push('/admin/dashboard');
        }
    }, [user, isAdmin, authLoading, router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const result = await signInAdmin(formData.email, formData.password);

            if (result.success) {
                toast.success({ title: 'Welcome, Admin!' });
                router.push('/admin/dashboard');
            } else {
                throw new Error(result.error || 'Failed to sign in');
            }
        } catch (error) {
            console.error('Admin login error:', error);

            let errorMessage = 'Failed to sign in';
            if (error.message.includes('not-admin')) {
                errorMessage = 'You are not authorized as an admin';
            } else if (error.message.includes('user-not-found')) {
                errorMessage = 'No account found with this email';
            } else if (error.message.includes('wrong-password')) {
                errorMessage = 'Incorrect password';
            }

            toast.error({ title: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-900" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md"
            >
                <Card className="border-gray-800 bg-gray-900/80 backdrop-blur">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
                        <CardDescription className="text-gray-400">
                            Sign in to access the admin dashboard
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-gray-300">Email</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="admin@artoviastudio.com"
                                        error={errors.email}
                                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-gray-300">Password</Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                        error={errors.password}
                                        className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center border-t border-gray-800">
                        <Link
                            href="/"
                            className="text-sm text-gray-400 hover:text-purple-400"
                        >
                            ← Back to Website
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
