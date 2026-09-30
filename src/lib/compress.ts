/** Resize to max 2000px and re-encode as JPEG (~85% smaller), honouring EXIF rotation. */
export async function compress(file: File, max = 2000, quality = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('compress'))), 'image/jpeg', quality))
}
