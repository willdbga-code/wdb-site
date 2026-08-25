import { put, del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 });
    }

    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filename = `${folder}/${cleanFileName}`;

    // 1. If BLOB_READ_WRITE_TOKEN is configured (in Vercel or .env.local), use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      let blob;
      try {
        blob = await put(filename, file, { access: "public" });
      } catch (err: any) {
        if (err.message && err.message.includes("private store")) {
          blob = await put(filename, file, { access: "private" });
        } else {
          throw err;
        }
      }

      return NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
      });
    }

    // 2. If running on Vercel environment but BLOB_READ_WRITE_TOKEN is missing
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
      return NextResponse.json(
        {
          error:
            "O Vercel Blob ainda não foi conectado ao seu projeto na Vercel. Acesse o painel da Vercel -> Storage -> Conectar Vercel Blob.",
        },
        { status: 400 }
      );
    }

    // 3. Local Offline Development Fallback: Save to /public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, cleanFileName);
    await writeFile(filePath, buffer);

    const localUrl = `/uploads/${folder}/${cleanFileName}`;

    return NextResponse.json({
      url: localUrl,
      pathname: localUrl,
      contentType: file.type,
      isLocalFallback: true,
    });
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json({ error: error.message || "Erro no upload de arquivo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get("url");

    if (!urlToDelete) {
      return NextResponse.json({ error: "URL não fornecida" }, { status: 400 });
    }

    // If it's a Vercel Blob URL
    if (urlToDelete.includes("blob.vercel-storage.com")) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        await del(urlToDelete);
      }
      return NextResponse.json({ success: true });
    }

    // If it's a local fallback URL (/uploads/...)
    if (urlToDelete.startsWith("/uploads/") && !process.env.VERCEL) {
      const relativePath = urlToDelete.replace("/uploads/", "");
      const localFilePath = path.join(process.cwd(), "public", "uploads", relativePath);
      await unlink(localFilePath).catch(() => null);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Upload API Delete Error]:", error);
    return NextResponse.json({ error: error.message || "Erro ao deletar arquivo" }, { status: 500 });
  }
}
