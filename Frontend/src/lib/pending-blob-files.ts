/** Helpers for deferred image upload: preview with blob URLs, upload only on Save. */

export type PendingBlobFile = {
  id: string;
  file: File;
  previewUrl: string;
};

export function createPendingBlobFile(file: File): PendingBlobFile {
  return {
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function revokeBlobUrl(url: string | null | undefined) {
  if (!url?.startsWith("blob:")) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

export function revokePendingBlobFiles(items: PendingBlobFile[]) {
  for (const item of items) revokeBlobUrl(item.previewUrl);
}

export function clearPendingBlobFiles(
  items: PendingBlobFile[],
  setItems: (next: PendingBlobFile[]) => void
) {
  revokePendingBlobFiles(items);
  setItems([]);
}
