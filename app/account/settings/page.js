'use client';

/**
 * Settings Page
 * =============
 * User profile settings to update name and contact info.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth'; // Import Firebase updateProfile
import { auth } from '@/lib/firebase'; // Import auth instance
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Loader from '@/components/Loader';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';

export default function SettingsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated } = useAuth();

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        phoneNumber: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load initial data
    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.name || user.displayName || '', // Handle different property names
                email: user.email || '',
                phoneNumber: user.phone || '' // Assuming phone might be stored in future
            });
        }
    }, [user]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.displayName.trim()) {
            toast.error({ title: 'Name cannot be empty' });
            return;
        }

        setIsSaving(true);

        try {
            // Update Auth Profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: formData.displayName
                });

                // If we had a 'users' collection, we would update it here too

                toast.success({ title: 'Profile updated successfully' });

                // Optional: Refresh page or context to show new name immediately if not reactive
                // router.refresh(); 
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error({ title: 'Failed to update profile', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <Link
                        href="/account"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Account
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        Account Settings
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <Label htmlFor="displayName">Full Name</Label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="displayName"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className="pl-10"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                {/* Email (Read Only) */}
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            disabled
                                            className="pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Email cannot be changed directly. Contact support for help.
                                    </p>
                                </div>

                                {/* Phone (Optional/Future) */}
                                <div>
                                    <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                                    <div className="relative mt-1">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="pl-10"
                                            placeholder="+92 300 1234567"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Used for order updates.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        loading={isSaving}
                                        disabled={isSaving}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Change Password Link (Future) */}
                    <div className="mt-6 text-center">
                        <Link href="#" className="text-sm text-purple-600 hover:underline inline-flex items-center opacity-50 cursor-not-allowed" title="Coming Soon">
                            <Lock className="mr-1 h-3 w-3" />
                            Change Password (Coming Soon)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
