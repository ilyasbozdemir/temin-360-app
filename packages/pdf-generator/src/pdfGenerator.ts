import puppeteer from 'puppeteer';
import { pdfStore } from './pdfStore';

/**
 * PDF oluşturma fonksiyonu seçenekleri.
 */
export interface GeneratePdfOptions {
  /** Şablon kimlik kiti / şablon adı. */
  templateId: string;
  /** Şablona basılacak dinamik veri nesnesi. */
  data: any;
  /** Sunucu ana adresi (Örn: "http://localhost:3000"). */
  baseUrl: string;
  /** Sayfa boyutu ('A4' veya 'A3'). */
  pageSize?: 'A4' | 'A3';
  /** Sayfa yönelimi (yatay için true, dikey için false). */
  isLandscape?: boolean;
}

/**
 * Puppeteer kullanarak dinamik belgeden PDF verisi (Buffer) üretir.
 * @param options - PDF oluşturma seçenekleri.
 * @returns Oluşturulan PDF belgesinin Buffer nesnesi.
 */
export async function generatePDF({
  templateId,
  data,
  baseUrl,
  pageSize = 'A4',
  isLandscape = false
}: GeneratePdfOptions): Promise<Buffer> {
  const id = Math.random().toString(36).substring(2, 15);
  pdfStore.set(id, templateId, data);

  const renderUrl = `${baseUrl}/pdf-render?id=${id}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 2,
    });

    await page.goto(renderUrl, { waitUntil: 'networkidle0' });

    await page.waitForFunction('window.__PDF_READY === true', { timeout: 10000 }).catch(() => {
      console.warn("PDF_READY bayrağı gelmedi, timeout oldu ancak devam ediliyor.");
    });

    const pdfBuffer = await page.pdf({
      format: pageSize as any,
      landscape: isLandscape,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
    pdfStore.remove(id);
  }
}
