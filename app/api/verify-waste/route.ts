import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { geminiErrorResponse, withGeminiRetry } from "@/lib/gemini-retry";

type VerificationRequest = {
  imageData?: string;
  mimeType?: string;
  beforeImageUrl?: string;
};

function isCloudinaryImageUrl(value: string) {
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
    const { imageData, mimeType, beforeImageUrl } =
      (await request.json()) as VerificationRequest;

    if (!imageData || !mimeType) {
      return NextResponse.json(
        { error: "An image is required for verification." },
        { status: 400 }
      );
    }

    if (!mimeType.startsWith("image/") || imageData.length > 14_000_000) {
      return NextResponse.json(
        { error: "Please upload a supported image smaller than 10 MB." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    let beforeImage:
      | { inlineData: { data: string; mimeType: string } }
      | undefined;
    if (beforeImageUrl) {
      if (!isCloudinaryImageUrl(beforeImageUrl)) {
        return NextResponse.json(
          { error: "The original report image is invalid." },
          { status: 400 }
        );
      }
      const beforeResponse = await fetch(beforeImageUrl);
      if (!beforeResponse.ok) {
        throw new Error("The original report image could not be loaded.");
      }
      const beforeBytes = Buffer.from(await beforeResponse.arrayBuffer());
      if (beforeBytes.length > 10_000_000) {
        return NextResponse.json(
          { error: "The original report image is too large." },
          { status: 400 }
        );
      }
      beforeImage = {
        inlineData: {
          data: beforeBytes.toString("base64"),
          mimeType:
            beforeResponse.headers.get("content-type") || "image/jpeg",
        },
      };
    }

    const prompt = beforeImage
      ? `Compare these two photos of a cleanup task.
      Image 1 is the original BEFORE photo from the waste report.
      Image 2 is the newly uploaded AFTER photo.

      Decide:
      - sameLocation: whether both images show the same physical place. Use stable background evidence such as buildings, roads, walls, ground, vegetation, signs, and camera context. Allow a reasonable change in camera angle.
      - wasteRemoved: whether the reported waste pile has been removed or the location has been substantially cleaned in the AFTER photo. Do not pass if waste is merely moved within the scene or the after image is too unclear.
      - confidence: overall confidence from 0 to 1.

      Return only JSON:
      {"sameLocation":true,"wasteRemoved":true,"confidence":0.85}`
      : `Analyze this waste image. Return only JSON with:
      - wasteType: a concise category such as plastic, paper, glass, metal, organic, electronic, or mixed
      - quantity: an estimated amount including kg or liters
      - confidence: a number from 0 to 1

      Required shape:
      {"wasteType":"plastic","quantity":"1.5 kg","confidence":0.85}`;

    const imageParts = beforeImage
      ? [
          prompt,
          beforeImage,
          { inlineData: { data: imageData, mimeType } },
        ]
      : [prompt, { inlineData: { data: imageData, mimeType } }];
    const result = await withGeminiRetry(() =>
      model.generateContent(imageParts)
    );
    const verification = JSON.parse(result.response.text()) as {
      wasteType?: unknown;
      quantity?: unknown;
      sameLocation?: unknown;
      wasteRemoved?: unknown;
      confidence?: unknown;
    };

    if (beforeImage) {
      if (
        typeof verification.sameLocation !== "boolean" ||
        typeof verification.wasteRemoved !== "boolean" ||
        typeof verification.confidence !== "number"
      ) {
        throw new Error("Gemini returned an invalid collection result.");
      }

      return NextResponse.json({
        sameLocation: verification.sameLocation,
        wasteRemoved: verification.wasteRemoved,
        confidence: Math.min(1, Math.max(0, verification.confidence)),
      });
    }

    if (
      typeof verification.wasteType !== "string" ||
      typeof verification.quantity !== "string" ||
      typeof verification.confidence !== "number"
    ) {
      throw new Error("Gemini returned an invalid verification result.");
    }

    return NextResponse.json({
      wasteType: verification.wasteType,
      quantity: verification.quantity,
      confidence: Math.min(1, Math.max(0, verification.confidence)),
    });
  } catch (error) {
    console.error("Waste verification failed:", error);
    const responseError = geminiErrorResponse(error);
    return NextResponse.json(
      { error: responseError.message },
      { status: responseError.status }
    );
  }
}
