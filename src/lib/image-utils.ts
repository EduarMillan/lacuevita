import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 2;
const MAX_WIDTH_PX = 1920;

export interface ProcessedImage {
  file: File;
  preview: string;
}

export async function processImage(file: File): Promise<ProcessedImage> {
  // If already under the limit and reasonable dimensions, skip compression
  const needsCompression = file.size > MAX_SIZE_MB * 1024 * 1024;

  const processed = needsCompression
    ? await imageCompression(file, {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_PX,
        useWebWorker: true,
        fileType: "image/webp",
      })
    : file;

  // Always convert to webp for consistency if not compressed
  const finalFile = needsCompression
    ? new File([processed], file.name.replace(/\.\w+$/, ".webp"), {
        type: "image/webp",
      })
    : processed;

  const preview = URL.createObjectURL(finalFile);

  return { file: finalFile, preview };
}

export function revokePreview(preview: string) {
  URL.revokeObjectURL(preview);
}
