/**
 * Tarayıcı üzerinde Canvas API ile görselleri optimize eden ve yeniden boyutlandıran merkezi yardımcı araç.
 */
export async function optimizeImageFile(
  file: File,
  maxDimension: number = 1024,
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'
): Promise<string> {
  // SVG dosyaları vektörel olduğu için doğrudan data URL olarak okunur
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (): void => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e): void => {
      const img = new Image()
      img.onload = (): void => {
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(e.target?.result as string)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        const optimizedDataUrl = canvas.toDataURL(mimeType)
        resolve(optimizedDataUrl)
      }
      img.onerror = (): void => reject(new Error('Görsel dosyası işlenemedi.'))
      img.src = e.target?.result as string
    }
    reader.onerror = (): void => reject(new Error('Dosya okunamadı.'))
    reader.readAsDataURL(file)
  })
}
