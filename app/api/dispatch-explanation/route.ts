import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { geminiErrorResponse, withGeminiRetry } from "@/lib/gemini-retry";

export async function POST(request: Request) {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as {
      wasteType?: string;
      amount?: string;
      priority?: string;
      collectorName?: string;
      matchScore?: number;
      reasons?: string[];
    };
    if (!body.wasteType || !body.collectorName || !Array.isArray(body.reasons)) {
      return NextResponse.json(
        { error: "Incomplete dispatch recommendation." },
        { status: 400 }
      );
    }

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: "gemini-3.6-flash",
    });
    const prompt = `You are assisting a city waste dispatcher. Explain this rule-based recommendation in no more than two concise sentences. Do not invent facts or change the selected team.
Waste: ${body.wasteType}, ${body.amount || "unknown amount"}
Priority: ${body.priority}
Selected team: ${body.collectorName}
Match score: ${body.matchScore}%
Evidence: ${body.reasons.join("; ")}`;
    const result = await withGeminiRetry(() => model.generateContent(prompt));
    return NextResponse.json({ explanation: result.response.text().trim() });
  } catch (error) {
    console.error("Dispatch explanation failed:", error);
    const responseError = geminiErrorResponse(error);
    return NextResponse.json(
      { error: responseError.message },
      { status: responseError.status }
    );
  }
}
