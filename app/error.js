'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="text-center max-w-md mx-auto">
                <div className="mb-6 flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Something went wrong!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                <Button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    size="lg"
                    className="gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
