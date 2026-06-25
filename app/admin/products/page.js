'use client';

/**
 * Admin Products Page
 * ===================
 * Product management page with add, edit, and delete functionality.
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Upload,
    X,
    Save,
    ImagePlus,
    Loader2,
    Star,
    Video,
    Film,
    FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/Loader';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadFile,
    deleteFile
} from '@/lib/products';
import { formatPrice, debounce, cn } from '@/lib/utils';

// Categories for dropdown
const categories = [
    'wedding-cards',
    'bundles',
    'lightroom-templates',
    'e-books',
    'social-media',
    'business',
    'occasion-cards',
    'bookmarks',
    'other'
];

// Initial form state
const initialFormState = {
    name: '',
    description: '',
    basePrice: '',
    discountPercent: '',
    category: 'wedding-cards',
    imageUrl: '',
    images: [], // Multiple images support
    featured: false,
    specifications: {},
    previewVideoUrl: '',
    previewVideoPath: '',
    previewVideoThumbnailUrl: '',
    previewVideoThumbnailPath: '',
    dngFileUrl: '',
    dngFilePath: '',
    bookmarkPdfUrl: '',
    bookmarkPdfPath: '',
};

export default function AdminProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const videoThumbnailInputRef = useRef(null);
    const dngInputRef = useRef(null);
    const bookmarkPdfInputRef = useRef(null);

    // State
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingVideoThumbnail, setUploadingVideoThumbnail] = useState(false);
    const [uploadingDng, setUploadingDng] = useState(false);
    const [uploadingBookmarkPdf, setUploadingBookmarkPdf] = useState(false);

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

    // Check for action param
    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            openCreateModal();
        }
    }, [searchParams]);

    // Fetch products
    useEffect(() => {
        async function loadProducts() {
            if (!isAdmin) return;

            try {
                const result = await getAllProducts();
                if (result.success) {
                    setProducts(result.products);
                    setFilteredProducts(result.products);
                }
            } catch (error) {
                console.error('Error loading products:', error);
                toast.error({ title: 'Failed to load products' });
            } finally {
                setLoading(false);
            }
        }

        if (isAdmin) {
            loadProducts();
        }
    }, [isAdmin]);

    // Filter products by search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredProducts(products);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = products.filter(
            p =>
                p.name?.toLowerCase().includes(query) ||
                p.category?.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    // Handle search
    const handleSearch = debounce((value) => {
        setSearchQuery(value);
    }, 300);

    // Open create modal
    const openCreateModal = () => {
        setIsEditing(false);
        setEditingProduct(null);
        setFormData(initialFormState);
        setFormErrors({});
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = (product) => {
        setIsEditing(true);
        setEditingProduct(product);
        
        let basePrice = product.price?.toString() || '';
        let discountPercent = '';
        
        if (product.compareAtPrice) {
            basePrice = product.compareAtPrice.toString();
            // Calculate what percentage discount was applied
            const dp = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
            discountPercent = dp.toString();
        }
        
        setFormData({
            name: product.name || '',
            description: product.description || '',
            basePrice: basePrice,
            discountPercent: discountPercent,
            category: product.category || 'canva-templates',
            imageUrl: product.imageUrl || '',
            images: product.images || (product.imageUrl ? [product.imageUrl] : []),
            canvaLink: product.canvaLink || '',
            featured: product.featured || false,
            specifications: product.specifications || {},
            previewVideoUrl: product.previewVideoUrl || '',
            previewVideoPath: product.previewVideoPath || '',
            previewVideoThumbnailUrl: product.previewVideoThumbnailUrl || '',
            previewVideoThumbnailPath: product.previewVideoThumbnailPath || '',
            dngFileUrl: product.dngFileUrl || '',
            dngFilePath: product.dngFilePath || '',
            bookmarkPdfUrl: product.bookmarkPdfUrl || '',
            bookmarkPdfPath: product.bookmarkPdfPath || '',
        });
        setFormErrors({});
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditingProduct(null);
        setFormData(initialFormState);
        setFormErrors({});
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handle image upload
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingImage(true);

        try {
            // Validate all files first
            const validFiles = [];
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

            for (const file of files) {
                if (!validTypes.includes(file.type)) {
                    toast.error({ title: `Skipped invalid file: ${file.name}` });
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) {
                    toast.error({ title: `Skipped large file: ${file.name}` });
                    continue;
                }
                validFiles.push(file);
            }

            if (validFiles.length === 0) {
                setUploadingImage(false);
                return;
            }

            // Upload files one-by-one and update state after each
            let uploadedCount = 0;
            for (const file of validFiles) {
                const result = await uploadFile(file, 'products');
                if (result.success) {
                    uploadedCount++;
                    // Update state immediately so image appears in gallery
                    setFormData(prev => {
                        const updatedImages = [...(prev.images || []), result.url];
                        return {
                            ...prev,
                            images: updatedImages,
                            imageUrl: updatedImages[0],
                        };
                    });
                    toast.success({ title: `Uploaded ${uploadedCount}/${validFiles.length}: ${file.name}` });
                } else {
                    toast.error({
                        title: `Failed: ${file.name}`,
                        description: result.error || 'Unknown upload error'
                    });
                }
            }

        } catch (error) {
            console.error('Upload error:', error);
            toast.error({
                title: 'Failed to upload images',
                description: error.message
            });
        } finally {
            setUploadingImage(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Remove specific image
    const handleRemoveImage = async (indexToRemove) => {
        const imageToRemove = formData.images[indexToRemove];

        // Optimistically update UI
        const updatedImages = formData.images.filter((_, index) => index !== indexToRemove);
        setFormData(prev => ({
            ...prev,
            images: updatedImages,
            imageUrl: updatedImages.length > 0 ? updatedImages[0] : ''
        }));

        // Try to delete from storage (optional, maybe keep it safe?)
        // For now, let's just remove from product reference
        /*
        try {
            await deleteFile(imageToRemove);
        } catch (error) {
            console.error('Error deleting image file:', error);
        }
        */
    };

    // Handle video preview upload
    const handleVideoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!validTypes.includes(file.type)) {
            toast.error({ title: 'Please upload an MP4, WebM, or MOV video file' });
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast.error({ title: 'Video file must be under 50MB' });
            return;
        }

        setUploadingVideo(true);
        try {
            const result = await uploadFile(file, 'presets/videos');
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    previewVideoUrl: result.url,
                    previewVideoPath: result.publicId || '',
                }));
                toast.success({ title: 'Video preview uploaded!' });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Video upload error:', error);
            toast.error({
                title: 'Failed to upload video',
                description: error.message
            });
        } finally {
            setUploadingVideo(false);
            if (videoInputRef.current) videoInputRef.current.value = '';
        }
    };

    // Handle video thumbnail upload
    const handleVideoThumbnailUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            toast.error({ title: 'Please upload an image file (JPEG, PNG, WEBP, or GIF)' });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error({ title: 'Thumbnail image file must be under 5MB' });
            return;
        }

        setUploadingVideoThumbnail(true);
        try {
            const result = await uploadFile(file, 'presets/thumbnails');
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    previewVideoThumbnailUrl: result.url,
                    previewVideoThumbnailPath: result.publicId || '',
                }));
                toast.success({ title: 'Video thumbnail uploaded!' });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Video thumbnail upload error:', error);
            toast.error({
                title: 'Failed to upload video thumbnail',
                description: error.message
            });
        } finally {
            setUploadingVideoThumbnail(false);
            if (videoThumbnailInputRef.current) videoThumbnailInputRef.current.value = '';
        }
    };

    // Handle DNG file upload
    const handleDngUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // DNG files might have various MIME types
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.dng')) {
            toast.error({ title: 'Please upload a .DNG file' });
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            toast.error({ title: 'DNG file must be under 100MB' });
            return;
        }

        setUploadingDng(true);
        try {
            const result = await uploadFile(file, 'presets/dng');
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    dngFileUrl: result.url,
                    dngFilePath: result.publicId || '',
                }));
                toast.success({ title: `DNG file uploaded! (${(file.size / 1024 / 1024).toFixed(1)} MB)` });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('DNG upload error:', error);
            toast.error({
                title: 'Failed to upload DNG file',
                description: error.message
            });
        } finally {
            setUploadingDng(false);
            if (dngInputRef.current) dngInputRef.current.value = '';
        }
    };

    // Handle Bookmark PDF upload
    const handleBookmarkPdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.pdf')) {
            toast.error({ title: 'Please upload a .PDF file' });
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast.error({ title: 'PDF file must be under 50MB' });
            return;
        }

        setUploadingBookmarkPdf(true);
        try {
            const result = await uploadFile(file, 'bookmarks/pdf');
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    bookmarkPdfUrl: result.url,
                    bookmarkPdfPath: result.publicId || '',
                }));
                toast.success({ title: `Bookmark PDF uploaded! (${(file.size / 1024 / 1024).toFixed(1)} MB)` });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Bookmark PDF upload error:', error);
            toast.error({
                title: 'Failed to upload Bookmark PDF',
                description: error.message
            });
        } finally {
            setUploadingBookmarkPdf(false);
            if (bookmarkPdfInputRef.current) bookmarkPdfInputRef.current.value = '';
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
            errors.basePrice = 'Valid base price is required';
        }
        if (formData.discountPercent && (parseFloat(formData.discountPercent) < 0 || parseFloat(formData.discountPercent) >= 100)) {
            errors.discountPercent = 'Discount must be between 0 and 99';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const bp = parseFloat(formData.basePrice);
            const dp = formData.discountPercent ? parseFloat(formData.discountPercent) : 0;
            
            let finalPrice = bp;
            let finalCompareAtPrice = null;
            
            if (dp > 0) {
                finalPrice = Math.round(bp * (1 - (dp / 100)));
                finalCompareAtPrice = bp;
            }
            
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: finalPrice,
                compareAtPrice: finalCompareAtPrice,
                category: formData.category,
                imageUrl: formData.imageUrl, // Kept for backward compatibility
                images: formData.images, // New array
                canvaLink: formData.canvaLink,
                featured: formData.featured,
                specifications: formData.specifications,
                previewVideoUrl: formData.previewVideoUrl || null,
                previewVideoPath: formData.previewVideoPath || null,
                previewVideoThumbnailUrl: formData.previewVideoThumbnailUrl || null,
                previewVideoThumbnailPath: formData.previewVideoThumbnailPath || null,
                dngFileUrl: formData.dngFileUrl || null,
                dngFilePath: formData.dngFilePath || null,
                bookmarkPdfUrl: formData.bookmarkPdfUrl || null,
                bookmarkPdfPath: formData.bookmarkPdfPath || null,
            };

            let result;
            if (isEditing && editingProduct) {
                result = await updateProduct(editingProduct.id, productData);
            } else {
                result = await createProduct(productData);
            }

            if (result.success) {
                toast.success({
                    title: isEditing ? 'Product updated!' : 'Product created!',
                });

                // Refresh products
                const loadResult = await getAllProducts();
                if (loadResult.success) {
                    setProducts(loadResult.products);
                }

                closeModal();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error({ title: isEditing ? 'Failed to update product' : 'Failed to create product' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (product) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }

        try {
            const result = await deleteProduct(product.id);
            if (result.success) {
                toast.success({ title: 'Product deleted!' });
                setProducts(prev => prev.filter(p => p.id !== product.id));
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error({ title: 'Failed to delete product' });
        }
    };

    // Handle toggle featured
    const handleToggleFeatured = async (product, e) => {
        e.stopPropagation(); // Prevent opening edit modal
        const newFeaturedStatus = !product.featured;

        // Optimistic update
        setProducts(prev => prev.map(p =>
            p.id === product.id ? { ...p, featured: newFeaturedStatus } : p
        ));

        try {
            const result = await updateProduct(product.id, { featured: newFeaturedStatus });
            if (result.success) {
                toast.success({
                    title: newFeaturedStatus ? 'Product added to featured' : 'Product removed from featured',
                    variant: 'success'
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Toggle featured error:', error);
            toast.error({ title: 'Failed to update status' });
            // Revert on error
            setProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, featured: !newFeaturedStatus } : p
            ));
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <Loader size="lg" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">Products</h1>
                        <p className="text-gray-400">{products.length} total products</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search products..."
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-gray-900 border-gray-700 text-white"
                    />
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <Card key={product.id} className="border-gray-800 bg-gray-900/50 overflow-hidden">
                                {/* Product Image */}
                                <div className="relative aspect-square bg-gray-800">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized={true}
                                            priority={true}
                                            style={{ opacity: 1 }}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ImagePlus className="h-12 w-12 text-gray-600" />
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => handleToggleFeatured(product, e)}
                                        className={cn(
                                            "absolute right-2 top-2 rounded-full p-1.5 transition-colors shadow-sm backdrop-blur-sm",
                                            product.featured
                                                ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                                                : "bg-black/20 text-gray-400 hover:bg-black/40 hover:text-gray-200"
                                        )}
                                        title={product.featured ? "Remove from Featured" : "Add to Featured"}
                                    >
                                        <Star className={cn("h-4 w-4", product.featured && "fill-yellow-500")} />
                                    </button>
                                </div>

                                {/* Product Info */}
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-400 capitalize">{product.category?.replace(/-/g, ' ')}</p>
                                    <p className="mt-2 text-lg font-bold text-purple-400">
                                        {formatPrice(product.price)}
                                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                                            <span className="ml-2 text-sm text-gray-500 line-through font-normal">
                                                {formatPrice(product.compareAtPrice)}
                                            </span>
                                        )}
                                    </p>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <span className="inline-flex items-center mt-1 text-xs font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                                            SALE: {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                                        </span>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-gray-700 text-gray-300"
                                            onClick={() => openEditModal(product)}
                                        >
                                            <Edit className="mr-1 h-3 w-3" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-800 text-red-400 hover:bg-red-900/20"
                                            onClick={() => handleDelete(product)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-gray-800 bg-gray-900/50">
                        <CardContent className="py-16 text-center">
                            <ImagePlus className="mx-auto h-16 w-16 text-gray-600" />
                            <h2 className="mt-4 text-xl font-semibold text-white">No Products</h2>
                            <p className="mt-2 text-gray-400">
                                {searchQuery ? 'No products match your search.' : 'Add your first product to get started.'}
                            </p>
                            {!searchQuery && (
                                <Button className="mt-6" onClick={openCreateModal}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-gray-800"
                        >
                            <div className="flex items-center justify-between border-b border-gray-800 p-4">
                                <h2 className="text-xl font-bold text-white">
                                    {isEditing ? 'Edit Product' : 'Add Product'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <Label className="text-gray-300">Product Images</Label>
                                    <div className="mt-2 space-y-3">
                                        {/* Gallery Grid */}
                                        {formData.images && formData.images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {formData.images.map((img, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700 group">
                                                        <Image
                                                            src={img}
                                                            alt={`Preview ${index}`}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized={true}
                                                            priority={true}
                                                            style={{ opacity: 1 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                        {index === 0 && (
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                                                Main
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingImage}
                                            className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors"
                                        >
                                            {uploadingImage ? (
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                            ) : (
                                                <div className="text-center">
                                                    <ImagePlus className="mx-auto h-8 w-8 mb-2" />
                                                    <span>Click to upload images</span>
                                                    <p className="text-xs text-gray-500 mt-1">Add multiple images</p>
                                                </div>
                                            )}
                                        </button>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple // Allow multiple selection
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <Label htmlFor="name" className="text-gray-300">Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Product name"
                                        error={formErrors.name}
                                        className="mt-1 bg-gray-800 border-gray-700 text-white"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Product description"
                                        rows={3}
                                        className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                {/* Price & Discount Row */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="basePrice" className="text-gray-300">Base Price (PKR) *</Label>
                                        <Input
                                            id="basePrice"
                                            name="basePrice"
                                            type="number"
                                            value={formData.basePrice}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            error={formErrors.basePrice}
                                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="discountPercent" className="text-gray-300">
                                            Discount Percentage (%)
                                        </Label>
                                        <Input
                                            id="discountPercent"
                                            name="discountPercent"
                                            type="number"
                                            value={formData.discountPercent}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 10, 20, 50"
                                            error={formErrors.discountPercent}
                                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                                        />
                                    </div>
                                    
                                    {/* Final Calculated Price Display */}
                                    <div className="sm:col-span-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-400">Final Sale Price:</span>
                                        <span className="text-lg font-bold text-pink-500">
                                            Rs {formData.basePrice && !isNaN(formData.basePrice) 
                                                ? Math.round(parseFloat(formData.basePrice) * (1 - (parseFloat(formData.discountPercent) || 0) / 100))
                                                : '0'}
                                        </span>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <Label htmlFor="category" className="text-gray-300">Category</Label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="capitalize">
                                                {cat.replace(/-/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Featured Toggle */}
                                <div>
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-700 bg-gray-800 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="text-gray-300">Featured Product</span>
                                    </label>
                                </div>

                                {/* === Preset-Specific Uploads (only for lightroom-templates) === */}
                                {formData.category === 'lightroom-templates' && (
                                    <div className="space-y-4 border-t border-gray-700 pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Film className="h-5 w-5 text-cyan-400" />
                                            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Preset Files</h3>
                                        </div>

                                        {/* Video Preview & Thumbnail Upload Row */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Video Preview Upload */}
                                            <div>
                                                <Label className="text-gray-300">Video Preview (5-sec, MP4/WebM)</Label>
                                                <div className="mt-2">
                                                    {formData.previewVideoUrl ? (
                                                        <div className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700 aspect-video">
                                                            <video
                                                                src={formData.previewVideoUrl}
                                                                className="w-full h-full object-cover"
                                                                controls
                                                                muted
                                                                loop
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, previewVideoUrl: '', previewVideoPath: '' }))}
                                                                className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 transition-colors z-10"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => videoInputRef.current?.click()}
                                                            disabled={uploadingVideo}
                                                            className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                                                        >
                                                            {uploadingVideo ? (
                                                                <Loader2 className="h-8 w-8 animate-spin" />
                                                            ) : (
                                                                <div className="text-center">
                                                                    <Video className="mx-auto h-6 w-6 mb-1 text-cyan-400" />
                                                                    <span className="text-xs">Upload Video</span>
                                                                    <p className="text-[10px] text-gray-500 mt-0.5">MP4, WebM • Max 50MB</p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={videoInputRef}
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/quicktime"
                                                        onChange={handleVideoUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>

                                            {/* Video Thumbnail Upload */}
                                            <div>
                                                <Label className="text-gray-300">Video Thumbnail Image</Label>
                                                <div className="mt-2">
                                                    {formData.previewVideoThumbnailUrl ? (
                                                        <div className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700 aspect-video">
                                                            <Image
                                                                src={formData.previewVideoThumbnailUrl}
                                                                alt="Video Thumbnail"
                                                                fill
                                                                className="object-cover"
                                                                unoptimized={true}
                                                                priority={true}
                                                                style={{ opacity: 1 }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, previewVideoThumbnailUrl: '', previewVideoThumbnailPath: '' }))}
                                                                className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 transition-colors z-10"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => videoThumbnailInputRef.current?.click()}
                                                            disabled={uploadingVideoThumbnail}
                                                            className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                                                        >
                                                            {uploadingVideoThumbnail ? (
                                                                <Loader2 className="h-8 w-8 animate-spin" />
                                                            ) : (
                                                                <div className="text-center">
                                                                    <ImagePlus className="mx-auto h-6 w-6 mb-1 text-cyan-400" />
                                                                    <span className="text-xs">Upload Thumbnail</span>
                                                                    <p className="text-[10px] text-gray-500 mt-0.5">JPEG, PNG • Max 5MB</p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    )}
                                                    <input
                                                        ref={videoThumbnailInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleVideoThumbnailUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* DNG File Upload */}
                                        <div>
                                            <Label className="text-gray-300">DNG Preset File</Label>
                                            <div className="mt-2">
                                                {formData.dngFileUrl ? (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-green-700/50">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/20 text-green-400">
                                                            <FileDown className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-green-400">DNG File Uploaded ✓</p>
                                                            <p className="text-xs text-gray-500 truncate">{formData.dngFileUrl.split('/').pop()}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, dngFileUrl: '', dngFilePath: '' }))}
                                                            className="text-red-400 hover:text-red-300 p-1"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => dngInputRef.current?.click()}
                                                        disabled={uploadingDng}
                                                        className="flex w-full items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                                                    >
                                                        {uploadingDng ? (
                                                            <Loader2 className="h-6 w-6 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <FileDown className="h-6 w-6" />
                                                                <div className="text-left">
                                                                    <span className="block">Upload DNG Preset File</span>
                                                                    <span className="text-xs text-gray-500">.dng • Max 100MB • Sent via email to buyer</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <input
                                                    ref={dngInputRef}
                                                    type="file"
                                                    accept=".dng"
                                                    onChange={handleDngUpload}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* === Bookmark-Specific Upload (only for bookmarks) === */}
                                {formData.category === 'bookmarks' && (
                                    <div className="space-y-4 border-t border-gray-700 pt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileDown className="h-5 w-5 text-pink-400" />
                                            <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider">Bookmark PDF File</h3>
                                        </div>

                                        <div>
                                            <Label className="text-gray-300">Bookmark PDF <span className="text-pink-400">(Sent to customer on order confirm)</span></Label>
                                            <div className="mt-2">
                                                {formData.bookmarkPdfUrl ? (
                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-pink-700/50">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600/20 text-pink-400">
                                                            <FileDown className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-pink-400">PDF Uploaded ✓</p>
                                                            <p className="text-xs text-gray-500 truncate">{formData.bookmarkPdfUrl.split('/').pop()}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, bookmarkPdfUrl: '', bookmarkPdfPath: '' }))}
                                                            className="text-red-400 hover:text-red-300 p-1"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => bookmarkPdfInputRef.current?.click()}
                                                        disabled={uploadingBookmarkPdf}
                                                        className="flex w-full items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 text-gray-400 hover:border-pink-500 hover:text-pink-400 transition-colors"
                                                    >
                                                        {uploadingBookmarkPdf ? (
                                                            <Loader2 className="h-6 w-6 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <FileDown className="h-6 w-6" />
                                                                <div className="text-left">
                                                                    <span className="block">Upload Bookmark PDF</span>
                                                                    <span className="text-xs text-gray-500">.pdf • Max 50MB • Attached in email to buyer</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <input
                                                    ref={bookmarkPdfInputRef}
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleBookmarkPdfUpload}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-gray-700 text-gray-300"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditing ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
