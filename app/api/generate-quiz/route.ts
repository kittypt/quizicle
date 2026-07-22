import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface ContextItem {
  type: 'text' | 'pdf' | 'url';
  content?: string;
  mimeType?: string;
  data?: string;
  url?: string;
}

// Map Gemini error statuses to user-friendly, actionable messages
function classifyError(error: any): { message: string; retryable: boolean; status: number } {
  const code = error?.code || error?.status;
  const msg = error?.message || '';

  // Auth / key issues
  if (code === 401 || code === 403 || msg.includes('API_KEY') || msg.includes('API key')) {
    return {
      message: 'The Gemini API key is missing or invalid. Please check your configuration.',
      retryable: false,
      status: 401,
    };
  }

  // Rate limit
  if (code === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return {
      message: 'Too many requests right now. Please wait a moment and try again.',
      retryable: true,
      status: 429,
    };
  }

  // Model overloaded / temporarily unavailable
  if (code === 503 || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('overloaded')) {
    return {
      message: 'Gemini is experiencing high demand right now. This is usually temporary — please try again in a few seconds.',
      retryable: true,
      status: 503,
    };
  }

  // Bad request (invalid schema, bad params, etc.)
  if (code === 400 || msg.includes('INVALID_ARGUMENT')) {
    return {
      message: 'The request to Gemini was invalid. Please try with different settings.',
      retryable: false,
      status: 400,
    };
  }

  // Safety filters
  if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('filter')) {
    return {
      message: 'The content was blocked by safety filters. Try rephrasing your materials or instructions.',
      retryable: false,
      status: 400,
    };
  }

  // Timeout
  if (msg.includes('timeout') || msg.includes('DEADLINE_EXCEEDED') || code === 504) {
    return {
      message: 'The request timed out. This can happen with very large files — try with fewer or smaller files.',
      retryable: true,
      status: 504,
    };
  }

  // Generic fallback
  return {
    message: 'Something went wrong while generating your quiz. Please try again.',
    retryable: true,
    status: 500,
  };
}

export async function POST(request: Request) {
  try {
    const { quizType, questionCount, instructions, contexts, fileContext } = await request.json();

    if (!quizType) {
      return NextResponse.json(
        { error: 'Please select a quiz type before generating.', code: 'NO_QUIZ_TYPE', retryable: false },
        { status: 400 }
      );
    }

    const quizSchema = {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              questiontext: { type: "STRING" },
              correctanswer: { type: "STRING" },
              incorrectansweroptions: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
            },
            required: ["questiontext", "correctanswer", "incorrectansweroptions"],
          },
        },
      },
      required: ["title", "questions"],
    };

    // Build Gemini content parts: text parts, inline PDF data, and URL references
    const ctxs: ContextItem[] = contexts || [];
    const parts: any[] = [];

    const urlEntries = ctxs.filter(c => c.type === 'url');
    const hasUrls = urlEntries.length > 0;

    // Text and PDF contexts as parts
    for (const ctx of ctxs) {
      if (ctx.type === 'text' && ctx.content) {
        parts.push({ text: `Reference material:\n${ctx.content}` });
      } else if (ctx.type === 'pdf' && ctx.data) {
        parts.push({
          inlineData: {
            mimeType: ctx.mimeType || 'application/pdf',
            data: ctx.data,
          },
        });
      }
    }

    // Prompt text
    const promptLines: string[] = [
      'Create a quiz based on the following criteria.',
    ];

    if (hasUrls) {
      promptLines.push('');
      promptLines.push('Reference URLs (use Google Search to fetch and read the content from these URLs — base the quiz questions on that content):');
      urlEntries.forEach(u => promptLines.push(`- ${u.url}`));
    }

    // Fallback: old-style fileContext if no contexts array
    if (ctxs.length === 0 && fileContext) {
      promptLines.push('');
      promptLines.push(`Context Reference Materials (Base the questions strictly on this content if provided):`);
      promptLines.push(fileContext || 'No reference context provided. Rely on general knowledge.');
    } else if (ctxs.length === 0) {
      promptLines.push('');
      promptLines.push('No reference context provided. Rely on general knowledge.');
    }

    promptLines.push('');
    promptLines.push('Quiz Generation Specifications:');
    promptLines.push(`- Quiz Type/Topic: ${quizType}`);
    promptLines.push(`- Number of Questions: ${questionCount}`);
    promptLines.push(`- Additional Instructions (user\'s specific requirements or constraints): ${instructions || 'None'}`);
    promptLines.push('');
    promptLines.push('You MUST respond with ONLY valid JSON — no markdown, no code fences, no extra text. Use this exact structure:');
    promptLines.push('{');
    promptLines.push('  "title": "string (the quiz title)",');
    promptLines.push('  "questions": [');
    promptLines.push('    {');
    promptLines.push('      "questiontext": "string",');
    promptLines.push('      "correctanswer": "string",');
    promptLines.push('      "incorrectansweroptions": ["string", "string", "string"]');
    promptLines.push('    }');
    promptLines.push('  ]');
    promptLines.push('}');

    parts.push({ text: promptLines.join('\n') });

    // Build config: structured JSON output when no URLs, otherwise text + manual parse
    const config: any = {
      temperature: 0.7,
    };

    if (hasUrls) {
      // Cannot use responseMimeType with tools — rely on prompt instructions for JSON
      config.tools = [{ googleSearch: {} }];
    } else {
      config.responseMimeType = 'application/json';
      config.responseSchema = quizSchema;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config,
    });

    let quizJsonText = response.text;

    if (!quizJsonText) {
      return NextResponse.json(
        { error: 'Gemini returned an empty response. Please try again.', code: 'EMPTY_RESPONSE', retryable: true },
        { status: 502 }
      );
    }

    // When using tools (URL mode), Gemini may wrap JSON in markdown code fences — strip them
    quizJsonText = quizJsonText.trim();
    const fenceMatch = quizJsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      quizJsonText = fenceMatch[1].trim();
    }

    let quizData;
    try {
      quizData = JSON.parse(quizJsonText);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse the quiz generated by Gemini. Please try again.', code: 'PARSE_ERROR', retryable: true },
        { status: 502 }
      );
    }

    return NextResponse.json(quizData);

  } catch (error: any) {
    console.error("Backend Error:", error);
    const classified = classifyError(error);
    return NextResponse.json(
      { error: classified.message, code: 'GEMINI_ERROR', retryable: classified.retryable },
      { status: classified.status }
    );
  }
}