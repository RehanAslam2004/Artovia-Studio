/**
 * Root Layout
 * ===========
 * The main layout component that wraps all pages.
 * Includes global providers, fonts, and common UI elements.
 */

import { Inter, Playfair_Display, Cinzel_Decorative } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/Toaster';
import ClientProviders from './providers';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
  variable: '--font-cinzel',
});

// SEO Metadata
export const metadata = {
  title: {
    default: 'Artovia Studio - Premium Digital Designs',
    template: '%s | Artovia Studio',
  },
  description: 'Your one-stop destination for premium digital designs. Beautiful wedding cards, creative templates, and stunning digital art to make your special moments memorable.',
  keywords: [
    'digital designs',
    'wedding cards',
    'invitation templates',
    'digital art',
    'Artovia Studio',
    'Pakistani wedding cards',
    'nikah cards',
    'design templates',
  ],
  authors: [{ name: 'Artovia Studio' }],
  creator: 'Artovia Studio',
  publisher: 'Artovia Studio',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://artoviastudio.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Artovia Studio',
    title: 'Artovia Studio - Premium Digital Designs',
    description: 'Beautiful wedding cards, creative templates, and stunning digital art.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Artovia Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artovia Studio - Premium Digital Designs',
    description: 'Beautiful wedding cards, creative templates, and stunning digital art.',
    images: ['/og-image.png'],
    creator: '@artoviastudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

// Viewport configuration
export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * RootLayout Component
 * Main layout wrapper for the entire application
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${cinzel.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-gray-950">
        <ClientProviders>
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>

          {/* Site Header */}
          <Navbar />

          {/* Main Content */}
          <main id="main-content" className="min-h-screen pt-16 lg:pt-20">
            {children}
          </main>

          {/* Site Footer */}
          <Footer />

          {/* Toast Notifications */}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
