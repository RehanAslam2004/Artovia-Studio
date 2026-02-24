import { getFeaturedProducts } from '@/lib/products';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Artovia Studio - Premium Digital Designs, Wedding Cards & Templates',
  description: 'Discover elegant wedding cards, creative templates, and stunning digital art at Artovia Studio. Custom designs, instant digital downloads, and premium quality for your special moments. Shop now!',
  keywords: ['wedding cards Pakistan', 'digital wedding invitations', 'nikah cards', 'custom wedding cards', 'digital designs', 'premium templates', 'Artovia Studio', 'digital art', 'invitation templates'],
  openGraph: {
    title: 'Artovia Studio - Premium Digital Designs & Templates',
    description: 'Elegant wedding cards, creative templates, and stunning digital art. Custom designs delivered instantly.',
    type: 'website',
  },
};

export default async function HomePage() {
  // Fetch data on the server
  const { products: featuredProducts } = await getFeaturedProducts(8);

  return (
    <HomeContent featuredProducts={featuredProducts || []} />
  );
}
