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
 */
export function useResearch() {
    const [state, setState] = useState<ResearchState>(initialState);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

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
     * Start a new research session
     */
    const startResearch = useCallback((questionText: string) => {
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
        const completionTimeout = setTimeout(() => {
            const report = findMatchingReport(questionText);

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
    }, [clearAllTimeouts, addProgressUpdate]);

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
        isIdle: state.phase === 'idle',
        isResearching: state.phase === 'researching',
        isCompleted: state.phase === 'completed',
        hasError: state.phase === 'error',
    };
}
