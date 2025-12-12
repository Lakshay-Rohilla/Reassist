import { NextRequest, NextResponse } from 'next/server';

// Research prompt templates based on search depth
const getResearchPrompt = (depth: string) => {
    const baseRequirements = `You are an expert research analyst with access to comprehensive knowledge across academic, industry, and news sources. Your task is to provide thorough, well-researched analysis on any topic.

IMPORTANT: You must provide REAL, VERIFIABLE information. Do not make up sources or statistics. If you're uncertain about specific data, acknowledge the limitation.`;

    const depthConfigs = {
        quick: {
            findings: '4-6 key findings with 2-3 paragraphs each',
            sources: '6-8 diverse sources',
            analysis: 'concise but comprehensive analysis',
        },
        standard: {
            findings: '6-10 detailed findings with 3-5 paragraphs each',
            sources: '10-15 diverse sources from multiple categories',
            analysis: 'in-depth analysis with statistics, trends, and expert opinions',
        },
        comprehensive: {
            findings: '10-15 extensive findings with 4-6 paragraphs each',
            sources: '15-25 comprehensive sources across all categories',
            analysis: 'exhaustive analysis including historical context, current trends, future projections, and multiple expert viewpoints',
        },
    };

    const config = depthConfigs[depth as keyof typeof depthConfigs] || depthConfigs.standard;

    return `${baseRequirements}

When analyzing a research question, you must:

1. THOROUGHLY ANALYZE the question from multiple angles (technical, economic, social, environmental, political if relevant)
2. PROVIDE ${config.findings}, each covering a distinct aspect of the topic
3. INCLUDE specific data points, statistics, percentages, and numerical evidence where available
4. CITE ${config.sources} including:
   - Academic/research papers and journals
   - Industry reports and market analyses
   - Government publications and official statistics
   - Reputable news sources and investigative journalism
   - Expert opinions and thought leadership pieces
   - Company reports and press releases (where relevant)
5. IDENTIFY knowledge gaps, limitations, and areas of ongoing debate
6. SUGGEST actionable follow-up questions for deeper exploration
7. PROVIDE ${config.analysis}

FORMAT your response as a JSON object with this EXACT structure (respond ONLY with valid JSON, no markdown):
{
  "title": "A compelling, descriptive title that captures the essence of the research (15-20 words max)",
  "summary": "A comprehensive executive summary of 4-6 sentences covering the most important findings, key statistics, and main conclusions",
  "findings": [
    {
      "heading": "Clear, descriptive section heading",
      "content": "Detailed content with specific facts, data points, statistics, examples, expert quotes, and thorough analysis."
    }
  ],
  "sources": [
    {
      "title": "Full source title",
      "url": "https://actual-source-url.com/path",
      "description": "Detailed description of what this source covers and why it's relevant",
      "reliability": "high",
      "type": "academic"
    }
  ],
  "keyStatistics": [
    {
      "value": "47%",
      "context": "What this statistic represents"
    }
  ],
  "knowledgeGaps": ["Specific areas where more research is needed"],
  "followUpQuestions": ["Suggested questions for deeper exploration"],
  "qualityScore": 0.85,
  "researchMetadata": {
    "sourcesAnalyzed": 10,
    "confidenceLevel": "high",
    "topicComplexity": "medium",
    "dataRecency": "Description of how recent the available data is",
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}

RESPOND ONLY WITH VALID JSON - no markdown code blocks or extra text.`;
};

export async function POST(request: NextRequest) {
    try {
        const { question, searchDepth = 'standard' } = await request.json();

        if (!question || typeof question !== 'string') {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            );
        }

        // Check if OpenRouter API key is configured
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                {
                    error: 'API not configured',
                    message: 'Please add OPENROUTER_API_KEY to your environment variables'
                },
                { status: 503 }
            );
        }

        // Adjust model based on search depth
        const modelConfig = {
            quick: { model: 'google/gemini-2.0-flash-001', maxTokens: 4000 },
            standard: { model: 'google/gemini-2.0-flash-001', maxTokens: 8000 },
            comprehensive: { model: 'google/gemini-2.0-flash-001', maxTokens: 16000 },
        };

        const config = modelConfig[searchDepth as keyof typeof modelConfig] || modelConfig.standard;

        // Get depth-specific prompt
        const systemPrompt = getResearchPrompt(searchDepth);

        // Enhanced user prompt
        const userPrompt = `Research Question: ${question}

Please conduct a thorough research analysis on this topic. Provide:
- Comprehensive findings covering all major aspects
- Real, verifiable sources from reputable publications
- Specific statistics, data points, and examples
- Balanced analysis considering multiple perspectives
- Clear identification of any limitations or knowledge gaps

Focus on delivering actionable insights with evidence-based conclusions.`;

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                'X-Title': 'ReAssist Research Assistant'
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: config.maxTokens,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        let responseContent = data.choices?.[0]?.message?.content;

        if (!responseContent) {
            throw new Error('No response from OpenRouter');
        }

        // Clean up the response - remove markdown code blocks if present
        responseContent = responseContent.trim();
        if (responseContent.startsWith('```json')) {
            responseContent = responseContent.slice(7);
        }
        if (responseContent.startsWith('```')) {
            responseContent = responseContent.slice(3);
        }
        if (responseContent.endsWith('```')) {
            responseContent = responseContent.slice(0, -3);
        }
        responseContent = responseContent.trim();

        // Parse the JSON response
        let researchData;
        try {
            researchData = JSON.parse(responseContent);
        } catch {
            // If parsing fails, create a structured response from raw text
            researchData = {
                title: 'Research Findings',
                summary: responseContent.substring(0, 500),
                findings: [{ heading: 'Analysis', content: responseContent }],
                sources: [],
                keyStatistics: [],
                knowledgeGaps: [],
                followUpQuestions: [],
                qualityScore: 0.7,
                researchMetadata: {
                    sourcesAnalyzed: 0,
                    confidenceLevel: 'medium',
                    topicComplexity: 'medium',
                    dataRecency: 'Unknown',
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
                reliability?: string;
                type?: string;
            }, index: number) => ({
                id: `source-${index + 1}`,
                title: source.title || `Source ${index + 1}`,
                url: source.url || '#',
                description: source.description || '',
                reliability: source.reliability || 'medium',
                type: source.type || 'news',
            })),
            keyStatistics: (researchData.keyStatistics || []).map((stat: {
                value?: string;
                context?: string;
            }) => ({
                value: stat.value || '',
                context: stat.context || '',
            })),
            knowledgeGaps: researchData.knowledgeGaps || [],
            followUpQuestions: researchData.followUpQuestions || [],
            qualityScore: researchData.qualityScore || 0.75,
            researchMetadata: {
                sourcesAnalyzed: researchData.researchMetadata?.sourcesAnalyzed || researchData.sources?.length || 0,
                confidenceLevel: researchData.researchMetadata?.confidenceLevel || 'medium',
                topicComplexity: researchData.researchMetadata?.topicComplexity || 'medium',
                dataRecency: researchData.researchMetadata?.dataRecency || 'Recent data available',
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
