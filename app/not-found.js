import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, ShoppingBag, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="text-center max-w-md mx-auto">
                <div className="mb-6 flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto gap-2">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    </Link>

                    <Link href="/shop">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Browse Shop
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
