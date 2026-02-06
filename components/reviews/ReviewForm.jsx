'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addReview, hasUserReviewedProduct } from '@/lib/reviews';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { toast } from '@/hooks/useToast';
import StarRating from './StarRating';
import { Loader2 } from 'lucide-react';

export default function ReviewForm({ productId, onReviewSubmitted }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a star rating');
            return;
        }

        if (!user) {
            setError('You must be logged in to review');
            return;
        }

        setIsSubmitting(true);

        try {
            // Check if already reviewed (optional client side check, cleaner UX)
            // Ideally we check this on mount to hide form, but double check here doesn't hurt.

            const reviewData = {
                productId,
                userId: user.uid,
                userName: user.name || user.email?.split('@')[0] || 'User',
                rating,
                comment,
            };

            const result = await addReview(reviewData);

            if (result.success) {
                toast.success({ title: 'Review submitted!', description: 'Your review is pending approval.' });
                setRating(0);
                setComment('');
                if (onReviewSubmitted) onReviewSubmitted();
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Review submission error:', err);
            setError('Failed to submit review. Please try again.');
            toast.error({ title: 'Error', description: 'Could not submit review' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                <p className="text-gray-600 mb-4">Please log in to write a review.</p>
                <Button variant="outline" onClick={() => window.location.href = '/login'}>
                    Log In
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
                <Label className="block mb-2 text-lg font-medium">Rating</Label>
                <div className="flex items-center gap-2">
                    <StarRating
                        rating={rating}
                        onRatingChange={setRating}
                        editable={true}
                        size="lg"
                    />
                    <span className="text-sm font-medium text-gray-500 ml-2">
                        {rating ? `${rating} / 5` : 'Select a rating'}
                    </span>
                </div>
            </div>

            <div>
                <Label htmlFor="comment" className="block mb-2 text-lg font-medium">Review</Label>
                <textarea
                    id="comment"
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us what you liked about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 text-white min-w-[150px]"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Review'
                    )}
                </Button>
            </div>
        </form>
    );
}
