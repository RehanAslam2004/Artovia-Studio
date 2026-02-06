'use client';

import { formatDate } from '@/lib/utils';
import StarRating from './StarRating';
import { User } from 'lucide-react';

export default function ReviewList({ reviews = [] }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 mb-1">No reviews yet.</p>
                <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{formatDate(review.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-3 pl-14">
                        {review.comment}
                    </p>
                </div>
            ))}
        </div>
    );
}
