import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { geminiErrorResponse, withGeminiRetry } from "@/lib/gemini-retry";

type Candidate = {
  reportId: number;
  imageUrl: string;
  distanceMetres: number;
};

type DuplicateRequest = {
  imageData?: string;
  mimeType?: string;
  candidates?: Candidate[];
};

function isCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

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
    const { imageData, mimeType, candidates = [] } =
      (await request.json()) as DuplicateRequest;
    if (!imageData || !mimeType || !mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "A valid new report image is required." },
        { status: 400 }
      );
    }

    const safeCandidates = candidates
      .filter(
        (candidate) =>
          Number.isInteger(candidate.reportId) &&
          isCloudinaryUrl(candidate.imageUrl)
      )
      .slice(0, 3);
    if (safeCandidates.length === 0) {
      return NextResponse.json({ matchedReportId: null, confidence: 0 });
    }

    const candidateParts = await Promise.all(
      safeCandidates.map(async (candidate) => {
        const response = await fetch(candidate.imageUrl);
        if (!response.ok) throw new Error("A candidate image could not be read.");
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const bytes = Buffer.from(await response.arrayBuffer());
        return {
          inlineData: { data: bytes.toString("base64"), mimeType: contentType },
        };
      })
    );

    const indexedCandidates = safeCandidates
      .map(
        (candidate, index) =>
          `Candidate ${index + 1}: reportId=${candidate.reportId}, distance=${candidate.distanceMetres.toFixed(1)} metres`
      )
      .join("\n");
    const prompt = `Decide whether the NEW waste photo and one candidate photo show the same physical waste pile, not merely the same waste category. Compare distinctive object arrangement, colours, containers, background, ground, and pile shape. Be conservative when uncertain.

Candidate images follow in the same order:
${indexedCandidates}

Return only JSON in this shape:
{"matchedCandidateNumber":1,"confidence":0.95}
Use null and confidence 0 when none show the same physical pile.`;

    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await withGeminiRetry(() =>
      model.generateContent([
        prompt,
        { inlineData: { data: imageData, mimeType } },
        ...candidateParts,
      ])
    );
    const parsed = JSON.parse(result.response.text()) as {
      matchedCandidateNumber?: number | null;
      confidence?: number;
    };
    const confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0));
    const candidateIndex = Number(parsed.matchedCandidateNumber) - 1;
    const matched = safeCandidates[candidateIndex];

    return NextResponse.json({
      matchedReportId: matched ? matched.reportId : null,
      confidence: matched ? confidence : 0,
    });
  } catch (error) {
    console.error("Duplicate image comparison failed:", error);
    const responseError = geminiErrorResponse(error);
    return NextResponse.json(
      { error: responseError.message },
      { status: responseError.status }
    );
  }
}
