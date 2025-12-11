'use client';

import { useState, useCallback, useRef } from 'react';
import {
    ResearchState,
    ResearchPhase,
    ProgressUpdate,
    ResearchReport,
    ResearchQuestion,
    ConversationEntry
} from '@/lib/types';
import {
    progressMessages,
    findMatchingReport,
    generateId
} from '@/lib/mock-research';
import { useAuth } from '@/components/auth';
import {
    createResearchQuery,
    updateQueryStatus,
    saveResearchReport,
    isSupabaseConfigured
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

/**
 * Custom hook for managing research state and simulation
 * Now with Supabase integration to save research data
 */
export function useResearch() {
    const [state, setState] = useState<ResearchState>(initialState);
    const [currentQueryId, setCurrentQueryId] = useState<string | null>(null);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const { user } = useAuth();

    /**
     * Clear all pending timeouts
     */
    const clearAllTimeouts = useCallback(() => {
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
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
            // Update query status to completed
            await updateQueryStatus(queryId, 'completed', new Date());

            // Save the report
            await saveResearchReport(queryId, report);

            console.log('Research saved to database successfully');
        } catch (error) {
            console.error('Failed to save research to database:', error);
        }
    }, []);

    /**
     * Start a new research session
     */
    const startResearch = useCallback(async (questionText: string) => {
        clearAllTimeouts();

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
        if (user) {
            try {
                const query = await createResearchQuery(user.id, questionText);
                queryId = query.id;
                setCurrentQueryId(queryId);

                // Update status to researching
                await updateQueryStatus(queryId, 'researching');
            } catch (error) {
                console.error('Failed to save query to database:', error);
            }
        }

        // Simulate progress updates over time
        let sourcesCount = 0;
        progressMessages.forEach((msg, index) => {
            const timeout = setTimeout(() => {
                // Increment sources for analyze steps
                if (msg.type === 'analyze') {
                    sourcesCount += Math.floor(Math.random() * 3) + 1;
                }

                const update: ProgressUpdate = {
                    id: generateId(),
                    message: msg.message,
                    type: msg.type,
                    timestamp: new Date(),
                    sourcesAnalyzed: sourcesCount,
                };

                addProgressUpdate(update);
            }, (index + 1) * 2500); // 2.5 seconds between each update

            timeoutsRef.current.push(timeout);
        });

        // Complete research after all progress updates
        const completionTimeout = setTimeout(async () => {
            const report = findMatchingReport(questionText);

            // Save to database if user is logged in and we have a query ID
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
                };
            });
        }, (progressMessages.length + 1) * 2500);

        timeoutsRef.current.push(completionTimeout);
    }, [clearAllTimeouts, addProgressUpdate, user, saveToDatabase]);

    /**
     * Submit a follow-up question
     */
    const submitFollowUp = useCallback((questionText: string) => {
        // For demo purposes, start fresh research with new question
        startResearch(questionText);
    }, [startResearch]);

    /**
     * Reset to initial state
     */
    const reset = useCallback(() => {
        clearAllTimeouts();
        setCurrentQueryId(null);
        setState(initialState);
    }, [clearAllTimeouts]);

    /**
     * Set an error state
     */
    const setError = useCallback((error: string) => {
        clearAllTimeouts();
        setState(prev => ({
            ...prev,
            phase: 'error',
            error,
        }));
    }, [clearAllTimeouts]);

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
