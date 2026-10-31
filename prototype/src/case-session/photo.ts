import type { PhotoInput } from "../case-model";

const MAX_SIDE = 1600;

export function scaledSize(width: number, height: number): { width: number; height: number } {
  const factor = Math.min(1, MAX_SIDE / Math.max(width, height));
  return { width: Math.round(width * factor), height: Math.round(height * factor) };
}

// ARC-015: at most 1600 pixels on the long side, encoded as JPEG, with the canvas API.
export async function downscalePhoto(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = scaledSize(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("photo encoding failed"))),
      "image/jpeg",
      0.85,
    ),
  );
}

export function toPhotoInput(blob: Blob): Promise<PhotoInput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const url = String(reader.result);
      resolve({ mediaType: "image/jpeg", dataBase64: url.slice(url.indexOf(",") + 1) });
    };
    reader.readAsDataURL(blob);
  });
}
