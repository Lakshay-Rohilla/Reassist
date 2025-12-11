/**
 * TypeScript type definitions for the Research Assistant UI
 */

/** A research question submitted by the user */
export interface ResearchQuestion {
    id: string;
    text: string;
    timestamp: Date;
}

/** A single progress update during research */
export interface ProgressUpdate {
    id: string;
    message: string;
    type: 'info' | 'search' | 'analyze' | 'synthesize';
    timestamp: Date;
    sourcesAnalyzed?: number;
}

/** A citation reference within the report */
export interface Citation {
    id: number;
    sourceId: number;
    text: string;
}

/** A source used in the research */
export interface Source {
    id: number;
    title: string;
    url: string;
    publishedDate: string;
    author?: string;
    type: 'article' | 'report' | 'paper' | 'news' | 'company';
}

/** A section within the research report */
export interface ReportSection {
    id: string;
    title: string;
    content: string;
    citations: number[];
}

/** The complete research report */
export interface ResearchReport {
    id: string;
    question: string;
    executiveSummary: string;
    sections: ReportSection[];
    knowledgeGaps: string[];
    sources: Source[];
    generatedAt: Date;
    researchDuration: number; // in seconds
}

/** Research conversation history for follow-ups */
export interface ConversationEntry {
    id: string;
    question: ResearchQuestion;
    report: ResearchReport;
}

/** Current phase of the research process */
export type ResearchPhase = 'idle' | 'researching' | 'completed' | 'error';

/** Complete research state */
export interface ResearchState {
    phase: ResearchPhase;
    currentQuestion: ResearchQuestion | null;
    progressUpdates: ProgressUpdate[];
    currentReport: ResearchReport | null;
    conversationHistory: ConversationEntry[];
    error: string | null;
    sourcesAnalyzed: number;
}

/** Action types for research state reducer */
export type ResearchAction =
    | { type: 'START_RESEARCH'; question: string }
    | { type: 'ADD_PROGRESS'; update: ProgressUpdate }
    | { type: 'UPDATE_SOURCES_COUNT'; count: number }
    | { type: 'COMPLETE_RESEARCH'; report: ResearchReport }
    | { type: 'SET_ERROR'; error: string }
    | { type: 'RESET' };
