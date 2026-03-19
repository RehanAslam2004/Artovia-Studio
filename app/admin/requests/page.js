'use client';

/**
 * Admin Custom Requests Page
 * ==========================
 * Allows admins to view and manage custom design requests.
 * Admins can set prices and notify customers via email.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    MessageSquare, 
    User, 
    Mail, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Eye, 
    Send, 
    Search,
    Trash2,
    Loader2,
    Calendar,
    Image as ImageIcon,
    DollarSign,
    Filter,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/hooks/useToast';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { getAllRequests, updateRequest, deleteRequest } from '@/lib/requests';
import { formatDate } from '@/lib/utils';

export default function CustomRequestsAdmin() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAuth();
    
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [quotePrice, setQuotePrice] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch requests
    const fetchRequests = async () => {
        setLoading(true);
        const result = await getAllRequests();
        if (result.success) {
            setRequests(result.requests);
        } else {
            toast.error({ title: 'Failed to load requests', description: result.error });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isAdmin) {
            fetchRequests();
        }
    }, [isAdmin]);

    // Handle price quoting
    const handleSendQuote = async () => {
        if (!selectedRequest || !quotePrice) return;
        
        setIsUpdating(true);
        try {
            // 1. Update Firestore
            const updateResult = await updateRequest(selectedRequest.id, {
                status: 'quoted',
                quotedPrice: Number(quotePrice)
            });

            if (!updateResult.success) throw new Error(updateResult.error);

            // 2. Send Email
            const emailResult = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'custom_quote',
                    request: selectedRequest,
                    price: quotePrice
                })
            });

            if (!emailResult.ok) {
                const err = await emailResult.json();
                throw new Error(err.error || 'Failed to send quote email');
            }

            toast.success({ title: 'Quote sent successfully!', description: `Price Rs. ${quotePrice} notified to customer.` });
            
            // 3. Refresh list and close modal
            await fetchRequests();
            setSelectedRequest(null);
            setQuotePrice('');
        } catch (error) {
            console.error('Error sending quote:', error);
            toast.error({ title: 'Error', description: error.message });
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle status update (general)
    const handleStatusUpdate = async (requestId, status) => {
        setIsUpdating(true);
        const result = await updateRequest(requestId, { status });
        if (result.success) {
            toast.success({ title: `Status updated to ${status}` });
            fetchRequests();
        } else {
            toast.error({ title: 'Update failed', description: result.error });
        }
        setIsUpdating(false);
    };

    // Filtered requests
    const filteredRequests = requests.filter(req => {
        const matchesSearch = 
            req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.details.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 font-sans"><Loader /></div>;
    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Custom Design Requests</h1>
                        <p className="text-gray-400 mt-1">Review and provide quotes for bespoke design projects</p>
                    </div>
                    <Button onClick={fetchRequests} variant="outline" className="border-gray-700 text-gray-300">
                        <RefreshIcon loading={loading} />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input 
                                placeholder="Search by name, email or details..." 
                                className="pl-10 bg-gray-950 border-gray-800 text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 whitespace-nowrap"><Filter className="inline h-4 w-4 mr-1" /> Status:</span>
                            <select 
                                className="bg-gray-950 border-gray-800 text-white rounded-md px-3 py-2 text-sm focus:ring-pink-500 focus:border-pink-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Requests</option>
                                <option value="pending">Pending</option>
                                <option value="quoted">Quoted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <div className="grid gap-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-pink-500" />
                            <p>Loading your creative requests...</p>
                        </div>
                    ) : filteredRequests.length > 0 ? (
                        filteredRequests.map(req => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            {/* Details Section */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 ring-1 ring-pink-500/20">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg">{req.name}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                <Mail className="h-3 w-3" /> {req.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={req.status} />
                                                </div>

                                                <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50">
                                                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-500 mb-2">
                                                        <MessageSquare className="h-3 w-3" /> Project Description
                                                    </div>
                                                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{req.details}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(req.createdAt)}</span>
                                                    <span className="flex items-center gap-1 font-semibold text-purple-400 uppercase tracking-tighter">
                                                        {req.type === 'custom-design' ? '✨ NEW DESIGN' : '📦 BUNDLE CUSTOMIZATION'}
                                                    </span>
                                                    {req.quotedPrice && (
                                                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                                            <DollarSign className="h-3 w-3" /> Quoted: Rs. {req.quotedPrice}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Reference Image Section */}
                                            <div className="lg:w-48 xl:w-64 space-y-4 flex flex-col">
                                                <div className="flex-1 rounded-xl bg-gray-950 border border-gray-800 overflow-hidden relative group aspect-square lg:aspect-auto">
                                                    {req.referenceImage ? (
                                                        <>
                                                            <img 
                                                                src={req.referenceImage} 
                                                                alt="Reference" 
                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                            />
                                                            <a 
                                                                href={req.referenceImage} 
                                                                target="_blank" 
                                                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Eye className="h-6 w-6 text-white" />
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-900/20">
                                                            <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                                                            <span className="text-xs">No reference image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-2">
                                                    {req.status === 'pending' ? (
                                                        <Button 
                                                            onClick={() => setSelectedRequest(req)}
                                                            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 border-none"
                                                        >
                                                            <DollarSign className="mr-2 h-4 w-4" /> Provide Quote
                                                        </Button>
                                                    ) : (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="border-gray-800 text-gray-400"
                                                                onClick={() => handleStatusUpdate(req.id, 'completed')}
                                                            >
                                                                <CheckCircle className="mr-2 h-3.5 w-3.5" /> Complete
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="border-gray-800 text-red-500/70 hover:text-red-500"
                                                                onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                                            >
                                                                <XCircle className="mr-2 h-3.5 w-3.5" /> Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                            <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-gray-700" />
                            </div>
                            <h3 className="text-white font-bold text-lg">No requests found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quote Modal Overlay */}
            {selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md"
                    >
                        <Card className="bg-gray-900 border-gray-700 shadow-2xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-br from-pink-600 to-purple-700 p-6 text-white border-none">
                                <CardTitle className="text-xl flex items-center gap-2 font-heading">
                                    <Sparkles className="h-5 w-5" /> Send Custom Quote
                                </CardTitle>
                                <p className="text-pink-100/80 text-sm mt-1">For {selectedRequest.name}</p>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Quoted Price (Rs.)</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs.</div>
                                        <Input 
                                            type="number" 
                                            placeholder="500" 
                                            value={quotePrice}
                                            onChange={(e) => setQuotePrice(e.target.value)}
                                            className="pl-10 bg-gray-950 border-gray-800 text-white font-bold text-lg"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic uppercase tracking-wider">
                                        * This will trigger an official quote email to <strong>{selectedRequest.email}</strong>
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setSelectedRequest(null)}
                                        className="border-gray-800 text-gray-400 hover:bg-gray-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={handleSendQuote}
                                        disabled={isUpdating || !quotePrice}
                                        className="bg-gradient-to-r from-pink-600 to-purple-600 border-none shadow-lg shadow-pink-900/20"
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                        Send Quote
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AdminLayout>
    );
}

// Helper Components
function StatusBadge({ status }) {
    const styles = {
        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        quoted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
        completed: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };

    return (
        <Badge className={`${styles[status] || styles.pending} border uppercase tracking-widest text-[10px] py-0.5 font-bold`}>
            {status}
        </Badge>
    );
}

function RefreshIcon({ loading }) {
    return <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />;
}

function Loader() {
    return <Loader2 className="h-8 w-8 animate-spin text-pink-500" />;
}
