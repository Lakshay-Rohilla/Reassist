import { getSupabase, isSupabaseConfigured } from './supabase';
import { ResearchReport, ReportSection } from './types';

// Re-export for convenience
export { isSupabaseConfigured } from './supabase';

function getDb() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return getSupabase();
}

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface DbResearchQuery {
    id: string;
    user_id: string;
    question: string;
    status: 'pending' | 'researching' | 'completed' | 'failed';
    created_at: string;
    completed_at: string | null;
}

export interface DbResearchReport {
    id: string;
    query_id: string;
    executive_summary: string | null;
    detailed_findings: ReportSection[] | null;
    knowledge_gaps: string[] | null;
    research_duration: number | null;
    created_at: string;
}

export interface DbCitation {
    id: string;
    report_id: string;
    citation_number: number;
    source_title: string;
    url: string | null;
    author: string | null;
    publication_date: string | null;
    source_type: 'article' | 'report' | 'paper' | 'news' | 'company' | null;
    excerpt: string | null;
}

export interface DbSavedReport {
    id: string;
    user_id: string;
    report_id: string;
    saved_at: string;
    notes: string | null;
}

export interface DbUserPreferences {
    id: string;
    user_id: string;
    theme: 'light' | 'dark' | 'system';
    default_search_depth: 'quick' | 'standard' | 'comprehensive';
    email_notifications: boolean;
    created_at: string;
    updated_at: string;
}

// =====================================================
// RESEARCH QUERIES
// =====================================================

export async function createResearchQuery(userId: string, question: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('research_queries')
        .insert({
            user_id: userId,
            question,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data as DbResearchQuery;
}

export async function updateQueryStatus(
    queryId: string,
    status: DbResearchQuery['status'],
    completedAt?: Date
) {
    const supabase = getDb();
    const { error } = await supabase
        .from('research_queries')
        .update({
            status,
            completed_at: completedAt?.toISOString(),
        })
        .eq('id', queryId);

    if (error) throw error;
}

export async function getResearchHistory(userId: string, limit = 20, offset = 0) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('research_queries')
        .select(`
            *,
            research_reports (
                id,
                executive_summary,
                research_duration,
                created_at
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
}

export async function getQueryById(queryId: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('research_queries')
        .select(`
            *,
            research_reports (
                *,
                citations (*)
            )
        `)
        .eq('id', queryId)
        .single();

    if (error) throw error;
    return data;
}

export async function searchQueries(userId: string, searchTerm: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('research_queries')
        .select('*')
        .eq('user_id', userId)
        .ilike('question', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data as DbResearchQuery[];
}

// =====================================================
// RESEARCH REPORTS
// =====================================================

export async function saveResearchReport(
    queryId: string,
    report: ResearchReport
) {
    const supabase = getDb();
    // Insert the report
    const { data: reportData, error: reportError } = await supabase
        .from('research_reports')
        .insert({
            query_id: queryId,
            executive_summary: report.executiveSummary,
            detailed_findings: report.sections,
            knowledge_gaps: report.knowledgeGaps,
            research_duration: report.researchDuration,
        })
        .select()
        .single();

    if (reportError) throw reportError;

    // Insert citations
    if (report.sources && report.sources.length > 0) {
        const citations = report.sources.map((source) => ({
            report_id: reportData.id,
            citation_number: source.id,
            source_title: source.title,
            url: source.url,
            author: source.author,
            publication_date: source.publishedDate,
            source_type: source.type,
        }));

        const { error: citationsError } = await supabase
            .from('citations')
            .insert(citations);

        if (citationsError) throw citationsError;
    }

    return reportData as DbResearchReport;
}

export async function getReportWithCitations(reportId: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('research_reports')
        .select(`
            *,
            citations (*),
            research_queries (question)
        `)
        .eq('id', reportId)
        .single();

    if (error) throw error;
    return data;
}

// =====================================================
// SAVED REPORTS (BOOKMARKS)
// =====================================================

export async function saveReport(userId: string, reportId: string, notes?: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('saved_reports')
        .upsert({
            user_id: userId,
            report_id: reportId,
            notes,
        })
        .select()
        .single();

    if (error) throw error;
    return data as DbSavedReport;
}

export async function unsaveReport(userId: string, reportId: string) {
    const supabase = getDb();
    const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('user_id', userId)
        .eq('report_id', reportId);

    if (error) throw error;
}

export async function getSavedReports(userId: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('saved_reports')
        .select(`
            *,
            research_reports (
                *,
                research_queries (question)
            )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function isReportSaved(userId: string, reportId: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('saved_reports')
        .select('id')
        .eq('user_id', userId)
        .eq('report_id', reportId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
}

// =====================================================
// USER PREFERENCES
// =====================================================

export async function getUserPreferences(userId: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as DbUserPreferences | null;
}

export async function upsertUserPreferences(
    userId: string,
    preferences: Partial<Omit<DbUserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
            user_id: userId,
            ...preferences,
        })
        .select()
        .single();

    if (error) throw error;
    return data as DbUserPreferences;
}

// =====================================================
// FOLLOW-UP QUESTIONS
// =====================================================

export async function saveFollowUpQuestion(
    parentQueryId: string,
    question: string,
    answer?: object
) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('follow_up_questions')
        .insert({
            parent_query_id: parentQueryId,
            question,
            answer,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getFollowUpQuestions(parentQueryId: string) {
    const supabase = getDb();
    const { data, error } = await supabase
        .from('follow_up_questions')
        .select('*')
        .eq('parent_query_id', parentQueryId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

// =====================================================
// ANALYTICS & STATS
// =====================================================

export async function getUserStats(userId: string) {
    const supabase = getDb();
    const { data: queries, error: queriesError } = await supabase
        .from('research_queries')
        .select('id, status, created_at')
        .eq('user_id', userId);

    if (queriesError) throw queriesError;

    const { data: saved, error: savedError } = await supabase
        .from('saved_reports')
        .select('id')
        .eq('user_id', userId);

    if (savedError) throw savedError;

    const totalQueries = queries?.length || 0;
    const completedQueries = queries?.filter((q: { status: string }) => q.status === 'completed').length || 0;
    const savedReports = saved?.length || 0;

    // Calculate queries this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const queriesThisMonth = queries?.filter(
        (q: { created_at: string }) => new Date(q.created_at) >= startOfMonth
    ).length || 0;

    return {
        totalQueries,
        completedQueries,
        savedReports,
        queriesThisMonth,
    };
}
