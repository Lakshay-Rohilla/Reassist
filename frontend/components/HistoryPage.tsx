'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    FileText,
    Clock,
    ChevronRight,
    Loader2,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { useAuth } from './auth';
import { getResearchHistory, searchQueries, DbResearchQuery } from '@/lib/database';

interface QueryWithReport extends DbResearchQuery {
    research_reports?: Array<{
        id: string;
        executive_summary: string | null;
        research_duration: number | null;
        created_at: string;
    }>;
}

const statusConfig = {
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Completed' },
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
    researching: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
};

export function HistoryPage() {
    const [queries, setQueries] = useState<QueryWithReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadHistory();
        }
    }, [user]);

    const loadHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getResearchHistory(user.id);
            setQueries(data || []);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!user || !searchTerm.trim()) {
            loadHistory();
            return;
        }
        setLoading(true);
        try {
            const data = await searchQueries(user.id, searchTerm);
            setQueries(data || []);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQueries = queries.filter(q => {
        if (filter === 'completed') return q.status === 'completed';
        if (filter === 'pending') return q.status === 'pending' || q.status === 'researching';
        return true;
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Sign in required</h2>
                    <p className="text-slate-600 mb-4">Please sign in to view your research history.</p>
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Research History</h1>
                <p className="text-slate-600">Browse and search your past research queries</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search your research..."
                        className="input-field pl-10 pr-20"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Search
                    </button>
                </div>

                <div className="flex gap-2">
                    {(['all', 'completed', 'pending'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredQueries.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No research found</h3>
                    <p className="text-slate-600 mb-4">
                        {searchTerm ? 'Try a different search term' : 'Start your first research!'}
                    </p>
                    <Link href="/" className="btn-primary">
                        New Research
                    </Link>
                </div>
            )}

            {/* Query List */}
            {!loading && filteredQueries.length > 0 && (
                <div className="space-y-4">
                    {filteredQueries.map((query, index) => {
                        const status = statusConfig[query.status] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        const report = query.research_reports?.[0];

                        return (
                            <motion.div
                                key={query.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={report ? `/report/${report.id}` : '#'}
                                    className={`block glass-card rounded-xl p-5 hover:shadow-lg transition-all duration-200 ${!report ? 'opacity-75 cursor-default' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className={`p-2 rounded-lg ${status.bg}`}>
                                            <StatusIcon className={`w-5 h-5 ${status.color} ${query.status === 'researching' ? 'animate-spin' : ''
                                                }`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                                                    {status.label}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(query.created_at)}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-medium text-slate-800 mb-2 line-clamp-2">
                                                {query.question}
                                            </h3>

                                            {report?.executive_summary && (
                                                <p className="text-sm text-slate-600 line-clamp-2">
                                                    {report.executive_summary.slice(0, 150)}...
                                                </p>
                                            )}

                                            {report?.research_duration && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Completed in {report.research_duration}s</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow */}
                                        {report && (
                                            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
