import { NextRequest, NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        blobs: [],
        totalBytes: 0,
        message: "BLOB_READ_WRITE_TOKEN não configurado",
      });
    }

    const { blobs } = await list();

    let totalBytes = 0;
    const formattedBlobs = blobs.map((b) => {
      totalBytes += b.size;

      // Classify folder / origin for easy navigation
      let folderLabel = "Geral";
      if (b.pathname.startsWith("settings/heroImage")) folderLabel = "Hero (Aparência)";
      else if (b.pathname.startsWith("settings/aboutImage")) folderLabel = "Sobre (Aparência)";
      else if (b.pathname.startsWith("settings/signatureIcon")) folderLabel = "Assinatura (Aparência)";
      else if (b.pathname.startsWith("portfolio")) folderLabel = "Portfólio";
      else if (b.pathname.startsWith("galleries")) folderLabel = "Galerias de Clientes";
      else if (b.pathname.startsWith("profile")) folderLabel = "Fotos de Perfil";
      else if (b.pathname.startsWith("test")) folderLabel = "Testes / Sistema";

      const fileName = b.pathname.split("/").pop() || b.pathname;

      const proxyUrl = b.url.includes("private.blob.vercel-storage.com")
        ? `/api/media?url=${encodeURIComponent(b.url)}`
        : b.url;

      return {
        id: b.url,
        url: proxyUrl,
        rawUrl: b.url,
        downloadUrl: b.downloadUrl,
        pathname: b.pathname,
        filename: fileName,
        folder: folderLabel,
        sizeBytes: b.size,
        sizeFormatted: formatBytes(b.size),
        uploadedAt: b.uploadedAt,
      };
    });

    // Sort newest first
    formattedBlobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json({
      blobs: formattedBlobs,
      totalBytes,
      totalFormatted: formatBytes(totalBytes),
      count: formattedBlobs.length,
    });
  } catch (error: any) {
    console.error("[Storage List API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo informado para exclusão" }, { status: 400 });
    }

    // Delete in batch using @vercel/blob del
    await del(urls);

    return NextResponse.json({ success: true, deletedCount: urls.length });
  } catch (error: any) {
    console.error("[Storage Delete API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
