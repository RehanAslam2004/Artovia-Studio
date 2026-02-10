'use client';

/**
 * Admin Rewards Configuration Page
 * =================================
 * Manage loyalty reward tiers: add, edit, delete, enable/disable tiers.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift,
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    GripVertical
} from 'lucide-react';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/hooks/useToast';

export default function AdminRewardsPage() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [formData, setFormData] = useState({
        pointsRequired: '',
        discountPercent: '',
        label: '',
        enabled: true
    });

    // Fetch current reward tiers
    useEffect(() => {
        loadTiers();
    }, []);

    const loadTiers = async () => {
        setLoading(true);
        try {
            const { db, isFirebaseConfigured } = await import('@/lib/firebase');
            if (!isFirebaseConfigured) return;

            const { doc, getDoc } = await import('firebase/firestore');
            const settingsRef = doc(db, 'settings', 'rewards');
            const snap = await getDoc(settingsRef);

            if (snap.exists() && snap.data().tiers) {
                setTiers(snap.data().tiers);
            } else {
                // Load defaults
                setTiers([
                    { id: 'tier1', pointsRequired: 250, discountPercent: 15, label: '15% OFF', enabled: true },
                    { id: 'tier2', pointsRequired: 400, discountPercent: 25, label: '25% OFF', enabled: true },
                ]);
            }
        } catch (error) {
            console.error('Error loading tiers:', error);
            toast.error({ title: 'Failed to load reward tiers' });
        } finally {
            setLoading(false);
        }
    };

    const saveTiers = async (updatedTiers) => {
        setSaving(true);
        try {
            const { saveRewardTiers } = await import('@/lib/points');
            const result = await saveRewardTiers(updatedTiers);
            if (result.success) {
                setTiers(updatedTiers);
                toast.success({ title: 'Reward tiers saved successfully' });
            } else {
                toast.error({ title: 'Failed to save reward tiers' });
            }
        } catch (error) {
            console.error('Error saving tiers:', error);
            toast.error({ title: 'Failed to save reward tiers' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingTier(null);
        setFormData({
            pointsRequired: '',
            discountPercent: '',
            label: '',
            enabled: true
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (tier) => {
        setEditingTier(tier);
        setFormData({
            pointsRequired: tier.pointsRequired.toString(),
            discountPercent: tier.discountPercent.toString(),
            label: tier.label,
            enabled: tier.enabled
        });
        setShowAddModal(true);
    };

    const handleSubmit = () => {
        const points = parseInt(formData.pointsRequired);
        const discount = parseInt(formData.discountPercent);

        if (!points || points <= 0) {
            toast.error({ title: 'Please enter valid points required' });
            return;
        }
        if (!discount || discount <= 0 || discount > 100) {
            toast.error({ title: 'Please enter a valid discount (1-100%)' });
            return;
        }

        const label = formData.label || `${discount}% OFF`;

        if (editingTier) {
            // Update existing tier
            const updated = tiers.map(t =>
                t.id === editingTier.id
                    ? { ...t, pointsRequired: points, discountPercent: discount, label, enabled: formData.enabled }
                    : t
            );
            saveTiers(updated);
        } else {
            // Add new tier
            const newTier = {
                id: `tier_${Date.now()}`,
                pointsRequired: points,
                discountPercent: discount,
                label,
                enabled: formData.enabled
            };
            saveTiers([...tiers, newTier].sort((a, b) => a.pointsRequired - b.pointsRequired));
        }

        setShowAddModal(false);
    };

    const handleDelete = (tierId) => {
        if (!confirm('Are you sure you want to delete this reward tier?')) return;
        const updated = tiers.filter(t => t.id !== tierId);
        saveTiers(updated);
    };

    const handleToggle = (tierId) => {
        const updated = tiers.map(t =>
            t.id === tierId ? { ...t, enabled: !t.enabled } : t
        );
        saveTiers(updated);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Rewards Configuration</h1>
                        <p className="text-gray-400">Manage loyalty reward tiers and discounts</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={loadTiers}
                            disabled={loading}
                            className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleOpenAddModal}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Tier
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Gift className="h-5 w-5 text-pink-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-pink-300">How Reward Tiers Work</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Each tier defines how many points a customer needs to unlock a discount.
                                    When checking out, customers can choose to redeem their points for any tier they&apos;ve unlocked.
                                    The points will be deducted and the discount applied to their order.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tiers List */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Gift className="h-5 w-5 text-pink-400" />
                            Reward Tiers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
                            </div>
                        ) : tiers.length === 0 ? (
                            <div className="text-center py-12">
                                <Gift className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                                <p className="text-gray-400 mb-4">No reward tiers configured</p>
                                <Button onClick={handleOpenAddModal} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Tier
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tiers.sort((a, b) => a.pointsRequired - b.pointsRequired).map((tier, index) => (
                                    <motion.div
                                        key={tier.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`flex items-center justify-between p-4 rounded-xl border ${tier.enabled
                                                ? 'bg-gray-800/50 border-gray-700'
                                                : 'bg-gray-800/20 border-gray-800 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-gray-600 cursor-grab">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <div className={`p-3 rounded-xl ${tier.enabled
                                                    ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                                                    : 'bg-gray-700'
                                                }`}>
                                                <Gift className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-white">
                                                        {tier.discountPercent}% OFF
                                                    </span>
                                                    {!tier.enabled && (
                                                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    Requires {tier.pointsRequired} points
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleToggle(tier.id)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                {tier.enabled ? (
                                                    <ToggleRight className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleOpenEditModal(tier)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(tier.id)}
                                                className="text-gray-400 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-white">
                                    {editingTier ? 'Edit Reward Tier' : 'Add Reward Tier'}
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Points Required *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.pointsRequired}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pointsRequired: e.target.value }))}
                                        placeholder="e.g. 250"
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Discount Percent *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.discountPercent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                                        placeholder="e.g. 15"
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Label (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                        placeholder="e.g. 15% OFF"
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">If empty, will use &quot;X% OFF&quot;</p>
                                </div>

                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-300">Enabled</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                                        className="focus:outline-none"
                                    >
                                        {formData.enabled ? (
                                            <ToggleRight className="h-6 w-6 text-green-500" />
                                        ) : (
                                            <ToggleLeft className="h-6 w-6 text-gray-500" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 border-gray-700 text-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {saving ? 'Saving...' : 'Save Tier'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
