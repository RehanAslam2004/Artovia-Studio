'use client';

/**
 * Admin Reviews Management Page
 * =============================
 * Allows admins to moderate (approve/reject) user reviews.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Check,
    X,
    Trash2,
    Filter,
    Star,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/Loader';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { getAllReviews, updateReviewStatus, deleteReview } from '@/lib/reviews';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import StarRating from '@/components/reviews/StarRating';

export default function AdminReviewsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved'
    const [actionLoading, setActionLoading] = useState(null); // id of review being processed

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/admin/login');
            } else if (!isAdmin) {
                router.push('/');
            }
        }
    }, [user, isAdmin, authLoading, router]);

    // Fetch reviews
    const loadReviews = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);

        try {
            const result = await getAllReviews({ status: filterStatus === 'all' ? undefined : filterStatus });
            if (result.success) {
                setReviews(result.reviews);
            } else if (result.requiresIndex) {
                toast.error({
                    title: "Index Required",
                    description: "Please create the Firestore index. See console for link.",
                    duration: 10000
                });
            } else {
                toast.error({ title: 'Failed to load reviews', description: result.error });
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            toast.error({ title: 'Error loading reviews' });
        } finally {
            setLoading(false);
        }
    }, [isAdmin, filterStatus]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    const handleStatusUpdate = async (reviewId, newStatus) => {
        setActionLoading(reviewId);
        try {
            const result = await updateReviewStatus(reviewId, newStatus);
            if (result.success) {
                toast.success({ title: `Review ${newStatus}` });
                // Optimistic update
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, status: newStatus } : r
                ));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Status update error:', error);
            toast.error({ title: 'Failed to update review status' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        setActionLoading(reviewId);
        try {
            const result = await deleteReview(reviewId);
            if (result.success) {
                toast.success({ title: 'Review deleted' });
                setReviews(prev => prev.filter(r => r.id !== reviewId));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error({ title: 'Failed to delete review' });
        } finally {
            setActionLoading(null);
        }
    };

    // Filter Logic
    const filteredReviews = reviews; // Actually we filter server-side or implicitly by loadReviews dependencies, but for client-side sorting/searching we could do more here.

    // Derived stats
    const pendingCount = reviews.filter(r => r.status === 'pending').length;

    if (loading && reviews.length === 0) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader size="lg" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Reviews</h1>
                        <p className="text-gray-400 mt-1">
                            Moderate customer feedback.
                            {pendingCount > 0 && <span className="text-pink-400 font-medium ml-2">({pendingCount} pending)</span>}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 pb-2 overflow-x-auto">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            onClick={() => setFilterStatus(status)}
                            className={`capitalize rounded-full ${filterStatus === status
                                ? 'bg-pink-600 hover:bg-pink-700 text-white border-0'
                                : 'border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            {status}
                        </Button>
                    ))}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
                            <MessageSquare className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white">No reviews found</h3>
                            <p className="text-gray-500 mt-1">No reviews match the current filter.</p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-white">{review.userName || 'Anonymous'}</h4>
                                                    <span className="text-xs text-gray-500">• {formatDate(review.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-xs text-gray-400">for Product ID: {review.productId}</span>
                                                </div>
                                            </div>
                                            <Badge className={`capitalize ${review.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    review.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                {review.status}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-300 bg-gray-900/50 p-3 rounded-lg text-sm leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex md:flex-col gap-2 items-center md:justify-center border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6">
                                        {review.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleStatusUpdate(review.id, 'approved')}
                                                    disabled={actionLoading === review.id}
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full border-red-900 text-red-400 hover:bg-red-950/50"
                                                    onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                                    disabled={actionLoading === review.id}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {review.status !== 'pending' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="w-full text-gray-400 hover:text-white"
                                                onClick={() => handleStatusUpdate(review.id, review.status === 'approved' ? 'pending' : 'approved')}
                                                disabled={actionLoading === review.id}
                                            >
                                                Mark as {review.status === 'approved' ? 'Pending' : 'Approved'}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-red-500 hover:bg-red-950/30 hover:text-red-400"
                                            onClick={() => handleDelete(review.id)}
                                            disabled={actionLoading === review.id}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
