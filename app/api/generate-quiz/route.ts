import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the client on the server side
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    const { quizType, questionCount, instructions, fileContext } = await request.json();

    if (!quizType) {
      return NextResponse.json({ error: 'Quiz type is required' }, { status: 400 });
    }

    // Modern SDK schema structure using native string literals for types
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a quiz based on the following criteria.

            Context Reference Materials (Base the questions strictly on this content if provided):
            ${fileContext || "No reference context provided. Rely on general knowledge."}

            Quiz Generation Specifications:
            - Quiz Type/Topic: ${quizType}
            - Number of Questions: ${questionCount}
            - Additional Instructions (user's specific requirements or constraints): ${instructions}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema as any, // Using 'as any' bypasses SDK internal interface quirks
        temperature: 0.7,
      },
    });

    const quizJsonText = response.text;
    console.log("json =", quizJsonText);

    if (!quizJsonText) {
      throw new Error("Gemini returned an empty response.");
    }

    return NextResponse.json(JSON.parse(quizJsonText));

  } catch (error: any) {
    console.error("Backend Error:", error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error.message },
      { status: 500 }
    );
  }
}