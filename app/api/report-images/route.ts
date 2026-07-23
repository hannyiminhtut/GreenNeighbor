import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary image storage is not configured." },
      { status: 500 }
    );
  }

  try {
    const form = await request.formData();
    const image = form.get("image");

    if (!(image instanceof File) || !image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "A supported image file is required." },
        { status: 400 }
      );
    }
    if (image.size > 10_000_000) {
      return NextResponse.json(
        { error: "The report image must be smaller than 10 MB." },
        { status: 400 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "smart-waste/reports";
    const signature = createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const upload = new FormData();
    upload.append("file", image);
    upload.append("api_key", apiKey);
    upload.append("timestamp", timestamp);
    upload.append("folder", folder);
    upload.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: upload }
    );
    const result = (await response.json()) as {
      secure_url?: string;
      error?: { message?: string };
    };

    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message || "Image upload failed.");
    }

    return NextResponse.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error("Report image upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed." },
      { status: 500 }
    );
  }
}
