/**
 * Products Management Utilities
 * =============================
 * This file provides functions for managing products including CRUD operations,
 * filtering, and search functionality.
 * 
 * When Firebase is not configured, mock data is returned for development preview.
 */

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Mock data for demo mode
const mockProducts = [
    {
        id: 'mock-1',
        name: 'Elegant Wedding Card Design',
        description: 'A beautiful, elegant wedding invitation card template with modern design elements.',
        price: 2500,
        category: 'wedding-cards',
        imageUrl: '/images/placeholder-product.jpg',
        featured: true,
        status: 'active',
        specifications: {
            format: 'PSD, AI, PDF',
            size: '5x7 inches',
            layers: 'Fully Editable'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'mock-2',
        name: 'Modern Business Card Template',
        description: 'Professional business card design with clean, modern aesthetics.',
        price: 1500,
        category: 'business',
        imageUrl: '/images/placeholder-product.jpg',
        featured: true,
        status: 'active',
        specifications: {
            format: 'PSD, AI',
            size: '3.5x2 inches',
            layers: 'Fully Editable'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'mock-3',
        name: 'Social Media Post Bundle',
        description: 'Complete social media design pack with 50+ customizable templates.',
        price: 3500,
        category: 'social-media',
        imageUrl: '/images/placeholder-product.jpg',
        featured: true,
        status: 'active',
        specifications: {
            format: 'PSD, Canva',
            size: 'Multiple sizes',
            templates: '50+ designs'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'mock-4',
        name: 'Luxury Invitation Suite',
        description: 'Premium wedding invitation suite with matching RSVP and details cards.',
        price: 4500,
        category: 'wedding-cards',
        imageUrl: '/images/placeholder-product.jpg',
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'mock-5',
        name: 'Digital Art Collection',
        description: 'Beautiful digital art pieces perfect for home decoration.',
        price: 2000,
        category: 'digital-art',
        imageUrl: '/images/placeholder-product.jpg',
        featured: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'mock-6',
        name: 'Birthday Invitation Pack',
        description: 'Fun and colorful birthday invitation templates for all ages.',
        price: 1800,
        category: 'invitations',
        imageUrl: '/images/placeholder-product.jpg',
        featured: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

/**
 * Get all products
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Array of products
 */
export async function getAllProducts(options = {}) {
    if (!isFirebaseConfigured) {
        // Return mock data in demo mode
        let products = [...mockProducts];
        if (options.limit) {
            products = products.slice(0, options.limit);
        }
        return { success: true, products };
    }

    try {
        const productsCollection = collection(db, 'products');
        let q = query(productsCollection, orderBy('createdAt', 'desc'));

        if (options.limit) {
            q = query(productsCollection, orderBy('createdAt', 'desc'), limit(options.limit));
        }

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
        }));

        return { success: true, products };
    } catch (error) {
        console.error('Get all products error:', error);
        return { success: false, error: error.message, products: [] };
    }
}

/**
 * Get featured products
 * @param {number} limitCount - Number of products to fetch
 * @returns {Promise<Object>} - Array of featured products
 */
export async function getFeaturedProducts(limitCount = 8) {
    if (!isFirebaseConfigured) {
        // Return mock featured products
        const featured = mockProducts.filter(p => p.featured).slice(0, limitCount);
        return { success: true, products: featured };
    }

    try {
        const productsCollection = collection(db, 'products');
        const q = query(
            productsCollection,
            where('featured', '==', true),
            // orderBy('createdAt', 'desc'), // Removing orderBy to avoid index requirement for now
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
        }));

        return { success: true, products };
    } catch (error) {
        console.error('Get featured products error:', error);
        return { success: false, error: error.message, products: [] };
    }
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Promise<Object>} - Array of products in category
 */
export async function getProductsByCategory(category) {
    if (!isFirebaseConfigured) {
        const products = mockProducts.filter(p => p.category === category);
        return { success: true, products };
    }

    try {
        const productsCollection = collection(db, 'products');
        const q = query(
            productsCollection,
            where('category', '==', category),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
        }));

        return { success: true, products };
    } catch (error) {
        console.error('Get products by category error:', error);
        return { success: false, error: error.message, products: [] };
    }
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} - Product data
 */
export async function getProductById(productId) {
    if (!isFirebaseConfigured) {
        const product = mockProducts.find(p => p.id === productId);
        if (!product) {
            return { success: false, error: 'Product not found' };
        }
        return { success: true, product };
    }

    try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'Product not found' };
        }

        const data = docSnap.data();
        return {
            success: true,
            product: {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
            }
        };
    } catch (error) {
        console.error('Get product by ID error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Search products by name or description
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} - Array of matching products
 */
export async function searchProducts(searchTerm) {
    try {
        const { products } = await getAllProducts();

        const searchLower = searchTerm.toLowerCase();
        const filtered = products.filter(product =>
            product.name?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.category?.toLowerCase().includes(searchLower)
        );

        return { success: true, products: filtered };
    } catch (error) {
        console.error('Search products error:', error);
        return { success: false, error: error.message, products: [] };
    }
}

/**
 * Upload image to Cloudinary via API route
 * @param {File} file - Image file
 * @param {string} folder - Storage folder (products/downloads)
 * @returns {Promise<Object>} - Upload result with URL
 */
export async function uploadFile(file, folder = 'products') {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Upload failed');
        }

        return {
            success: true,
            url: result.url,
            publicId: result.publicId
        };
    } catch (error) {
        console.error('Upload file error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Success status
 */
export async function deleteFile(publicId) {
    if (!publicId) {
        return { success: true }; // No-op if no publicId
    }

    try {
        const response = await fetch('/api/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId }),
        });

        const result = await response.json();
        return { success: result.success };
    } catch (error) {
        console.error('Delete file error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Create a new product (Admin only)
 * @param {Object} productData - Product details
 * @returns {Promise<Object>} - Created product
 */
export async function createProduct(productData) {
    if (!isFirebaseConfigured || !db) {
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase to create products.'
        };
    }

    try {
        const productId = uuidv4();
        const product = {
            id: productId,
            name: productData.name,
            description: productData.description || '',
            price: parseFloat(productData.price),
            category: productData.category,
            imageUrl: productData.imageUrl || '',
            imagePath: productData.imagePath || null,
            downloadUrl: productData.downloadUrl || null,
            downloadPath: productData.downloadPath || null,
            canvaLink: productData.canvaLink || null, // New field for Canva Templates
            featured: productData.featured || false,
            tags: productData.tags || [],
            specifications: productData.specifications || {},
            status: productData.status || 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(doc(db, 'products', productId), product);

        return { success: true, product: { ...product, id: productId } };
    } catch (error) {
        console.error('Create product error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing product (Admin only)
 * @param {string} productId - Product ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} - Success status
 */
export async function updateProduct(productId, updateData) {
    if (!isFirebaseConfigured) {
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase to update products.'
        };
    }

    try {
        const docRef = doc(db, 'products', productId);

        if (updateData.price) {
            updateData.price = parseFloat(updateData.price);
        }

        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Update product error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a product (Admin only)
 * @param {string} productId - Product ID
 * @param {Object} product - Product data (for file cleanup)
 * @returns {Promise<Object>} - Success status
 */
export async function deleteProduct(productId, product = null) {
    if (!isFirebaseConfigured) {
        return {
            success: false,
            error: 'Firebase not configured. Please set up Firebase to delete products.'
        };
    }

    try {
        if (product?.imagePath) {
            await deleteFile(product.imagePath);
        }
        if (product?.downloadPath) {
            await deleteFile(product.downloadPath);
        }

        await deleteDoc(doc(db, 'products', productId));

        return { success: true };
    } catch (error) {
        console.error('Delete product error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all categories (unique from products)
 * @returns {Promise<Object>} - Array of unique categories
 */
export async function getCategories() {
    try {
        const { products } = await getAllProducts();
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        return { success: true, categories };
    } catch (error) {
        console.error('Get categories error:', error);
        return { success: false, error: error.message, categories: [] };
    }
}

/**
 * Get product statistics (Admin)
 * @returns {Promise<Object>} - Product statistics
 */
export async function getProductStats() {
    if (!isFirebaseConfigured) {
        // Return mock stats
        return {
            success: true,
            stats: {
                total: mockProducts.length,
                activeProducts: mockProducts.filter(p => p.status === 'active').length,
                featuredProducts: mockProducts.filter(p => p.featured).length,
                categoryCounts: mockProducts.reduce((acc, p) => {
                    acc[p.category] = (acc[p.category] || 0) + 1;
                    return acc;
                }, {})
            }
        };
    }

    try {
        const productsCollection = collection(db, 'products');
        const snapshot = await getDocs(productsCollection);

        let totalProducts = 0;
        let activeProducts = 0;
        let featuredProducts = 0;
        const categoryCounts = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            totalProducts++;

            if (data.status === 'active') {
                activeProducts++;
            }

            if (data.featured) {
                featuredProducts++;
            }

            if (data.category) {
                categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
            }
        });

        return {
            success: true,
            stats: {
                total: totalProducts,
                activeProducts,
                featuredProducts,
                categoryCounts
            }
        };
    } catch (error) {
        console.error('Get product stats error:', error);
        return { success: false, error: error.message };
    }
}
