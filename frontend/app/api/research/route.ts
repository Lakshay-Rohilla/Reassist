import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }
    return new GoogleGenerativeAI(apiKey);
}

// Research prompt templates based on search depth
const getResearchPrompt = (depth: string) => {
    const baseRequirements = `You are an expert research analyst. Provide thorough, well-researched analysis on any topic.

IMPORTANT: Provide REAL, VERIFIABLE information. Do not make up sources or statistics.`;

    const depthConfigs = {
        quick: {
            findings: '4-6 key findings with 2-3 paragraphs each',
            sources: '6-8 diverse sources',
        },
        standard: {
            findings: '6-10 detailed findings with 3-5 paragraphs each',
            sources: '10-15 diverse sources from multiple categories',
        },
        comprehensive: {
            findings: '10-15 extensive findings with 4-6 paragraphs each',
            sources: '15-25 comprehensive sources across all categories',
        },
    };

    const config = depthConfigs[depth as keyof typeof depthConfigs] || depthConfigs.standard;

    return `${baseRequirements}

Provide ${config.findings} and cite ${config.sources}.

FORMAT your response as a JSON object with this structure (respond ONLY with valid JSON):
{
  "title": "Research title (15-20 words max)",
  "summary": "Executive summary (4-6 sentences)",
  "findings": [{"heading": "Section heading", "content": "Detailed content with facts and analysis"}],
  "sources": [{"title": "Source title", "url": "https://url.com", "description": "What this covers", "reliability": "high", "type": "academic"}],
  "keyStatistics": [{"value": "47%", "context": "What this represents"}],
  "knowledgeGaps": ["Areas needing more research"],
  "followUpQuestions": ["Questions for deeper exploration"],
  "qualityScore": 0.85,
  "researchMetadata": {"sourcesAnalyzed": 10, "confidenceLevel": "high", "topicComplexity": "medium", "dataRecency": "Recent data", "lastUpdated": "2024-01-01T00:00:00.000Z"}
}

RESPOND ONLY WITH VALID JSON.`;
};

export async function POST(request: NextRequest) {
    try {
        const { question, searchDepth = 'standard' } = await request.json();

        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                error: 'API not configured',
                message: 'Please add GEMINI_API_KEY to your environment variables'
            }, { status: 503 });
        }

        const genAI = getGeminiClient();

        const modelConfig = {
            quick: { model: 'gemini-2.0-flash-exp', maxTokens: 4000 },
            standard: { model: 'gemini-2.0-flash-exp', maxTokens: 8000 },
            comprehensive: { model: 'gemini-2.0-flash-exp', maxTokens: 16000 },
        };

        const config = modelConfig[searchDepth as keyof typeof modelConfig] || modelConfig.standard;
        const systemPrompt = getResearchPrompt(searchDepth);

        const userPrompt = `Research Question: ${question}

Provide comprehensive research with findings, sources, and statistics.`;

        const model = genAI.getGenerativeModel({
            model: config.model,
            generationConfig: {
                maxOutputTokens: config.maxTokens,
                temperature: 0.7,
            }
        });

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: userPrompt }
        ]);

        let responseContent = result.response.text();
        if (!responseContent) throw new Error('No response from Gemini');

        // Clean markdown
        responseContent = responseContent.trim();
        if (responseContent.startsWith('```json')) responseContent = responseContent.slice(7);
        if (responseContent.startsWith('```')) responseContent = responseContent.slice(3);
        if (responseContent.endsWith('```')) responseContent = responseContent.slice(0, -3);
        responseContent = responseContent.trim();

        let researchData;
        try {
            researchData = JSON.parse(responseContent);
        } catch {
            researchData = {
                title: 'Research Findings',
                summary: responseContent.substring(0, 500),
                findings: [{ heading: 'Analysis', content: responseContent }],
                sources: [], keyStatistics: [], knowledgeGaps: [], followUpQuestions: [],
                qualityScore: 0.7,
                researchMetadata: { sourcesAnalyzed: 0, confidenceLevel: 'medium', topicComplexity: 'medium', dataRecency: 'Unknown', lastUpdated: new Date().toISOString() }
            };
        }

        const report = {
            id: crypto.randomUUID(),
            title: researchData.title || 'Research Report',
            summary: researchData.summary || '',
            findings: researchData.findings || [],
            sources: (researchData.sources || []).map((s: { title?: string; url?: string; description?: string; reliability?: string; type?: string }, i: number) => ({
                id: `source-${i + 1}`, title: s.title || `Source ${i + 1}`, url: s.url || '#',
                description: s.description || '', reliability: s.reliability || 'medium', type: s.type || 'news',
            })),
            keyStatistics: (researchData.keyStatistics || []).map((s: { value?: string; context?: string }) => ({ value: s.value || '', context: s.context || '' })),
            knowledgeGaps: researchData.knowledgeGaps || [],
            followUpQuestions: researchData.followUpQuestions || [],
            qualityScore: researchData.qualityScore || 0.75,
            researchMetadata: {
                sourcesAnalyzed: researchData.researchMetadata?.sourcesAnalyzed || researchData.sources?.length || 0,
                confidenceLevel: researchData.researchMetadata?.confidenceLevel || 'medium',
                topicComplexity: researchData.researchMetadata?.topicComplexity || 'medium',
                dataRecency: researchData.researchMetadata?.dataRecency || 'Recent',
                lastUpdated: researchData.researchMetadata?.lastUpdated || new Date().toISOString(),
            },
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, report });

    } catch (error) {
        console.error('Research API error:', error);
        return NextResponse.json({ error: 'Research failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
    });
}
