'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Info, X } from 'lucide-react';
import { Source } from '@/lib/types';

interface CitationProps {
    id: number;
    sources: Source[];
}

/**
 * Citation component - Inline citation with hover tooltip
 */
export function Citation({ id, sources }: CitationProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const source = sources.find(s => s.id === id);

    if (!source) {
        return (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-slate-400 bg-slate-100 rounded">
                [{id}]
            </span>
        );
    }

    return (
        <span className="relative inline-block">
            <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded transition-colors duration-150 cursor-pointer"
                aria-label={`Citation ${id}: ${source.title}`}
            >
                [{id}]
            </button>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
                    >
                        <div className="bg-slate-800 text-white rounded-lg shadow-xl p-3">
                            {/* Arrow */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                <div className="border-8 border-transparent border-t-slate-800" />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-primary-300 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium leading-tight">{source.title}</p>
                                </div>

                                {source.author && (
                                    <p className="text-xs text-slate-300 pl-6">
                                        By {source.author}
                                    </p>
                                )}

                                <p className="text-xs text-slate-400 pl-6">
                                    Published {source.publishedDate}
                                </p>

                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200 pl-6 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    View source
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}

interface InlineCitationsProps {
    citations: number[];
    sources: Source[];
}

/**
 * InlineCitations component - Renders multiple citations inline
 */
export function InlineCitations({ citations, sources }: InlineCitationsProps) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {citations.map((id) => (
                <Citation key={id} id={id} sources={sources} />
            ))}
        </span>
    );
}
