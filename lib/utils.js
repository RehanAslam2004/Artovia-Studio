/**
 * Utility Functions
 * =================
 * Common utility functions used throughout the application.
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 * @param {...any} inputs - Class names or conditional objects
 * @returns {string} - Merged class string
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format price in PKR (Pakistani Rupee)
 * @param {number} price - Price value
 * @returns {string} - Formatted price string
 */
export function formatPrice(price) {
    if (price === null || price === undefined) return 'Rs. 0';

    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Calculate discount percentage
 * @param {number} salePrice - Current (sale) price
 * @param {number} compareAtPrice - Original price before discount
 * @returns {number|null} - Discount percentage or null if no discount
 */
export function getDiscountPercent(salePrice, compareAtPrice) {
    if (!compareAtPrice || !salePrice || compareAtPrice <= salePrice) return null;
    return Math.round(((compareAtPrice - salePrice) / compareAtPrice) * 100);
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
    if (!date) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export function formatDateTime(date) {
    return formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
}

/**
 * Generate slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export function generateSlug(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Pakistani phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Pakistani phone
 */
export function isValidPakistaniPhone(phone) {
    // Accepts formats: 03001234567, +923001234567, 92-300-1234567
    const phoneRegex = /^(\+92|92|0)?[3][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Format as 0300 1234567
    if (digits.length === 11 && digits.startsWith('0')) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    // Format as +92 300 1234567
    if (digits.length === 12 && digits.startsWith('92')) {
        return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    return phone;
}

/**
 * Get order status color
 * @param {string} status - Order status
 * @returns {string} - Tailwind color class
 */
export function getOrderStatusColor(status) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        completed: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get order status label
 * @param {string} status - Order status
 * @returns {string} - Human-readable status
 */
export function getOrderStatusLabel(status) {
    const labels = {
        pending: 'Pending Payment',
        approved: 'Payment Approved',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };
    return labels[status] || status;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if running on client side
 * @returns {boolean} - True if running in browser
 */
export function isClient() {
    return typeof window !== 'undefined';
}

/**
 * Get browser storage (localStorage with SSR safety)
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} - Stored value or default
 */
export function getFromStorage(key, defaultValue = null) {
    if (!isClient()) return defaultValue;
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * Set browser storage (localStorage with SSR safety)
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
export function setToStorage(key, value) {
    if (!isClient()) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Storage error:', error);
    }
}

/**
 * Remove from browser storage
 * @param {string} key - Storage key
 */
export function removeFromStorage(key) {
    if (!isClient()) return;
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Storage error:', error);
    }
}
