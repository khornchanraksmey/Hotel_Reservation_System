export function getImagePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Only JPEG, PNG, and WebP images are allowed.';
  if (file.size > 5 * 1024 * 1024) return 'Image must be smaller than 5MB.';
  return null;
}

export function validateSlipFile(file: File): string | null {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowed.includes(file.type)) return 'Only images or PDF files are allowed.';
  if (file.size > 10 * 1024 * 1024) return 'File must be smaller than 10MB.';
  return null;
}
