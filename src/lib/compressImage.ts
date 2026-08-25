/**
 * Client-Side Smart Image Compressor for High-End Photography Portfolios
 * 
 * Resizes large camera files to optimal web resolution (max 2560px) and converts 
 * to modern WebP / JPEG with 85% quality, reducing file size by up to 90% without 
 * perceptible loss of visual fidelity.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.85)
  mimeType?: "image/webp" | "image/jpeg" | "image/png";
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // If SVG or small file (< 150KB), don't compress
  if (file.type === "image/svg+xml" || file.size < 150 * 1024) {
    return file;
  }

  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.85,
    mimeType = "image/webp",
  } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // If canvas context fails, return original file
          resolve(file);
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create compressed file with clean name and proper extension
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const extension = mimeType === "image/webp" ? "webp" : mimeType === "image/jpeg" ? "jpg" : "png";
            const compressedFileName = `${originalNameWithoutExt}.${extension}`;

            const compressedFile = new File([blob], compressedFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });

            console.log(
              `[Compression] ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)} MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - compressedFile.size / file.size) * 100)}% economizado)`
            );

            resolve(compressedFile);
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback to original
      };
    };

    reader.onerror = () => {
      resolve(file); // Fallback to original
    };
  });
}
