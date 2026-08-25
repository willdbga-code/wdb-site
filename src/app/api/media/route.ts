import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return new NextResponse("Parâmetro de URL ausente", { status: 400 });
    }

    // Prepare headers for Private Vercel Blob access
    const headers: Record<string, string> = {};
    if (process.env.BLOB_READ_WRITE_TOKEN && targetUrl.includes("private.blob.vercel-storage.com")) {
      headers["Authorization"] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
    }

    const response = await fetch(targetUrl, { headers });

    if (!response.ok) {
      return new NextResponse(`Erro ao carregar mídia: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[Media Proxy Error]:", error);
    return new NextResponse(error.message || "Erro no servidor de mídia", { status: 500 });
  }
}
