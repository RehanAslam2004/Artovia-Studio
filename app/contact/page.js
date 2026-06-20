'use client';

/**
 * Contact Page
 * ============
 * Contact information with email-based form. Pink theme.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, Send, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from '@/hooks/useToast';
import { isValidEmail } from '@/lib/utils';

// Contact info - Email only
const contactInfo = {
    email: 'artovia.business@gmail.com',
    hours: 'Mon - Sat: 9:00 AM - 9:00 PM',
};

// Instagram only
const instagramLink = 'https://instagram.com/artoviastudio';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.message.trim()) newErrors.message = 'Message is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error({ title: 'Please fill in all required fields' });
            return;
        }

        setIsSubmitting(true);

        try {
            // Create mailto link with form data
            const subject = encodeURIComponent(formData.subject || 'Contact Form Inquiry');
            const body = encodeURIComponent(
                `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
            );

            window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');

            toast.success({
                title: 'Opening Email Client',
                description: 'Your message is ready to send via email.'
            });

            // Reset form
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error({ title: 'Something went wrong' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50/30">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-pink-400 to-pink-500 py-16 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <h1 className="text-3xl font-bold sm:text-4xl">Get in Touch</h1>
                        <p className="mt-4 text-pink-100">
                            Have a question or need a custom design? We'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-2 max-w-5xl mx-auto">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-xl font-bold text-gray-800">
                                Contact Information
                            </h2>
                            <p className="mt-3 text-gray-600">
                                Send us an email and we'll get back to you as soon as possible.
                            </p>

                            {/* Contact Details */}
                            <div className="mt-8 space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-500">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Email</h3>
                                        <a
                                            href={`mailto:${contactInfo.email}`}
                                            className="text-gray-600 hover:text-pink-500"
                                        >
                                            {contactInfo.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-500">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">Response Time</h3>
                                        <p className="text-gray-600">
                                            {contactInfo.hours}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social - Instagram Only */}
                            <div className="mt-8">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    Follow Us
                                </h3>
                                <motion.a
                                    href={instagramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-500 transition-colors hover:bg-pink-500 hover:text-white"
                                >
                                    <Instagram className="h-5 w-5" />
                                </motion.a>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-pink-100">
                                <CardHeader>
                                    <CardTitle>Send us a Message</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <Label htmlFor="name" required>Your Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Enter your name"
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
                                        </div>

                                        <div>
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                placeholder="What's this about?"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="message" required>Message</Label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                placeholder="Tell us how we can help..."
                                                rows={4}
                                                className={`mt-1 w-full rounded-lg border bg-white px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${errors.message
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                                    : 'border-pink-200 focus:border-pink-400 focus:ring-pink-400/20'
                                                    }`}
                                            />
                                            {errors.message && (
                                                <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full bg-pink-500 hover:bg-pink-600 rounded-full"
                                            loading={isSubmitting}
                                            disabled={isSubmitting}
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {isSubmitting ? 'Opening...' : 'Send via Email'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Quick Info */}
            <section className="bg-white py-12">
                <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-xl font-bold text-gray-800">
                        Quick Info
                    </h2>

                    <div className="mt-6 grid gap-4 text-left md:grid-cols-3 max-w-4xl mx-auto">
                        {[
                            { q: 'How do I receive my designs?', a: 'After payment confirmation, you will receive download links via email within 24 hours.' },
                            { q: 'Can I request custom designs?', a: 'Yes! Email us with your requirements and we will provide a quote.' },
                            { q: 'What payment methods do you accept?', a: 'We currently accept EasyPaisa and NayaPay for payments.' },
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="rounded-xl border border-pink-100 bg-pink-50/50 p-5"
                            >
                                <h3 className="font-semibold text-gray-800 text-sm">
                                    {faq.q}
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {faq.a}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
