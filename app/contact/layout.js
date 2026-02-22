export const metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Artovia Studio. We\'re available Mon–Sat, 9AM–9PM. Reach out via email or Instagram for custom design inquiries.',
    openGraph: {
        title: 'Contact Artovia Studio',
        description: 'Reach out to Artovia Studio for custom design requests, support, and inquiries. We\'re happy to help!',
        url: '/contact',
        type: 'website',
    },
    alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }) {
    return children;
}
