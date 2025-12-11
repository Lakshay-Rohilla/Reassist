'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { exampleQuestions } from '@/lib/mock-research';

interface ResearchInputProps {
    onSubmit: (question: string) => void;
    isLoading?: boolean;
}

/**
 * ResearchInput component - Welcome screen with research question input
 */
export function ResearchInput({ onSubmit, isLoading = false }: ResearchInputProps) {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onSubmit(question.trim());
        }
    };

    const handleExampleClick = (example: string) => {
        setQuestion(example);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-3xl mx-auto"
        >
            {/* Header */}
            <div className="text-center mb-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-100 rounded-full mb-6"
                >
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-primary-700">
                        AI-Powered Research Assistant
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    <span className="text-gradient">ReAssist</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg text-slate-600 max-w-xl mx-auto"
                >
                    Get comprehensive research reports on market trends, competitive analysis,
                    and technology insights—powered by autonomous AI agents.
                </motion.p>
            </div>

            {/* Input Form */}
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="relative"
            >
                <div className="glass-card rounded-2xl p-2 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-100/50">
                    <div className="relative">
                        <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="What emerging trends or competitive insights are you researching?"
                            className="w-full pl-12 pr-4 py-4 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-slate-800 placeholder:text-slate-400 text-lg min-h-[100px]"
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center justify-between px-2 pb-2">
                        <div className="text-sm text-slate-400">
                            {question.length > 0 && (
                                <span>{question.length} characters</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!question.trim() || isLoading}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Starting Research...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Research</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.form>

            {/* Example Questions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8"
            >
                <p className="text-sm text-slate-500 text-center mb-4">
                    Try an example research question:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {exampleQuestions.map((example, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleExampleClick(example)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50 transition-all duration-200 max-w-xs text-left"
                        >
                            {example.length > 50 ? example.substring(0, 50) + '...' : example}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {[
                    {
                        title: 'Multi-Source Research',
                        description: 'Analyzes academic papers, industry reports, news, and market data',
                    },
                    {
                        title: 'Cited Insights',
                        description: 'Every finding is backed by verifiable sources and references',
                    },
                    {
                        title: 'Follow-Up Questions',
                        description: 'Dive deeper with iterative questions on any topic',
                    },
                ].map((feature, index) => (
                    <div
                        key={index}
                        className="text-center p-6 rounded-xl bg-white/50 border border-slate-100"
                    >
                        <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
                        <p className="text-sm text-slate-500">{feature.description}</p>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
