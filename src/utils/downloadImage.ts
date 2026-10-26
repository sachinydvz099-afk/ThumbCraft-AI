/**
 * Robust Cross-Origin Image Downloader
 * 
 * Attempts:
 * 1. Fetch as Blob with CORS.
 * 2. Canvas-based Blob conversion fallback.
 * 3. Direct browser download trigger.
 * 4. Graceful new-tab fallback if CORS restricts client-side blob creation.
 */

export interface DownloadResult {
  success: boolean;
  method: 'blob' | 'canvas' | 'direct' | 'new-tab';
  message: string;
}

export async function downloadImage(
  imageUrl: string,
  suggestedFilename: string
): Promise<DownloadResult> {
  // Method 1: Fetch as Blob with CORS
  try {
    const response = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'no-cache',
    });

    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, suggestedFilename);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      return {
        success: true,
        method: 'blob',
        message: 'Thumbnail downloaded successfully!',
      };
    }
  } catch (corsErr) {
    console.warn('Direct fetch/blob download prevented by CORS. Attempting canvas fallback...', corsErr);
  }

  // Method 2: Off-screen Canvas conversion with anonymous CORS
  try {
    const canvasBlob = await fetchViaCanvas(imageUrl);
    if (canvasBlob) {
      const objectUrl = URL.createObjectURL(canvasBlob);
      triggerDownload(objectUrl, suggestedFilename);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      return {
        success: true,
        method: 'canvas',
        message: 'Thumbnail downloaded successfully via Canvas!',
      };
    }
  } catch (canvasErr) {
    console.warn('Canvas-based download fallback blocked:', canvasErr);
  }

  // Method 3: Direct <a> download attribute trigger
  try {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = suggestedFilename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      method: 'new-tab',
      message: 'Opened thumbnail in a new tab. Right-click and choose "Save Image As..." if the download did not start automatically.',
    };
  } catch (finalErr) {
    // Method 4: Open in new window
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      method: 'new-tab',
      message: 'Opened image in a new tab for manual saving due to browser cross-origin policy.',
    };
  }
}

function triggerDownload(blobUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function fetchViaCanvas(imageUrl: string): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
}
