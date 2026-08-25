/**
 * Helper utility to upload, delete, and view files via Vercel Blob
 */

export function getPublicImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.includes("private.blob.vercel-storage.com") && !url.startsWith("/api/media")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function uploadToBlob(file: File, folder = "uploads"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Falha no upload para o Vercel Blob");
  }

  const data = await res.json();
  return data.url;
}

export async function deleteFromBlob(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const res = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.error("Erro ao deletar arquivo do Vercel Blob:", err);
    return false;
  }
}
