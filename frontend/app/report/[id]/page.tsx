'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    Bookmark,
    BookmarkCheck,
    Share2,
    FileText,
    ExternalLink,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth';
import { getReportWithCitations, saveReport, unsaveReport, isReportSaved } from '@/lib/database';

interface ReportData {
    id: string;
    executive_summary: string | null;
    detailed_findings: Array<{
        title: string;
        content: string;
        citations?: number[];
    }> | null;
    knowledge_gaps: string[] | null;
    research_duration: number | null;
    created_at: string;
    citations: Array<{
        id: string;
        citation_number: number;
        source_title: string;
        url: string | null;
        author: string | null;
        publication_date: string | null;
        source_type: string | null;
    }>;
    research_queries: {
        question: string;
    };
}

export default function ReportPage() {
    const params = useParams();
    const router = useRouter();
    const reportId = params.id as string;

    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const { user, isConfigured } = useAuth();

    useEffect(() => {
        if (reportId && isConfigured) {
            loadReport();
        } else if (!isConfigured) {
            setLoading(false);
            setError('Database not configured');
        }
    }, [reportId, isConfigured]);

    useEffect(() => {
        if (user && reportId && isConfigured) {
            checkIfSaved();
        }
    }, [user, reportId, isConfigured]);

    const loadReport = async () => {
        setLoading(true);
        try {
            const data = await getReportWithCitations(reportId);
            setReport(data as ReportData);
        } catch (err) {
            console.error('Failed to load report:', err);
            setError('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const checkIfSaved = async () => {
        if (!user) return;
        try {
            const saved = await isReportSaved(user.id, reportId);
            setIsSaved(saved);
        } catch (err) {
            console.error('Failed to check saved status:', err);
        }
    };

    const handleToggleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            if (isSaved) {
                await unsaveReport(user.id, reportId);
                setIsSaved(false);
            } else {
                await saveReport(user.id, reportId);
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Failed to toggle save:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Report Not Found</h2>
                    <p className="text-slate-600 mb-4">{error || 'This report could not be loaded.'}</p>
                    <Link href="/history" className="btn-primary">
                        Back to History
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">
                            {report.research_queries?.question || 'Research Report'}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(report.created_at).toLocaleDateString()}
                            </span>
                            {report.research_duration && (
                                <span>Completed in {report.research_duration}s</span>
                            )}
                            <span>{report.citations?.length || 0} sources</span>
                        </div>
                    </div>

                    {user && (
                        <button
                            onClick={handleToggleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isSaved
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSaved ? (
                                <BookmarkCheck className="w-4 h-4" />
                            ) : (
                                <Bookmark className="w-4 h-4" />
                            )}
                            {isSaved ? 'Saved' : 'Save'}
                        </button>
                    )}
                </div>
            </div>

            {/* Executive Summary */}
            {report.executive_summary && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Executive Summary</h2>
                    <p className="text-slate-700 leading-relaxed">{report.executive_summary}</p>
                </motion.div>
            )}

            {/* Detailed Findings */}
            {report.detailed_findings && report.detailed_findings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Detailed Findings</h2>
                    <div className="space-y-6">
                        {report.detailed_findings.map((section, index) => (
                            <div key={index}>
                                <h3 className="text-md font-medium text-slate-800 mb-2">
                                    {section.title}
                                </h3>
                                <p className="text-slate-700 leading-relaxed">{section.content}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Knowledge Gaps */}
            {report.knowledge_gaps && report.knowledge_gaps.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Knowledge Gaps</h2>
                    <ul className="space-y-2">
                        {report.knowledge_gaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-2 text-slate-700">
                                <span className="text-amber-500 mt-1">•</span>
                                {gap}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Sources */}
            {report.citations && report.citations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card rounded-xl p-6"
                >
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                        Sources ({report.citations.length})
                    </h2>
                    <div className="space-y-3">
                        {report.citations.map((citation) => (
                            <div
                                key={citation.id}
                                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                            >
                                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                                    {citation.citation_number}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800">{citation.source_title}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        {citation.author && <span>{citation.author}</span>}
                                        {citation.publication_date && (
                                            <span>• {citation.publication_date}</span>
                                        )}
                                        {citation.source_type && (
                                            <span className="px-2 py-0.5 bg-slate-200 rounded text-xs">
                                                {citation.source_type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {citation.url && (
                                    <a
                                        href={citation.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 p-2 text-slate-400 hover:text-primary-600 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
