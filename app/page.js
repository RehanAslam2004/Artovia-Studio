import { getFeaturedProducts } from '@/lib/products';
import HomeContent from '@/components/HomeContent';

export const metadata = {
  title: 'Artovia Studio - Premium Digital Designs & Templates',
  description: 'Discover elegant wedding cards, creative templates, and stunning digital art. Instant downloads for your special moments.',
};

export default async function HomePage() {
  // Fetch data on the server
  const { products: featuredProducts } = await getFeaturedProducts(8);

  return (
    <HomeContent featuredProducts={featuredProducts || []} />
  );
}
