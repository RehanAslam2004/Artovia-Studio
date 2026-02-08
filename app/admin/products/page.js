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
    Star
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
    'digital-art',
    'social-media',
    'invitations',
    'business',
    'other'
];

// Initial form state
const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: 'wedding-cards',
    imageUrl: '',
    images: [], // Multiple images support
    featured: false,
    specifications: {},
};

export default function AdminProductsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const fileInputRef = useRef(null);

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
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            category: product.category || 'canva-templates',
            imageUrl: product.imageUrl || '',
            images: product.images || (product.imageUrl ? [product.imageUrl] : []),
            canvaLink: product.canvaLink || '',
            featured: product.featured || false,
            specifications: product.specifications || {},
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
            const newImages = [];

            for (const file of files) {
                // Validate file type
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    toast.error({ title: `Skipped invalid file: ${file.name}` });
                    continue;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error({ title: `Skipped large file: ${file.name}` });
                    continue;
                }

                const result = await uploadFile(file, 'products');
                if (result.success) {
                    newImages.push(result.url);
                }
            }

            if (newImages.length > 0) {
                setFormData(prev => {
                    const updatedImages = [...(prev.images || []), ...newImages];
                    return {
                        ...prev,
                        images: updatedImages,
                        imageUrl: updatedImages[0] // Primary image is first one
                    };
                });
                toast.success({ title: `${newImages.length} image(s) uploaded!` });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error({ title: 'Failed to upload images' });
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

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = 'Valid price is required';
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
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category: formData.category,
                imageUrl: formData.imageUrl, // Kept for backward compatibility
                images: formData.images, // New array
                canvaLink: formData.canvaLink,
                featured: formData.featured,
                specifications: formData.specifications,
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
                                    </p>

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

                                {/* Price & Category Row */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="price" className="text-gray-300">Price (PKR) *</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            error={formErrors.price}
                                            className="mt-1 bg-gray-800 border-gray-700 text-white"
                                        />
                                    </div>
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
