'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FileText,
    Clock,
    Bookmark,
    TrendingUp,
    Search as SearchIcon,
    ArrowRight,
    Loader2,
    BarChart3,
    Calendar,
    Database
} from 'lucide-react';
import { useAuth } from './auth';
import { getResearchHistory, getSavedReports, getUserStats } from '@/lib/database';

export function DashboardPage() {
    const [stats, setStats] = useState({
        totalQueries: 0,
        completedQueries: 0,
        savedReports: 0,
        queriesThisMonth: 0,
    });
    const [recentQueries, setRecentQueries] = useState<any[]>([]);
    const [savedReports, setSavedReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isConfigured } = useAuth();

    const loadDashboardData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [statsData, historyData, savedData] = await Promise.all([
                getUserStats(user.id),
                getResearchHistory(user.id, 5),
                getSavedReports(user.id),
            ]);

            setStats(statsData);
            setRecentQueries(historyData || []);
            setSavedReports(savedData?.slice(0, 5) || []);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && isConfigured) {
            loadDashboardData();
        } else {
            setLoading(false);
        }
    }, [user, isConfigured, loadDashboardData]);

    const statCards = [
        {
            label: 'Total Queries',
            value: stats.totalQueries,
            icon: SearchIcon,
            color: 'from-blue-500 to-blue-600',
            textColor: 'text-blue-600'
        },
        {
            label: 'Completed',
            value: stats.completedQueries,
            icon: FileText,
            color: 'from-green-500 to-green-600',
            textColor: 'text-green-600'
        },
        {
            label: 'Saved Reports',
            value: stats.savedReports,
            icon: Bookmark,
            color: 'from-purple-500 to-purple-600',
            textColor: 'text-purple-600'
        },
        {
            label: 'This Month',
            value: stats.queriesThisMonth,
            icon: Calendar,
            color: 'from-orange-500 to-orange-600',
            textColor: 'text-orange-600'
        },
    ];

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
                    <div className="text-left bg-slate-50 rounded-lg p-4 text-sm font-mono">
                        <p className="text-slate-600">NEXT_PUBLIC_SUPABASE_URL=...</p>
                        <p className="text-slate-600">NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Sign in required</h2>
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
                <p className="text-slate-600">Overview of your research activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-xl p-5"
                    >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Research */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Recent Research</h2>
                        <Link
                            href="/history"
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {recentQueries.length === 0 ? (
                        <div className="text-center py-8">
                            <SearchIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No research yet</p>
                            <Link href="/" className="text-primary-600 text-sm mt-2 inline-block">
                                Start your first research
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentQueries.map((query) => (
                                <Link
                                    key={query.id}
                                    href={query.research_reports?.[0]?.id ? `/report/${query.research_reports[0].id}` : '#'}
                                    className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1 mb-1">
                                        {query.question}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(query.created_at).toLocaleDateString()}</span>
                                        <span className={`px-2 py-0.5 rounded-full ${query.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {query.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Saved Reports */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Saved Reports</h2>
                        <Link
                            href="/saved"
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {savedReports.length === 0 ? (
                        <div className="text-center py-8">
                            <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No saved reports</p>
                            <p className="text-slate-400 text-sm mt-1">
                                Bookmark reports to access them quickly
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {savedReports.map((saved) => (
                                <Link
                                    key={saved.id}
                                    href={`/report/${saved.report_id}`}
                                    className="block p-3 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1 mb-1">
                                        {saved.research_reports?.research_queries?.question || 'Untitled'}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Bookmark className="w-3 h-3" />
                                        <span>Saved {new Date(saved.saved_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 glass-card rounded-xl p-6"
            >
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-shadow"
                    >
                        <SearchIcon className="w-6 h-6" />
                        <div>
                            <p className="font-medium">New Research</p>
                            <p className="text-sm text-primary-100">Start a new query</p>
                        </div>
                    </Link>
                    <Link
                        href="/history"
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <Clock className="w-6 h-6 text-slate-600" />
                        <div>
                            <p className="font-medium text-slate-800">View History</p>
                            <p className="text-sm text-slate-500">Browse past research</p>
                        </div>
                    </Link>
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <TrendingUp className="w-6 h-6 text-slate-600" />
                        <div>
                            <p className="font-medium text-slate-800">Settings</p>
                            <p className="text-sm text-slate-500">Manage preferences</p>
                        </div>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
