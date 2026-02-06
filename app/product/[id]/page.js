import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import ProductDetails from '@/components/ProductDetails';
import { getProductById, getAllProducts } from '@/lib/products';
import { getProductReviews } from '@/lib/reviews';

// Dynamic Metadata Generation
export async function generateMetadata({ params }) {
    const { id } = await params;
    const { success, product } = await getProductById(id);

    if (!success || !product) {
        return {
            title: 'Product Not Found',
            description: 'The product you are looking for does not exist.',
        };
    }

    return {
        title: product.name,
        description: product.description.substring(0, 160), // SEO friendly truncation
        openGraph: {
            title: `${product.name} | Artovia Studio`,
            description: product.description.substring(0, 160),
            url: `/product/${product.id}`,
            images: [
                {
                    url: product.imageUrl || '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description.substring(0, 160),
            images: [product.imageUrl || '/og-image.png'],
        },
    };
}

// Server Component
export default async function ProductPage({ params }) {
    const { id: productId } = await params;
    const { success, product } = await getProductById(productId);

    if (!success || !product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Product not found
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    The product you're looking for doesn't exist.
                </p>
                <Link href="/shop" className="mt-4 inline-block">
                    <Button>Back to Shop</Button>
                </Link>
            </div>
        );
    }

    // Fetch related products (Server-side)
    const { products: allProducts } = await getAllProducts({ limit: 4 });
    const relatedProducts = allProducts
        ? allProducts
            .filter(p => p.id !== productId && p.category === product.category)
            .slice(0, 4)
        : [];


    // Fetch reviews
    let reviews = [];
    let averageRating = 0;
    let totalReviews = 0;

    try {
        const reviewData = await getProductReviews(productId);
        if (reviewData.success) {
            reviews = reviewData.reviews;
            averageRating = reviewData.averageRating;
            totalReviews = reviewData.totalReviews;
        }
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.imageUrl,
        description: product.description,
        brand: {
            '@type': 'Brand',
            name: 'Artovia Studio'
        },
        aggregateRating: totalReviews > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: totalReviews
        } : undefined,
        offers: {
            '@type': 'Offer',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.id}`,
            priceCurrency: 'PKR',
            price: product.price,
            availability: 'https://schema.org/InStock',
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetails
                product={product}
                relatedProducts={relatedProducts}
                initialReviews={reviews}
                ratingStats={{ averageRating, totalReviews }}
            />
        </>
    );
}
