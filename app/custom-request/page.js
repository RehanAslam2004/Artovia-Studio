'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { toast } from '@/hooks/useToast';
import { uploadFile } from '@/lib/products'; // Reusing upload logic
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CustomRequestPage() {
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'custom-design', // 'custom-design' or 'customize-bundle'
        details: '',
        referenceImage: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validations
        if (file.size > 5 * 1024 * 1024) {
            toast.error({ title: 'File too large (Max 5MB)' });
            return;
        }

        setUploadingImage(true);
        try {
            const result = await uploadFile(file, 'requests');
            if (result.success) {
                setFormData(prev => ({ ...prev, referenceImage: result.url }));
                toast.success({ title: 'Reference image uploaded!' });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error({ title: 'Failed to upload image' });
        } finally {
            setUploadingImage(false);
        }
    };

    // Remove Image
    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, referenceImage: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.details) {
            toast.error({ title: 'Please fill in all required fields' });
            return;
        }

        setIsSubmitting(true);

        try {
            if (!isFirebaseConfigured || !db) {
                throw new Error('Service is temporarily unavailable. Please try again later.');
            }

            const docRef = await addDoc(collection(db, 'custom_requests'), {
                ...formData,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            // Send notification emails (Non-blocking)
            fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'custom_request',
                    request: { 
                        ...formData, 
                        id: docRef.id 
                    }
                })
            }).catch(err => console.error('Email send error (background):', err));

            setIsSuccess(true);
            toast.success({ title: 'Request submitted successfully!' });

            // Reset form
            setFormData({
                name: '',
                email: '',
                type: 'custom-design',
                details: '',
                referenceImage: null,
            });
        } catch (error) {
            console.error('Submission error:', error);
            toast.error({ title: error.message || 'Failed to submit request. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl text-center border border-gray-200 dark:border-gray-800"
                >
                    <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Received!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for your custom request. We will review it and get back to you at <strong>{formData.email}</strong> shortly.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} className="w-full">
                        Submit Another Request
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl font-heading">
                        Custom Design Request
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Need something unique? Request a custom design or personalize a bundle tailored just for you.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

                        {/* Request Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'custom-design' }))}
                                className={`p-4 rounded-xl border text-center transition-all ${formData.type === 'custom-design'
                                        ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300'
                                        : 'border-gray-200 hover:border-pink-200 dark:border-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <div className="font-semibold">Custom Design</div>
                                <div className="text-xs mt-1 opacity-70">New creation from scratch</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'customize-bundle' }))}
                                className={`p-4 rounded-xl border text-center transition-all ${formData.type === 'customize-bundle'
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                        : 'border-gray-200 hover:border-purple-200 dark:border-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <div className="font-semibold">Customize Bundle</div>
                                <div className="text-xs mt-1 opacity-70">Modify existing package</div>
                            </button>
                        </div>

                        {/* Name & Email */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Your Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Jane Doe"
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="jane@example.com"
                                    required
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <Label htmlFor="details">Project Details *</Label>
                            <textarea
                                id="details"
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                rows={5}
                                required
                                placeholder="Describe what you're looking for. Include colors, styles, dimensions, or any specific requirements..."
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                            />
                        </div>

                        {/* Reference Image */}
                        <div>
                            <Label>Reference Image (Optional)</Label>
                            <div className="mt-2">
                                {formData.referenceImage ? (
                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 flex items-center gap-3">
                                        <div className="h-16 w-16 relative rounded overflow-hidden flex-shrink-0">
                                            <img
                                                src={formData.referenceImage}
                                                alt="Reference"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1 text-sm text-gray-600 dark:text-gray-300 truncate">
                                            Reference Image Uploaded
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            <X className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage}
                                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors"
                                    >
                                        {uploadingImage ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 mb-2 text-gray-400" />
                                                <span className="text-sm font-medium">Upload Reference Image</span>
                                                <span className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                            disabled={isSubmitting || uploadingImage}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Request <Send className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>

                    </form>
                </motion.div>
            </div>
        </div>
    );
}
