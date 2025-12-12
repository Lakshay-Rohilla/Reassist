'use client';

import { motion } from 'framer-motion';
import {
    ExternalLink,
    FileText,
    Newspaper,
    GraduationCap,
    Building2,
    BookOpen,
    Landmark,
    Users,
    TrendingUp,
    Shield,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';
import { Source } from '@/lib/types';

interface SourcesListProps {
    sources: Source[];
}

const typeIcons: Record<string, typeof FileText> = {
    article: BookOpen,
    report: FileText,
    paper: GraduationCap,
    news: Newspaper,
    company: Building2,
    academic: GraduationCap,
    industry: TrendingUp,
    government: Landmark,
    expert: Users,
};

const typeLabels: Record<string, string> = {
    article: 'Article',
    report: 'Report',
    paper: 'Research Paper',
    news: 'News',
    company: 'Company Source',
    academic: 'Academic',
    industry: 'Industry Report',
    government: 'Government',
    expert: 'Expert Opinion',
};

const typeColors: Record<string, string> = {
    article: 'text-blue-600 bg-blue-50 border-blue-100',
    report: 'text-purple-600 bg-purple-50 border-purple-100',
    paper: 'text-green-600 bg-green-50 border-green-100',
    news: 'text-orange-600 bg-orange-50 border-orange-100',
    company: 'text-slate-600 bg-slate-50 border-slate-100',
    academic: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    industry: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    government: 'text-red-600 bg-red-50 border-red-100',
    expert: 'text-cyan-600 bg-cyan-50 border-cyan-100',
};

const reliabilityConfig: Record<string, { icon: typeof Shield; color: string; label: string }> = {
    high: { icon: ShieldCheck, color: 'text-green-600', label: 'High Reliability' },
    medium: { icon: Shield, color: 'text-yellow-600', label: 'Medium Reliability' },
    low: { icon: ShieldAlert, color: 'text-red-600', label: 'Low Reliability' },
};

/**
 * SourcesList component - Renders the references section
 */
export function SourcesList({ sources }: SourcesListProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
        >
            <h2 className="text-2xl font-bold text-slate-800 mb-6" id="sources">
                Sources & References
            </h2>

            <div className="space-y-3">
                {sources.map((source, index) => {
                    const Icon = typeIcons[source.type] || FileText;
                    const label = typeLabels[source.type] || 'Source';
                    const colorClass = typeColors[source.type] || typeColors.article;
                    const reliability = source.reliability ? reliabilityConfig[source.reliability] : null;

                    return (
                        <motion.div
                            key={source.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            id={`source-${source.id}`}
                            className="group flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-200"
                        >
                            {/* Number Badge */}
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors">
                                {source.id}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-slate-800 hover:text-primary-600 transition-colors line-clamp-2"
                                        >
                                            {source.title}
                                        </a>

                                        {/* Description */}
                                        {source.description && (
                                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                {source.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                            {source.author && (
                                                <span>{source.author}</span>
                                            )}
                                            {source.author && source.publishedDate && (
                                                <span>•</span>
                                            )}
                                            {source.publishedDate && (
                                                <span>{source.publishedDate}</span>
                                            )}
                                            {reliability && (
                                                <>
                                                    <span>•</span>
                                                    <span className={`flex items-center gap-1 ${reliability.color}`}>
                                                        <reliability.icon className="w-3.5 h-3.5" />
                                                        {reliability.label}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${colorClass}`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {label}
                                    </div>
                                </div>

                                {/* URL */}
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 mt-2 text-xs text-slate-400 hover:text-primary-500 truncate transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{source.url}</span>
                                </a>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-center text-sm text-slate-400 mt-8">
                Total: {sources.length} sources referenced
            </p>
        </motion.div>
    );
}

