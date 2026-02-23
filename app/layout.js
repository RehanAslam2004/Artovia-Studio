/**
 * Root Layout
 * ===========
 * The main layout component that wraps all pages.
 * Includes global providers, fonts, and common UI elements.
 */

import { Inter, Italiana, Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/Toaster';
import ClientProviders from './providers';
import LayoutWrapper from '@/components/LayoutWrapper';
import MainWrapper from '@/components/MainWrapper';

// Body Font: Clean, sharp sans (Inter/Outfit)
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Logo Font: Decent, Elegant Serif (Playfair Display)
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

// Headings: Sharp & Elegant (Italiana)
const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-italiana',
});

// UI / Clean Text: Modern Geometric Sans
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
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
    'shadi card design',
    'design templates',
    'digital invitations Pakistan',
    'wedding card designer Pakistan',
    'instant download designs',
    'social media templates Pakistan',
    'EasyPaisa digital store',
    'online design store Pakistan',
    'printable wedding invitations',
    'digital nikah card',
    'custom design Pakistan',
    'digital products Pakistan',
    'e-books Pakistan',
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon-96x96.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'v-Qmks9uwIEq0Edz14R9fXP8U3Y2vpGlz-GH1gtTrVU',
  },
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
    <html lang="en" className={`${inter.variable} ${italiana.variable} ${playfair.variable} ${outfit.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-gray-950">
        <ClientProviders>
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-pink-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>

          {/* Site Header */}
          <LayoutWrapper>
            <Navbar />
          </LayoutWrapper>

          {/* Main Content */}
          <MainWrapper>
            {children}
          </MainWrapper>

          {/* Site Footer */}
          <LayoutWrapper>
            <Footer />
          </LayoutWrapper>

          {/* Toast Notifications */}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
