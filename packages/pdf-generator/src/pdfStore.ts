import fs from 'fs';
import path from 'path';

/**
 * Geçici PDF oluşturma verisi yapısı.
 */
export interface PdfData {
  /** Şablon ID. */
  templateId: string;
  /** Şablona iletilecek veri nesnesi. */
  data: any;
  /** Oluşturulma zaman damgası (Epoch ms). */
  timestamp: number;
}

const CACHE_DIR = path.join(process.cwd(), '.pdf-cache');

/**
 * Geçici PDF render verilerini disk önbelleğinde tutan depo sınıfı.
 */
export class PdfStore {
  constructor() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  /**
   * Belirtilen kimlik ile PDF render verisini önbelleğe kaydeder.
   * @param id - Benzersiz istek kimliği.
   * @param templateId - Şablon ID.
   * @param data - Şablon verisi.
   */
  set(id: string, templateId: string, data: any) {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    const payload: PdfData = {
      templateId,
      data,
      timestamp: Date.now()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(payload), 'utf-8');

    // Cleanup old entries (older than 5 minutes)
    this.cleanup();
  }

  /**
   * Önbellekteki PDF render verisini okur.
   * @param id - Benzersiz istek kimliği.
   * @returns Bulunursa PdfData, yoksa undefined.
   */
  get(id: string): PdfData | undefined {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as PdfData;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Önbellekteki kaydı siler.
   * @param id - Benzersiz istek kimliği.
   */
  remove(id: string) {
    const filePath = path.join(CACHE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * 5 dakikadan eski önbellek dosyalarını temizleyen dahili metot.
   */
  private cleanup() {
    try {
      const files = fs.readdirSync(CACHE_DIR);
      const now = Date.now();
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(CACHE_DIR, file);
        const stats = fs.statSync(filePath);
        
        // 5 dakikadan eski dosyaları sil
        if (now - stats.mtimeMs > 5 * 60 * 1000) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

/** Standart PdfStore tekil örneği. */
export const pdfStore = new PdfStore();

