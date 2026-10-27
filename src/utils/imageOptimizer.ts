/**
 * Client-side image compressor and optimizer to ensure images uploaded to Firestore
 * stay well within the 1MB document limit, allowing instant synchronization across all devices.
 */

export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.78
): Promise<string> {
  // If it's a regular web link (Unsplash, external URL, etc.), return as is
  if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
    return fileOrDataUrl;
  }

  let dataUrl: string;
  if (fileOrDataUrl instanceof File) {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    });
  } else {
    dataUrl = fileOrDataUrl;
  }

  // If already a tiny data URL (e.g. svg or tiny icon < 30KB), return as is
  if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.length < 35000) {
    return dataUrl;
  }

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(dataUrl);
        return;
      }

      // Calculate scale to fit within maxWidth and maxHeight
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as optimized JPEG
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => {
      // In case of error loading, return original dataUrl
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
