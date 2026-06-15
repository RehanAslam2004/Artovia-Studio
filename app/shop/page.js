'use client';

/**
 * Shop Page
 * =========
 * Product listing page with filters, search, and category navigation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    SlidersHorizontal,
    Grid3X3,
    LayoutList,
    ChevronDown,
    X,
    Sparkles
} from 'lucide-react';
import ProductCard, { ProductCardHorizontal } from '@/components/ProductCard';
import { ProductsGridSkeleton } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getAllProducts, getCategories } from '@/lib/products';
import { cn, debounce } from '@/lib/utils';

// Sort options
const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' },
];

// Default categories
const defaultCategories = [
    { id: 'wedding-cards', name: 'Wedding Cards' },
    { id: 'bundles', name: 'Bundles' },
    { id: 'lightroom-templates', name: 'Lightroom Presets' },
    { id: 'e-books', name: 'E-Books' },
    { id: 'social-media', name: 'Social Media' },
    { id: 'business', name: 'Business' },
    { id: 'occasion-cards', name: 'Occasion Cards' },
];

import { Suspense } from 'react';
import Loader from '@/components/Loader';

function ShopContent() {
    const searchParams = useSearchParams();

    // State
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState(defaultCategories);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get('category') || ''
    );
    const [sortBy, setSortBy] = useState('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Fetch products on mount
    useEffect(() => {
        async function loadData() {
            try {
                const [productsResult, categoriesResult] = await Promise.all([
                    getAllProducts(),
                    getCategories()
                ]);

                setProducts(productsResult.products);
                if (categoriesResult.categories.length > 0) {
                    // Merge with default categories
                    const uniqueCategories = [...new Set([
                        ...defaultCategories.map(c => c.id),
                        ...categoriesResult.categories
                    ])].map(id => {
                        const defaultCat = defaultCategories.find(c => c.id === id);
                        return {
                            id,
                            name: defaultCat?.name || id.replace(/-/g, ' '),
                            ...defaultCat // Preserve all properties like comingSoon
                        };
                    });
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    // Filter and sort products
    useEffect(() => {
        let result = [...products];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                product =>
                    product.name?.toLowerCase().includes(query) ||
                    product.description?.toLowerCase().includes(query) ||
                    product.category?.toLowerCase().includes(query)
            );
        }

        // Filter by category
        if (selectedCategory) {
            result = result.filter(
                product => product.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Sort products
        switch (sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name-az':
                result.sort((a, b) => a.name?.localeCompare(b.name));
                break;
            case 'name-za':
                result.sort((a, b) => b.name?.localeCompare(a.name));
                break;
        }

        setFilteredProducts(result);
    }, [products, searchQuery, selectedCategory, sortBy]);

    // Debounced search handler
    const handleSearch = useCallback(
        debounce((value) => {
            setSearchQuery(value);
        }, 300),
        []
    );

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSortBy('newest');
    };

    const activeFiltersCount = [searchQuery, selectedCategory].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                            Shop Our Collection
                        </h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Discover premium digital designs for every occasion
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Toolbar */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search designs..."
                            className="pl-10"
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Filter Toggle (Mobile) */}
                        <Button
                            variant="outline"
                            className="lg:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge className="ml-2">{activeFiltersCount}</Badge>
                            )}
                        </Button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="min-w-[160px] justify-between"
                            >
                                {sortOptions.find(o => o.value === sortBy)?.label || 'Sort'}
                                <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>

                            <AnimatePresence>
                                {showSortDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-20 dark:border-gray-800 dark:bg-gray-950"
                                    >
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortBy(option.value);
                                                    setShowSortDropdown(false);
                                                }}
                                                className={cn(
                                                    'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800',
                                                    sortBy === option.value
                                                        ? 'text-purple-600 font-medium'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'p-2 rounded-md transition-colors',
                                    viewMode === 'grid'
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                )}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'p-2 rounded-md transition-colors',
                                    viewMode === 'list'
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                )}
                            >
                                <LayoutList className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                    {/* Sidebar Filters */}
                    <aside
                        className={cn(
                            'space-y-6',
                            showFilters ? 'block' : 'hidden lg:block'
                        )}
                    >
                        {/* Categories */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                                Categories
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={cn(
                                        'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                        !selectedCategory
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    )}
                                >
                                    All Products
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={cn(
                                            'w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors capitalize group',
                                            selectedCategory === category.id
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                        )}
                                    >
                                        <span>{category.name}</span>
                                        {category.comingSoon && (
                                            <span className="text-[10px] font-bold text-pink-500 bg-pink-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                Coming Soon
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={clearFilters}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </aside>

                    {/* Products Grid */}
                    <div>
                        {/* Results Count */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {filteredProducts.length} of {products.length} products
                            </p>

                            {/* Active Filters */}
                            {(searchQuery || selectedCategory) && (
                                <div className="flex items-center gap-2">
                                    {searchQuery && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: {searchQuery}
                                            <button onClick={() => setSearchQuery('')}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                    {selectedCategory && (
                                        <Badge variant="secondary" className="gap-1 capitalize">
                                            {selectedCategory.replace(/-/g, ' ')}
                                            <button onClick={() => setSelectedCategory('')}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Products */}
                        {(() => {
                            // detailed check for coming soon
                            const currentCategory = categories.find(c => c.id === selectedCategory);

                            if (loading) {
                                return <ProductsGridSkeleton count={8} />;
                            }

                            if (currentCategory?.comingSoon) {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-sm"
                                    >
                                        <div className="mb-6 relative">
                                            <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full" />
                                            <Sparkles className="relative h-16 w-16 text-pink-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {currentCategory.name} are Coming Soon!
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                                            We're working hard to bring you an amazing collection of {currentCategory.name.toLowerCase()}.
                                            Stay tuned for updates!
                                        </p>
                                        <Button
                                            onClick={clearFilters}
                                            variant="outline"
                                            className="border-pink-200 text-pink-600 hover:bg-pink-50"
                                        >
                                            View Other Categories
                                        </Button>
                                    </motion.div>
                                );
                            }

                            return filteredProducts.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {filteredProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredProducts.map((product) => (
                                            <ProductCardHorizontal key={product.id} product={product} />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 dark:border-gray-700 dark:bg-gray-900"
                                >
                                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                        <Search className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        No products found
                                    </h3>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                                        Try adjusting your search or filters
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={clearFilters}
                                    >
                                        Clear Filters
                                    </Button>
                                </motion.div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
