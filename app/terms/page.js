import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | Artovia Studio',
    description: 'Read our terms and conditions for using Artovia Studio digital design marketplace.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-gradient-to-br from-pink-50 to-white py-16 border-b border-pink-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Terms of Service
                    </h1>
                    <p className="mt-3 text-gray-500 text-sm">
                        Last updated: February 10, 2026
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 lg:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <div className="prose prose-gray prose-sm sm:prose-base max-w-none space-y-8">

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Welcome to Artovia Studio. By accessing or using our website at artoviastudio.com
                                (the "Site"), you agree to be bound by these Terms of Service ("Terms"). If you
                                do not agree to all of these Terms, please do not use our Site or purchase our products.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Products & Digital Downloads</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Artovia Studio offers digital design products including but not limited to wedding
                                invitations, digital art, social media templates, and design bundles. All products
                                are delivered digitally via download after purchase confirmation.
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li>Products are delivered as digital files (PDF, PNG, JPG, or other formats as specified).</li>
                                <li>Download links are provided via email after payment verification.</li>
                                <li>Custom orders require additional processing time (typically 1–3 business days).</li>
                                <li>All designs are customized specifically for the buyer's personal use.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. License & Usage Rights</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Upon purchase, you are granted a non-exclusive, non-transferable license to use
                                the digital product for personal purposes only.
                            </p>
                            <p className="text-gray-600 leading-relaxed font-medium">You MAY:</p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5 mb-3">
                                <li>Print the designs for personal events (weddings, parties, etc.).</li>
                                <li>Share digitally with your event guests.</li>
                                <li>Use as personal social media content with credit to Artovia Studio.</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed font-medium">You MAY NOT:</p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li>Resell, redistribute, or share the source files with third parties.</li>
                                <li>Use designs for commercial purposes without written permission.</li>
                                <li>Claim the designs as your own original work.</li>
                                <li>Modify and resell the designs as a competing product.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Payments</h2>
                            <p className="text-gray-600 leading-relaxed">
                                All prices are listed in Pakistani Rupees (PKR). We accept payments via
                                EasyPaisa. Payment must be confirmed
                                before digital files are released. Orders are processed manually; please allow
                                up to 24 hours for payment verification and file delivery.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Refund Policy</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Due to the digital nature of our products, all sales are final. We do not
                                offer refunds once the digital files have been delivered. However, we may
                                consider refunds or credits in the following cases:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li>You received a damaged or incorrect file.</li>
                                <li>The product does not match its description on the website.</li>
                                <li>Technical issues prevent you from downloading the product.</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                To request a refund, contact us at{' '}
                                <a href="mailto:artovia.business@gmail.com" className="text-pink-600 hover:text-pink-700 underline">
                                    artovia.business@gmail.com
                                </a>{' '}
                                within 7 days of purchase with your order details.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Loyalty Points Program</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Artovia Studio offers a loyalty points program for registered users. Points
                                are earned through purchases and special promotions, and can be redeemed for
                                discounts on future orders. We reserve the right to modify, suspend, or
                                discontinue the points program at any time. Points have no cash value and
                                cannot be transferred between accounts.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. User Accounts</h2>
                            <p className="text-gray-600 leading-relaxed">
                                You may create an account to access additional features such as order history,
                                loyalty points, and saved preferences. You are responsible for maintaining
                                the confidentiality of your account credentials. We reserve the right to
                                suspend or terminate accounts that violate these Terms.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
                            <p className="text-gray-600 leading-relaxed">
                                All designs, templates, logos, images, and content on this website are the
                                intellectual property of Artovia Studio unless otherwise stated. Unauthorized
                                reproduction, distribution, or use of our content is strictly prohibited
                                and may result in legal action.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Reviews & User Content</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Users may submit reviews and ratings for purchased products. By submitting
                                a review, you grant Artovia Studio a non-exclusive right to use, display,
                                and share your review on our platforms. Reviews must be honest and not
                                contain offensive, defamatory, or misleading content. We reserve the right
                                to remove reviews that violate these guidelines.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Artovia Studio shall not be liable for any indirect, incidental, or consequential
                                damages arising from the use of our products or website. Our total liability
                                shall not exceed the amount paid for the specific product in question.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We reserve the right to update these Terms at any time. Changes will be
                                posted on this page with an updated revision date. Continued use of the
                                Site after changes constitutes acceptance of the new Terms.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contact</h2>
                            <p className="text-gray-600 leading-relaxed">
                                For any questions about these Terms, please contact us at:{' '}
                                <a href="mailto:artovia.business@gmail.com" className="text-pink-600 hover:text-pink-700 underline">
                                    artovia.business@gmail.com
                                </a>
                            </p>
                        </div>

                        {/* Back Link */}
                        <div className="pt-8 border-t border-gray-100">
                            <Link href="/" className="text-pink-600 hover:text-pink-700 font-medium text-sm">
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
