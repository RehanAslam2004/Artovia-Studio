'use client';

/**
 * Admin Points Management Page
 * ============================
 * Manage user loyalty points: view all users with points, add/remove points manually.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Star,
    Plus,
    Minus,
    User,
    History,
    X,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';
import AdminLayout from '../AdminLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

export default function AdminPointsPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustType, setAdjustType] = useState('add');
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustNote, setAdjustNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);
    const [userHistory, setUserHistory] = useState({});

    // Fetch all users with points
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { getAllUsersWithPoints } = await import('@/lib/points');
            const result = await getAllUsersWithPoints(100);
            if (result.success) {
                setUsers(result.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error({ title: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    };

    const loadUserHistory = async (userId) => {
        if (userHistory[userId]) return; // Already loaded

        try {
            const { getPointsHistory } = await import('@/lib/points');
            const result = await getPointsHistory(userId, 20);
            if (result.success) {
                setUserHistory(prev => ({
                    ...prev,
                    [userId]: result.transactions
                }));
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleToggleExpand = (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
        } else {
            setExpandedUser(userId);
            loadUserHistory(userId);
        }
    };

    const handleOpenAdjustModal = (user, type) => {
        setSelectedUser(user);
        setAdjustType(type);
        setAdjustAmount('');
        setAdjustNote('');
        setShowAdjustModal(true);
    };

    const handleAdjustPoints = async () => {
        const amount = parseInt(adjustAmount);
        if (!amount || amount <= 0) {
            toast.error({ title: 'Please enter a valid amount' });
            return;
        }

        setSubmitting(true);
        try {
            if (adjustType === 'add') {
                const { addPoints } = await import('@/lib/points');
                await addPoints(
                    selectedUser.id,
                    selectedUser.email,
                    amount,
                    'admin_adjustment',
                    { adminId: 'admin', note: adjustNote || 'Manual adjustment by admin' }
                );
                toast.success({ title: `Added ${amount} points to ${selectedUser.name || selectedUser.email}` });
            } else {
                const { deductPoints } = await import('@/lib/points');
                const result = await deductPoints(
                    selectedUser.id,
                    selectedUser.email,
                    amount,
                    'admin_adjustment',
                    { adminId: 'admin', note: adjustNote || 'Manual deduction by admin' }
                );
                if (!result.success) {
                    toast.error({ title: result.error || 'Failed to deduct points' });
                    setSubmitting(false);
                    return;
                }
                toast.success({ title: `Deducted ${amount} points from ${selectedUser.name || selectedUser.email}` });
            }

            setShowAdjustModal(false);
            // Clear cached history for this user
            setUserHistory(prev => {
                const updated = { ...prev };
                delete updated[selectedUser.id];
                return updated;
            });
            loadUsers(); // Refresh the list
        } catch (error) {
            console.error('Error adjusting points:', error);
            toast.error({ title: 'Failed to adjust points' });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const getReasonLabel = (reason) => {
        switch (reason) {
            case 'signup_bonus': return 'Signup Bonus';
            case 'order_approved': return 'Order Approved';
            case 'redeemed': return 'Points Redeemed';
            case 'admin_adjustment': return 'Admin Adjustment';
            default: return reason;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Points Management</h1>
                        <p className="text-gray-400">Manage user loyalty points</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={loadUsers}
                        disabled={loading}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                                    <Star className="h-5 w-5 text-white fill-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Points</p>
                                    <p className="text-2xl font-bold text-white">
                                        {users.reduce((sum, u) => sum + (u.points || 0), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Users</p>
                                    <p className="text-2xl font-bold text-white">
                                        {users.length}
                                        <span className="text-sm text-gray-500 font-normal ml-2">
                                            ({users.filter(u => u.points > 0).length} with points)
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg">
                                    <History className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Avg Points</p>
                                    <p className="text-2xl font-bold text-white">
                                        {users.length > 0 ? Math.round(users.reduce((sum, u) => sum + (u.points || 0), 0) / users.length) : 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-10 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <User className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                                <p className="text-gray-400">No users found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredUsers.map((user) => (
                                    <div key={user.id} className="border border-gray-800 rounded-lg overflow-hidden">
                                        <div className="flex items-center justify-between p-4 bg-gray-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    {(user.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{user.name || 'No Name'}</p>
                                                    <p className="text-sm text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-lg font-bold text-white">{user.points || 0}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">points</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenAdjustModal(user, 'add')}
                                                        className="border-green-600 text-green-500 hover:bg-green-500/10 h-8 w-8 p-0"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleOpenAdjustModal(user, 'remove')}
                                                        className="border-red-600 text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleExpand(user.id)}
                                                        className="text-gray-400 hover:text-white h-8 w-8 p-0"
                                                    >
                                                        {expandedUser === user.id ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded History */}
                                        <AnimatePresence>
                                            {expandedUser === user.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-700 bg-gray-800/30"
                                                >
                                                    <div className="p-4">
                                                        <p className="text-sm font-medium text-gray-300 mb-3">Points History</p>
                                                        {!userHistory[user.id] ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-500" />
                                                            </div>
                                                        ) : userHistory[user.id].length === 0 ? (
                                                            <p className="text-sm text-gray-500 text-center py-4">No history</p>
                                                        ) : (
                                                            <div className="space-y-2 max-h-60 overflow-auto">
                                                                {userHistory[user.id].map((tx) => (
                                                                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                                                                        <div>
                                                                            <p className="text-sm text-gray-300">{getReasonLabel(tx.reason)}</p>
                                                                            {tx.note && <p className="text-xs text-gray-500">{tx.note}</p>}
                                                                            <p className="text-xs text-gray-500">{tx.createdAt ? formatDate(tx.createdAt) : 'N/A'}</p>
                                                                        </div>
                                                                        <Badge
                                                                            variant={tx.type === 'credit' ? 'success' : 'destructive'}
                                                                            className="text-xs"
                                                                        >
                                                                            {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                                                                        </Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Adjust Points Modal */}
            <AnimatePresence>
                {showAdjustModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setShowAdjustModal(false)}
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
                                    {adjustType === 'add' ? 'Add Points' : 'Remove Points'}
                                </h3>
                                <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-white">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                        {(selectedUser.name?.charAt(0) || selectedUser.email?.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{selectedUser.name || 'No Name'}</p>
                                        <p className="text-sm text-gray-400">Current: {selectedUser.points || 0} points</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={adjustAmount}
                                        onChange={(e) => setAdjustAmount(e.target.value)}
                                        placeholder="Enter points amount"
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Note (Optional)</label>
                                    <input
                                        type="text"
                                        value={adjustNote}
                                        onChange={(e) => setAdjustNote(e.target.value)}
                                        placeholder="Reason for adjustment..."
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAdjustModal(false)}
                                        className="flex-1 border-gray-700 text-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAdjustPoints}
                                        disabled={submitting || !adjustAmount}
                                        className={`flex-1 ${adjustType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                    >
                                        {submitting ? 'Processing...' : adjustType === 'add' ? 'Add Points' : 'Remove Points'}
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
