
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Heart, Star, ShieldCheck, Users } from 'lucide-react';

export const metadata = {
    title: 'About Us | Artovia Studio',
    description: 'Learn about Artovia Studio, your premier destination for digital designs and wedding invitations.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-pink-50/30">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white py-20 sm:py-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_50%)]" />
                <div className="container relative mx-auto px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        Crafting Memories with <span className="text-pink-600">Elegance</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10">
                        At Artovia Studio, we believe that every celebration deserves a unique touch.
                        We specialize in creating breathtaking digital designs, from wedding invitations
                        to professional branding assets, all delivered instantly to you.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/shop">
                            <Button size="lg" className="bg-pink-600 hover:bg-pink-700 rounded-full px-8">
                                Explore Our Collection
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg" className="border-pink-200 text-pink-600 hover:bg-pink-50 rounded-full px-8">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Artovia?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We combine artistic creativity with modern technology to deliver a seamless experience.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Star,
                                title: "Premium Design",
                                description: "Every template is crafted with attention to detail and modern aesthetics."
                            },
                            {
                                icon: Heart,
                                title: "Made with Love",
                                description: "We pour our passion into every pixel to ensure your special moments shine."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Instant Delivery",
                                description: "Get your digital files immediately after purchase. No waiting, no shipping fees."
                            },
                            {
                                icon: Users,
                                title: "Customer Focused",
                                description: "Our support team is dedicated to ensuring your complete satisfaction."
                            }
                        ].map((item, index) => (
                            <Card key={index} className="border-pink-100 hover:shadow-lg transition-shadow">
                                <CardContent className="p-6 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story / Context Section */}
            <section className="bg-white py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gray-100">
                            {/* Placeholder for an about image if available, else a nice gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                                <span className="font-serif text-4xl text-white opacity-50 font-bold">AS</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    Founded with a vision to make premium design accessible to everyone, Artovia Studio
                                    started as a small passion project and has grown into a trusted marketplace for
                                    digital creativity.
                                </p>
                                <p>
                                    We understand that in today's fast-paced world, convenience shouldn't come at the
                                    cost of quality. That's why we've streamlined the process of buying and customizing
                                    beautiful designs for weddings, businesses, and personal use.
                                </p>
                                <p>
                                    Whether you're a bride-to-be looking for the perfect invitation or an entrepreneur
                                    needing a quick logo refresh, we're here to help you look your best.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
