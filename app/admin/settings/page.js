'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertTriangle, Shield, Globe, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Mock settings state
    const [settings, setSettings] = useState({
        siteName: 'Artovia Studio',
        supportEmail: 'support@artoviastudio.com',
        maintenanceMode: false,
        orderNotifications: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);

        toast({
            title: 'Settings Saved',
            description: 'Your configuration has been updated successfully.',
            variant: 'success'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-logo">
                    Platform Settings
                </h1>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        <Globe className="h-5 w-5 text-pink-500" />
                        General Information
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Site Name
                            </label>
                            <Input
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                placeholder="Enter site name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Support Email
                            </label>
                            <Input
                                name="supportEmail"
                                value={settings.supportEmail}
                                onChange={handleChange}
                                placeholder="Enter support email"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        <Bell className="h-5 w-5 text-pink-500" />
                        Notifications
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Order Alerts</h3>
                                <p className="text-xs text-gray-500">Receive emails for new orders</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="orderNotifications"
                                    checked={settings.orderNotifications}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                            </label>
                        </div>
                    </div>
                </motion.div>

                {/* System Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 md:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        <Shield className="h-5 w-5 text-pink-500" />
                        System Status
                    </div>

                    <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg">
                        <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Maintenance Mode
                                </h3>
                                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                                    When enabled, the public site will be inaccessible to visitors. Use this only for critical updates.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer ml-3">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
