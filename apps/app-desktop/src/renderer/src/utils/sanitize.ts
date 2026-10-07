import DOMPurify from 'dompurify';

/**
 * Kullanıcı girdisi veya şablon motorundan gelen HTML içeriğini zararlı script ve XSS
 * vektörlerinden arındırır.
 *
 * @param dirtyHtml - Arındırılmamış ham HTML metni
 * @returns Güvenli ve sanitize edilmiş HTML metni
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['style'],
    ADD_ATTR: ['target', 'style', 'class', 'colspan', 'rowspan']
  });
}
