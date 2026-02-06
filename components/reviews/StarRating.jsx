'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StarRating({
    rating = 0,
    maxRating = 5,
    onRatingChange,
    editable = false,
    size = 'md',
    className
}) {
    const [hoverRating, setHoverRating] = useState(0);

    // Determine size classes
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-5 w-5',
        lg: 'h-8 w-8',
        xl: 'h-10 w-10'
    };

    const iconSize = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = (hoverRating || rating) >= starValue;
                const isHovered = hoverRating >= starValue;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!editable}
                        onClick={() => editable && onRatingChange(starValue)}
                        onMouseEnter={() => editable && setHoverRating(starValue)}
                        onMouseLeave={() => editable && setHoverRating(0)}
                        className={cn(
                            "transition-colors focus:outline-none",
                            editable ? "cursor-pointer hover:scale-110" : "cursor-default",
                        )}
                    >
                        <Star
                            className={cn(
                                iconSize,
                                "transition-all duration-200",
                                // Fill logic
                                isFilled
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-transparent text-gray-300",
                                // Hover specific override (if needed, but 'filled' covers it with logic above)
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
