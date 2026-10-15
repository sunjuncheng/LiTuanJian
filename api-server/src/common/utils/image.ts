export function fixImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;
  const baseUrl = process.env.BASE_URL || 'http://123.56.72.218';
  const match = url.match(/(\/uploads\/.+)$/);
  if (match) {
    return baseUrl + match[1];
  }
  if (url.startsWith('/uploads/')) {
    return baseUrl + url;
  }
  return url;
}
