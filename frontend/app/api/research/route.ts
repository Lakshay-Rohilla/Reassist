import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
function getOpenAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    return new OpenAI({ apiKey });
}

// Research prompt template
const RESEARCH_SYSTEM_PROMPT = `You are an expert research assistant. When given a research question, you will:

1. Analyze the question thoroughly
2. Provide comprehensive findings from multiple perspectives
3. Include relevant data, statistics, and examples
4. Identify knowledge gaps and limitations
5. Suggest follow-up questions for deeper exploration

Format your response as a JSON object with this structure:
{
  "title": "A concise, descriptive title for this research",
  "summary": "A 2-3 sentence executive summary of the key findings",
  "findings": [
    {
      "heading": "Section heading",
      "content": "Detailed content with facts, data, and analysis (2-4 paragraphs)"
    }
  ],
  "sources": [
    {
      "title": "Source title",
      "url": "https://example.com",
      "description": "Brief description of what this source covers",
      "reliability": "high | medium | low"
    }
  ],
  "knowledgeGaps": ["List of areas that need more research"],
  "followUpQuestions": ["Suggested questions for further exploration"],
  "qualityScore": 0.0 to 1.0 rating of confidence in findings,
  "researchMetadata": {
    "sourcesAnalyzed": number of sources,
    "confidenceLevel": "high | medium | low",
    "lastUpdated": "ISO date string"
  }
}

Be thorough, accurate, and balanced in your analysis. Include at least 3-5 key findings and 5-8 relevant sources.`;

export async function POST(request: NextRequest) {
    try {
        const { question, searchDepth = 'standard' } = await request.json();

        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            );
        }

        // Check if OpenAI is configured
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                {
                    error: 'API not configured',
                    message: 'Please add OPENAI_API_KEY to your .env.local file'
                },
                { status: 503 }
            );
        }

        const openai = getOpenAIClient();

        // Adjust model and tokens based on search depth
        const modelConfig = {
            quick: { model: 'gpt-3.5-turbo', maxTokens: 2000 },
            standard: { model: 'gpt-4-turbo-preview', maxTokens: 4000 },
            comprehensive: { model: 'gpt-4-turbo-preview', maxTokens: 8000 },
        };

        const config = modelConfig[searchDepth as keyof typeof modelConfig] || modelConfig.standard;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: config.model,
            messages: [
                { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
                { role: 'user', content: `Research Question: ${question}\n\nPlease provide comprehensive research findings for this topic.` }
            ],
            max_tokens: config.maxTokens,
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            throw new Error('No response from OpenAI');
        }

        // Parse the JSON response
        let researchData;
        try {
            researchData = JSON.parse(responseContent);
        } catch {
            // If parsing fails, create a structured response from raw text
            researchData = {
                title: 'Research Findings',
                summary: responseContent.substring(0, 200),
                findings: [{ heading: 'Analysis', content: responseContent }],
                sources: [],
                knowledgeGaps: [],
                followUpQuestions: [],
                qualityScore: 0.7,
                researchMetadata: {
                    sourcesAnalyzed: 0,
                    confidenceLevel: 'medium',
                    lastUpdated: new Date().toISOString()
                }
            };
        }

        // Ensure all required fields exist
        const report = {
            id: crypto.randomUUID(),
            title: researchData.title || 'Research Report',
            summary: researchData.summary || '',
            findings: researchData.findings || [],
            sources: (researchData.sources || []).map((source: {
                title?: string;
                url?: string;
                description?: string;
                reliability?: string
            }, index: number) => ({
                id: `source-${index + 1}`,
                title: source.title || `Source ${index + 1}`,
                url: source.url || '#',
                description: source.description || '',
                reliability: source.reliability || 'medium',
            })),
            knowledgeGaps: researchData.knowledgeGaps || [],
            followUpQuestions: researchData.followUpQuestions || [],
            qualityScore: researchData.qualityScore || 0.75,
            researchMetadata: {
                sourcesAnalyzed: researchData.researchMetadata?.sourcesAnalyzed || researchData.sources?.length || 0,
                confidenceLevel: researchData.researchMetadata?.confidenceLevel || 'medium',
                lastUpdated: researchData.researchMetadata?.lastUpdated || new Date().toISOString(),
            },
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, report });

    } catch (error) {
        console.error('Research API error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            { error: 'Research failed', message: errorMessage },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
