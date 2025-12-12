'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Moon,
    Sun,
    Bell,
    Shield,
    LogOut,
    Loader2,
    Check,
    Monitor,
    Database
} from 'lucide-react';
import { useAuth } from './auth';
import { useTheme } from './ThemeProvider';
import { getUserPreferences, upsertUserPreferences, DbUserPreferences } from '@/lib/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Theme = 'light' | 'dark' | 'system';
type SearchDepth = 'quick' | 'standard' | 'comprehensive';

interface LocalPreferences {
    theme: Theme;
    default_search_depth: SearchDepth;
    email_notifications: boolean;
}

const defaultPreferences: LocalPreferences = {
    theme: 'light',
    default_search_depth: 'standard',
    email_notifications: true,
};

export function SettingsPage() {
    const [preferences, setPreferences] = useState<LocalPreferences>(defaultPreferences);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const { user, isConfigured, signOut } = useAuth();
    const { theme: currentTheme, setTheme } = useTheme();
    const router = useRouter();

    const loadPreferences = useCallback(async () => {
        if (!user || !isConfigured) {
            setLoading(false);
            return;
        }
        try {
            const data = await getUserPreferences(user.id);
            if (data) {
                setPreferences({
                    theme: data.theme || 'light',
                    default_search_depth: data.default_search_depth || 'standard',
                    email_notifications: data.email_notifications ?? true,
                });
                // Sync theme with ThemeProvider
                if (data.theme) {
                    setTheme(data.theme);
                }
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        } finally {
            setLoading(false);
        }
    }, [user, isConfigured, setTheme]);

    useEffect(() => {
        if (user && isConfigured) {
            loadPreferences();
        } else {
            setLoading(false);
        }
    }, [user, isConfigured, loadPreferences]);

    // Sync local preferences with current theme from ThemeProvider
    useEffect(() => {
        setPreferences(prev => ({ ...prev, theme: currentTheme }));
    }, [currentTheme]);

    const updatePreference = async <K extends keyof LocalPreferences>(
        key: K,
        value: LocalPreferences[K]
    ) => {
        // Update local state immediately for responsive UI
        setPreferences(prev => ({ ...prev, [key]: value }));

        // If updating theme, also update ThemeProvider
        if (key === 'theme') {
            setTheme(value as Theme);
        }

        if (!user || !isConfigured) return;

        setSaving(true);
        try {
            await upsertUserPreferences(user.id, { [key]: value } as Partial<DbUserPreferences>);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to update preference:', error);
            // Revert on error
            setPreferences(prev => ({ ...prev, [key]: preferences[key] }));
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    // Check if Supabase is configured
    if (!isConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Database Not Connected</h2>
                    <p className="text-slate-600 mb-4">
                        Supabase is not configured. Please add your Supabase credentials to
                        <code className="bg-slate-100 px-2 py-1 rounded mx-1">.env.local</code>
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Sign in required</h2>
                    <p className="text-slate-600 mb-4">Please sign in to view settings.</p>
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    const depthOptions: { value: SearchDepth; label: string; description: string }[] = [
        { value: 'quick', label: 'Quick', description: 'Fast results, fewer sources' },
        { value: 'standard', label: 'Standard', description: 'Balanced speed and depth' },
        { value: 'comprehensive', label: 'Comprehensive', description: 'Thorough research, more time' },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
                <p className="text-slate-600">Manage your account and preferences</p>
            </div>

            {/* Save Indicator */}
            {(saving || saved) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-20 right-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg z-50 ${saved ? 'bg-green-500 text-white' : 'bg-white text-slate-700'
                        }`}
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            <span>Saved!</span>
                        </>
                    )}
                </motion.div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-500" />
                            Profile
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <p className="text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <p className="text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg">
                                    {user.user_metadata?.full_name || 'Not set'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Member Since</label>
                                <p className="text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Appearance Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Sun className="w-5 h-5 text-primary-500" />
                            Appearance
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                            <div className="grid grid-cols-3 gap-3">
                                {themeOptions.map((option) => {
                                    const isSelected = preferences.theme === option.value;
                                    const IconComponent = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updatePreference('theme', option.value)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <IconComponent className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-slate-500'}`} />
                                            <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-slate-600'}`}>
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Research Preferences */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary-500" />
                            Research Preferences
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Default Search Depth</label>
                            <div className="space-y-2">
                                {depthOptions.map((option) => {
                                    const isSelected = preferences.default_search_depth === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updatePreference('default_search_depth', option.value)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-medium ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>
                                                    {option.label}
                                                </p>
                                                <p className="text-sm text-slate-500">{option.description}</p>
                                            </div>
                                            {isSelected && (
                                                <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card rounded-xl p-6"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-500" />
                            Notifications
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-700">Email Notifications</p>
                                <p className="text-sm text-slate-500">Get notified when research is complete</p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={preferences.email_notifications}
                                onClick={() => updatePreference('email_notifications', !preferences.email_notifications)}
                                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${preferences.email_notifications ? 'bg-primary-500' : 'bg-slate-300'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${preferences.email_notifications ? 'left-7' : 'left-0.5'
                                        }`}
                                />
                            </button>
                        </div>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card rounded-xl p-6 border-red-100"
                    >
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Account</h2>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
