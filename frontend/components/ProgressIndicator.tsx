'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileText,
    Brain,
    Sparkles,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { ProgressUpdate } from '@/lib/types';

interface ProgressIndicatorProps {
    question: string;
    updates: ProgressUpdate[];
    sourcesAnalyzed: number;
}

const typeIcons = {
    info: Brain,
    search: Search,
    analyze: FileText,
    synthesize: Sparkles,
};

const typeColors = {
    info: 'text-slate-500 bg-slate-100',
    search: 'text-blue-500 bg-blue-100',
    analyze: 'text-amber-500 bg-amber-100',
    synthesize: 'text-primary-500 bg-primary-100',
};

/**
 * ProgressIndicator component - Shows real-time research progress
 */
export function ProgressIndicator({
    question,
    updates,
    sourcesAnalyzed
}: ProgressIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl mx-auto"
        >
            {/* Header */}
            <div className="glass-card rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-800 mb-1">
                            Researching Your Question
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            "{question}"
                        </p>
                    </div>
                </div>

                {/* Sources Counter */}
                <div className="mt-6 flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((updates.length / 11) * 100, 100)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{sourcesAnalyzed}</span>
                        <span>sources analyzed</span>
                    </div>
                </div>
            </div>

            {/* Progress Updates */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {updates.map((update, index) => {
                        const Icon = typeIcons[update.type];
                        const colorClass = typeColors[update.type];
                        const isLatest = index === updates.length - 1;

                        return (
                            <motion.div
                                key={update.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                transition={{
                                    duration: 0.4,
                                    ease: 'easeOut',
                                    delay: 0.1
                                }}
                                className={`
                  flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                  ${isLatest
                                        ? 'glass-card border-primary-200 shadow-lg shadow-primary-100/50'
                                        : 'bg-white/50 border-slate-100'
                                    }
                `}
                            >
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    {isLatest ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className={`text-sm ${isLatest ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                                        {update.message}
                                    </p>
                                </div>

                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Helpful Message */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="text-center text-sm text-slate-400 mt-8"
            >
                This typically takes 30-60 seconds for comprehensive research...
            </motion.p>
        </motion.div>
    );
}
