'use client';

import { motion } from 'framer-motion';
import {
    Clock,
    FileText,
    AlertTriangle,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { ResearchReport as ResearchReportType } from '@/lib/types';
import { Citation, InlineCitations } from './Citation';
import { SourcesList } from './SourcesList';
import { FollowUpInput } from './FollowUpInput';

interface ResearchReportProps {
    report: ResearchReportType;
    onFollowUp: (question: string) => void;
    onNewResearch: () => void;
}

/**
 * Helper function to render content with inline citations
 */
function renderContentWithCitations(
    content: string,
    citations: number[],
    allSources: ResearchReportType['sources']
): React.ReactNode[] {
    // Split content by citation markers like [1], [2], etc.
    const parts = content.split(/(\[\d+\])/g);

    return parts.map((part, index) => {
        const citationMatch = part.match(/\[(\d+)\]/);
        if (citationMatch) {
            const citationId = parseInt(citationMatch[1], 10);
            return <Citation key={index} id={citationId} sources={allSources} />;
        }
        return <span key={index}>{part}</span>;
    });
}

/**
 * ResearchReport component - Displays the complete research findings
 */
export function ResearchReport({
    report,
    onFollowUp,
    onNewResearch
}: ResearchReportProps) {
    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds} seconds`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto"
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 mb-8"
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Sparkles className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Research Complete
                            </h1>
                            <p className="text-sm text-slate-500">
                                Comprehensive analysis ready for review
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onNewResearch}
                        className="btn-secondary text-sm"
                    >
                        New Research
                    </button>
                </div>

                {/* Question */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-slate-500 mb-1">Research Question</p>
                    <p className="text-slate-800 font-medium">{report.question}</p>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Completed in {formatDuration(report.researchDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{report.sources.length} sources analyzed</span>
                    </div>
                </div>
            </motion.div>

            {/* Executive Summary */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full" />
                    <h2 className="text-2xl font-bold text-slate-800">Executive Summary</h2>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 rounded-xl p-6">
                    <div className="prose prose-slate max-w-none">
                        {report.executiveSummary.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Detailed Sections */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-8 mb-10"
            >
                {report.sections.map((section, index) => (
                    <motion.section
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="bg-white rounded-xl border border-slate-100 p-6 hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 font-semibold text-sm rounded-lg">
                                {index + 1}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800">
                                {section.title}
                            </h3>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            {section.content.split('\n\n').map((paragraph, pIndex) => (
                                <p key={pIndex} className="text-slate-600 leading-relaxed mb-4 last:mb-0">
                                    {renderContentWithCitations(paragraph, section.citations, report.sources)}
                                </p>
                            ))}
                        </div>

                        {section.citations.length > 0 && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                <span className="text-xs text-slate-400">Sources cited:</span>
                                <InlineCitations citations={section.citations} sources={report.sources} />
                            </div>
                        )}
                    </motion.section>
                ))}
            </motion.div>

            {/* Knowledge Gaps */}
            {report.knowledgeGaps.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-10"
                >
                    <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-amber-900">
                                Knowledge Gaps & Limitations
                            </h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Areas where information was limited or requires further research
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-2">
                        {report.knowledgeGaps.map((gap, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                                <span className="text-sm text-amber-800">{gap}</span>
                            </li>
                        ))}
                    </ul>
                </motion.section>
            )}

            {/* Sources List */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
            >
                <SourcesList sources={report.sources} />
            </motion.section>

            {/* Follow-up Input */}
            <FollowUpInput onSubmit={onFollowUp} />
        </motion.div>
    );
}
