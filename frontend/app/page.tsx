'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useResearch } from '@/hooks/use-research';
import { ResearchInput } from '@/components/ResearchInput';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ResearchReport } from '@/components/ResearchReport';

/**
 * Home page - Main research interface
 */
export default function HomePage() {
    const {
        state,
        startResearch,
        submitFollowUp,
        reset,
        isIdle,
        isResearching,
        isCompleted
    } = useResearch();

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {/* Idle State - Show Input */}
                    {isIdle && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ResearchInput onSubmit={startResearch} />
                        </motion.div>
                    )}

                    {/* Researching State - Show Progress */}
                    {isResearching && state.currentQuestion && (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ProgressIndicator
                                question={state.currentQuestion.text}
                                updates={state.progressUpdates}
                                sourcesAnalyzed={state.sourcesAnalyzed}
                            />
                        </motion.div>
                    )}

                    {/* Completed State - Show Report */}
                    {isCompleted && state.currentReport && (
                        <motion.div
                            key="report"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ResearchReport
                                report={state.currentReport}
                                onFollowUp={submitFollowUp}
                                onNewResearch={reset}
                            />
                        </motion.div>
                    )}

                    {/* Error State */}
                    {state.phase === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="max-w-xl mx-auto text-center py-20"
                        >
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
                                <h2 className="text-xl font-semibold text-red-800 mb-2">
                                    Research Error
                                </h2>
                                <p className="text-red-600 mb-6">{state.error}</p>
                                <button
                                    onClick={reset}
                                    className="btn-primary bg-red-600 hover:bg-red-500"
                                >
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-slate-400 bg-gradient-to-t from-white to-transparent">
                <p>
                    ReAssist — AI-Powered Research Assistant • Built for Enterprise Intelligence
                </p>
            </footer>
        </main>
    );
}
