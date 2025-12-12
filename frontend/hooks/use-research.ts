'use client';

import { useState, useCallback, useRef } from 'react';
import {
    ResearchState,
    ProgressUpdate,
    ResearchReport,
    ResearchQuestion,
    ConversationEntry
} from '@/lib/types';
import { generateId } from '@/lib/mock-research';
import { useAuth } from '@/components/auth';
import {
    createResearchQuery,
    updateQueryStatus,
    saveResearchReport,
    getUserPreferences
} from '@/lib/database';

const initialState: ResearchState = {
    phase: 'idle',
    currentQuestion: null,
    progressUpdates: [],
    currentReport: null,
    conversationHistory: [],
    error: null,
    sourcesAnalyzed: 0,
};

// Progress messages to show during research
const progressSteps = [
    { message: 'Analyzing your research question...', type: 'analyze' as const },
    { message: 'Searching for relevant information...', type: 'search' as const },
    { message: 'Evaluating source credibility...', type: 'analyze' as const },
    { message: 'Cross-referencing data points...', type: 'analyze' as const },
    { message: 'Synthesizing findings...', type: 'synthesize' as const },
    { message: 'Generating comprehensive report...', type: 'synthesize' as const },
];

/**
 * Custom hook for managing research state
 * Uses real OpenAI API for research generation
 */
export function useResearch() {
    const [state, setState] = useState<ResearchState>(initialState);
    const [currentQueryId, setCurrentQueryId] = useState<string | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth();

    /**
     * Clear progress interval
     */
    const clearProgress = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    }, []);

    /**
     * Add a progress update to the state
     */
    const addProgressUpdate = useCallback((update: ProgressUpdate) => {
        setState(prev => ({
            ...prev,
            progressUpdates: [...prev.progressUpdates, update],
            sourcesAnalyzed: update.sourcesAnalyzed ?? prev.sourcesAnalyzed,
        }));
    }, []);

    /**
     * Save research to Supabase
     */
    const saveToDatabase = useCallback(async (queryId: string, report: ResearchReport) => {
        try {
            await updateQueryStatus(queryId, 'completed', new Date());
            await saveResearchReport(queryId, report);
            console.log('Research saved to database successfully');
        } catch (error) {
            console.error('Failed to save research to database:', error);
        }
    }, []);

    /**
     * Start a new research session with real API
     */
    const startResearch = useCallback(async (questionText: string) => {
        clearProgress();

        const question: ResearchQuestion = {
            id: generateId(),
            text: questionText,
            timestamp: new Date(),
        };

        setState(prev => ({
            ...prev,
            phase: 'researching',
            currentQuestion: question,
            progressUpdates: [],
            currentReport: null,
            error: null,
            sourcesAnalyzed: 0,
        }));

        // Save query to Supabase if user is logged in
        let queryId: string | null = null;
        let searchDepth = 'standard';

        if (user) {
            try {
                const query = await createResearchQuery(user.id, questionText);
                queryId = query.id;
                setCurrentQueryId(queryId);
                await updateQueryStatus(queryId, 'researching');

                // Get user's preferred search depth
                const prefs = await getUserPreferences(user.id);
                if (prefs?.default_search_depth) {
                    searchDepth = prefs.default_search_depth;
                }
            } catch (error) {
                console.error('Failed to save query to database:', error);
            }
        }

        // Show progress updates while waiting for API
        let progressIndex = 0;
        let sourcesCount = 0;

        const showProgress = () => {
            if (progressIndex < progressSteps.length) {
                const step = progressSteps[progressIndex];
                if (step.type === 'analyze') {
                    sourcesCount += Math.floor(Math.random() * 3) + 2;
                }

                addProgressUpdate({
                    id: generateId(),
                    message: step.message,
                    type: step.type,
                    timestamp: new Date(),
                    sourcesAnalyzed: sourcesCount,
                });
                progressIndex++;
            }
        };

        // Show first progress immediately
        showProgress();

        // Then show additional progress every 3 seconds
        progressIntervalRef.current = setInterval(showProgress, 3000);

        try {
            // Call the research API
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: questionText, searchDepth }),
            });

            clearProgress();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.report) {
                throw new Error('Invalid response from research API');
            }

            const report: ResearchReport = {
                id: data.report.id || generateId(),
                question: questionText,
                executiveSummary: data.report.summary || data.report.executiveSummary || '',
                sections: (data.report.findings || data.report.sections || []).map((section: { heading?: string; title?: string; content: string; citations?: number[] }, idx: number) => ({
                    id: `section-${idx + 1}`,
                    title: section.heading || section.title || `Section ${idx + 1}`,
                    content: section.content,
                    citations: section.citations || [],
                })),
                sources: (data.report.sources || []).map((s: { id?: string | number; title: string; url: string; publishedDate?: string; author?: string; type?: string; description?: string }, idx: number) => ({
                    id: typeof s.id === 'number' ? s.id : idx + 1,
                    title: s.title,
                    url: s.url,
                    publishedDate: s.publishedDate || new Date().toISOString().split('T')[0],
                    author: s.author,
                    type: (s.type as 'article' | 'report' | 'paper' | 'news' | 'company') || 'article',
                })),
                knowledgeGaps: data.report.knowledgeGaps || [],
                generatedAt: new Date(data.report.generatedAt || Date.now()),
                researchDuration: 30, // Approximate duration
            };

            // Save to database if user is logged in
            if (user && queryId) {
                await saveToDatabase(queryId, report);
            }

            setState(prev => {
                const entry: ConversationEntry = {
                    id: generateId(),
                    question: prev.currentQuestion!,
                    report,
                };

                return {
                    ...prev,
                    phase: 'completed',
                    currentReport: report,
                    conversationHistory: [...prev.conversationHistory, entry],
                    sourcesAnalyzed: report.sources.length,
                };
            });

        } catch (error) {
            clearProgress();
            console.error('Research failed:', error);

            const errorMessage = error instanceof Error ? error.message : 'Research failed';

            // Update query status to failed if we have a query ID
            if (user && queryId) {
                try {
                    await updateQueryStatus(queryId, 'failed');
                } catch {
                    // Ignore error updating status
                }
            }

            setState(prev => ({
                ...prev,
                phase: 'error',
                error: errorMessage,
            }));
        }
    }, [clearProgress, addProgressUpdate, user, saveToDatabase]);

    /**
     * Submit a follow-up question
     */
    const submitFollowUp = useCallback((questionText: string) => {
        startResearch(questionText);
    }, [startResearch]);

    /**
     * Reset to initial state
     */
    const reset = useCallback(() => {
        clearProgress();
        setCurrentQueryId(null);
        setState(initialState);
    }, [clearProgress]);

    /**
     * Set an error state
     */
    const setError = useCallback((error: string) => {
        clearProgress();
        setState(prev => ({
            ...prev,
            phase: 'error',
            error,
        }));
    }, [clearProgress]);

    return {
        state,
        startResearch,
        submitFollowUp,
        reset,
        setError,
        currentQueryId,
        isIdle: state.phase === 'idle',
        isResearching: state.phase === 'researching',
        isCompleted: state.phase === 'completed',
        hasError: state.phase === 'error',
    };
}
