import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | Artovia Studio',
    description: 'Learn how Artovia Studio collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-gradient-to-br from-pink-50 to-white py-16 border-b border-pink-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Privacy Policy
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
                                At Artovia Studio ("we", "our", or "us"), we are committed to protecting
                                your privacy. This Privacy Policy explains how we collect, use, disclose,
                                and safeguard your information when you visit our website or make a purchase.
                                Please read this policy carefully.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We collect information that you provide directly to us:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5 mb-4">
                                <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                                <li><strong>Order Information:</strong> Contact details, delivery preferences, and payment references when placing orders.</li>
                                <li><strong>Communication Data:</strong> Messages, inquiries, and feedback you send via our contact form or email.</li>
                                <li><strong>Review Data:</strong> Product reviews, ratings, and reviewer name you submit on our platform.</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We also automatically collect certain information:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li><strong>Usage Data:</strong> Pages visited, time spent, and click patterns.</li>
                                <li><strong>Device Data:</strong> Browser type, operating system, and device identifiers.</li>
                                <li><strong>Cookies:</strong> Session and authentication cookies for login and cart functionality.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We use the collected information for the following purposes:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li>Process and fulfill your orders and deliver digital products.</li>
                                <li>Send order confirmations, updates, and download links via email.</li>
                                <li>Manage your account and provide customer support.</li>
                                <li>Track and manage loyalty points and rewards.</li>
                                <li>Improve our website, products, and user experience.</li>
                                <li>Prevent fraud and ensure the security of our platform.</li>
                                <li>Communicate promotional offers (only with your consent).</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Storage & Security</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Your data is stored securely using Google Firebase's cloud infrastructure,
                                which employs industry-standard encryption and security measures. We use
                                Firebase Authentication for secure login and Firestore for encrypted data
                                storage. While we take reasonable measures to protect your data, no method
                                of electronic storage is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Sharing Your Information</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We do not sell, trade, or rent your personal information. We may share
                                your information only in the following limited cases:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li><strong>Service Providers:</strong> Firebase (hosting/database), email delivery services for order notifications.</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
                                <li><strong>Business Transfers:</strong> In connection with any merger or sale of business assets.</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We use the following types of cookies:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li><strong>Essential Cookies:</strong> Required for authentication (user login sessions) and cart functionality.</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., dark mode).</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                We do not use third-party advertising or tracking cookies. You can manage
                                cookies through your browser settings.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                You have the following rights regarding your personal data:
                            </p>
                            <ul className="list-disc pl-5 text-gray-600 space-y-1.5">
                                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong>Correction:</strong> Update or correct inaccurate information in your account.</li>
                                <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
                                <li><strong>Opt-out:</strong> Unsubscribe from promotional emails at any time.</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                To exercise these rights, email us at{' '}
                                <a href="mailto:artovia.business@gmail.com" className="text-pink-600 hover:text-pink-700 underline">
                                    artovia.business@gmail.com
                                </a>.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Children's Privacy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Our website is not intended for children under 13 years of age. We do not
                                knowingly collect personal information from children. If you believe we
                                have collected data from a child, please contact us immediately and we
                                will delete it.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Third-Party Links</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Our website may contain links to third-party websites (e.g., Instagram, payment
                                providers). We are not responsible for the privacy practices or content of
                                these external sites. We encourage you to review their privacy policies.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. Any changes will be
                                posted on this page with an updated date. We encourage you to review this
                                page periodically.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have questions about this Privacy Policy or your personal data,
                                please contact us at:{' '}
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
