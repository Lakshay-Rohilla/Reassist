'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

interface FollowUpInputProps {
    onSubmit: (question: string) => void;
    isLoading?: boolean;
}

/**
 * FollowUpInput component - Compact input for follow-up questions
 */
export function FollowUpInput({ onSubmit, isLoading = false }: FollowUpInputProps) {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onSubmit(question.trim());
            setQuestion('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 glass-card rounded-2xl p-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Explore Further</h3>
                    <p className="text-sm text-slate-500">
                        Ask a follow-up question to dive deeper into this topic
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What else would you like to know?"
                    className="input-field flex-1"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!question.trim() || isLoading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Ask</span>
                        </>
                    )}
                </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
                {[
                    'What are the key challenges?',
                    'Who are the main competitors?',
                    'What are future predictions?',
                ].map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => setQuestion(suggestion)}
                        className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
