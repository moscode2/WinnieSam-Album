import { COUPLE, WEDDING_DATE } from './config'
const DARK = '#1F2A1C'
export const qrPng = async (url: string, transparent = false) =>
  (await import('qrcode')).default.toDataURL(url, { width: 2400, margin: 4, errorCorrectionLevel: 'M', color: { dark: DARK, light: transparent ? '#00000000' : '#FFFFFF' } })
export const qrSvg = async (url: string) =>
  (await import('qrcode')).default.toString(url, { type: 'svg', margin: 4, errorCorrectionLevel: 'M', color: { dark: DARK, light: '#FFFFFF' } })
export const SIZES = { A3: [297, 420], A4: [210, 297], A5: [148, 210], 'A6 card': [105, 148] } as const
export type SizeKey = keyof typeof SIZES

export async function signagePdf(url: string, size: SizeKey) {
  const { jsPDF } = await import('jspdf')
  const [w, h] = SIZES[size], k = w / 148
  const pdf = new jsPDF({ unit: 'mm', format: [w, h] })
  pdf.setFillColor(251, 247, 238); pdf.rect(0, 0, w, h, 'F')
  pdf.setDrawColor(194, 162, 91)
  pdf.setLineWidth(w * 0.003); pdf.rect(w * 0.05, w * 0.05, w * 0.9, h - w * 0.1)
  pdf.setLineWidth(w * 0.001); pdf.rect(w * 0.065, w * 0.065, w * 0.87, h - w * 0.13)
  const C = { align: 'center' as const }
  pdf.setTextColor(78, 94, 69); pdf.setFont('times', 'bold'); pdf.setFontSize(25 * k)
  pdf.text('CAPTURE THE MOMENTS', w / 2, h * 0.15, C)
  pdf.setFont('times', 'italic'); pdf.setFontSize(11.5 * k)
  pdf.text(pdf.splitTextToSize(`Scan to share your favourite photos and memories from ${COUPLE}'s special day.`, w * 0.68), w / 2, h * 0.205, C)
  const q = w * 0.56, qx = (w - q) / 2, qy = h * 0.3
  pdf.setFillColor(255, 255, 255); pdf.setDrawColor(230, 215, 174); pdf.setLineWidth(w * 0.002)
  pdf.roundedRect(qx - w * 0.02, qy - w * 0.02, q + w * 0.04, q + w * 0.04, w * 0.02, w * 0.02, 'FD')
  pdf.addImage(await qrPng(url), 'PNG', qx, qy, q, q) // image includes 4-module quiet zone
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5 * k); pdf.setTextColor(78, 94, 69)
  pdf.text('Point your phone camera at the QR code to upload your photos.', w / 2, qy + q + w * 0.075, C)
  pdf.setDrawColor(194, 162, 91); pdf.setLineWidth(w * 0.002); pdf.line(w * 0.38, h * 0.845, w * 0.62, h * 0.845)
  pdf.setFont('times', 'bold'); pdf.setFontSize(24 * k); pdf.text(COUPLE, w / 2, h * 0.895, C)
  pdf.setTextColor(194, 162, 91); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11 * k)
  pdf.text(WEDDING_DATE.toUpperCase(), w / 2, h * 0.93, { ...C, charSpace: 1.2 })
  pdf.save(`winnie-sam-qr-signage-${size.replace(' ', '-')}.pdf`)
}
export function download(href: string, name: string) { const a = document.createElement('a'); a.href = href; a.download = name; a.click() }
