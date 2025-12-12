import { NextRequest, NextResponse } from 'next/server';

// Research prompt templates based on search depth
const getResearchPrompt = (depth: string) => {
    const depthConfigs = {
        quick: { findings: '4-6 findings', sources: '6-8 sources' },
        standard: { findings: '6-10 findings', sources: '10-15 sources' },
        comprehensive: { findings: '10-15 findings', sources: '15-25 sources' },
    };
    const config = depthConfigs[depth as keyof typeof depthConfigs] || depthConfigs.standard;

    return `You are an expert research analyst. Provide ${config.findings} and ${config.sources}.

FORMAT as JSON (no markdown):
{"title":"Research title","summary":"Executive summary","findings":[{"heading":"Section","content":"Details"}],"sources":[{"title":"Source","url":"https://url.com","description":"What it covers","reliability":"high","type":"academic"}],"keyStatistics":[{"value":"47%","context":"Meaning"}],"knowledgeGaps":["Areas needing research"],"followUpQuestions":["Questions"],"qualityScore":0.85,"researchMetadata":{"sourcesAnalyzed":10,"confidenceLevel":"high","topicComplexity":"medium","dataRecency":"Recent","lastUpdated":"2024-01-01T00:00:00.000Z"}}`;
};

export async function POST(request: NextRequest) {
    try {
        const { question, searchDepth = 'standard' } = await request.json();
        if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return NextResponse.json({ error: 'API not configured', message: 'Add OPENROUTER_API_KEY' }, { status: 503 });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'ReAssist'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    { role: 'system', content: getResearchPrompt(searchDepth) },
                    { role: 'user', content: `Research: ${question}. Provide comprehensive analysis with sources and statistics.` }
                ],
                max_tokens: searchDepth === 'comprehensive' ? 16000 : searchDepth === 'quick' ? 4000 : 8000,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API error: ${response.status}`);
        }

        let content = (await response.json()).choices?.[0]?.message?.content;
        if (!content) throw new Error('No response');

        // Clean markdown
        content = content.trim().replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

        let data;
        try { data = JSON.parse(content); } catch {
            data = { title: 'Research', summary: content.slice(0, 500), findings: [{ heading: 'Analysis', content }], sources: [], keyStatistics: [], knowledgeGaps: [], followUpQuestions: [], qualityScore: 0.7, researchMetadata: { sourcesAnalyzed: 0, confidenceLevel: 'medium', topicComplexity: 'medium', dataRecency: 'Unknown', lastUpdated: new Date().toISOString() } };
        }

        const report = {
            id: crypto.randomUUID(),
            title: data.title || 'Research Report',
            summary: data.summary || '',
            findings: data.findings || [],
            sources: (data.sources || []).map((s: Record<string, string>, i: number) => ({ id: `source-${i + 1}`, title: s.title || `Source ${i + 1}`, url: s.url || '#', description: s.description || '', reliability: s.reliability || 'medium', type: s.type || 'news' })),
            keyStatistics: (data.keyStatistics || []).map((s: Record<string, string>) => ({ value: s.value || '', context: s.context || '' })),
            knowledgeGaps: data.knowledgeGaps || [],
            followUpQuestions: data.followUpQuestions || [],
            qualityScore: data.qualityScore || 0.75,
            researchMetadata: { sourcesAnalyzed: data.researchMetadata?.sourcesAnalyzed || 0, confidenceLevel: data.researchMetadata?.confidenceLevel || 'medium', topicComplexity: data.researchMetadata?.topicComplexity || 'medium', dataRecency: data.researchMetadata?.dataRecency || 'Recent', lastUpdated: data.researchMetadata?.lastUpdated || new Date().toISOString() },
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Research API error:', error);
        return NextResponse.json({ error: 'Research failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
