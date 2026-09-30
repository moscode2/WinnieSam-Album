import { useEffect, useState } from 'react'
import Shell from '../components/Shell'
import { COUPLE, WEDDING_DATE } from '../lib/config'
import { SITE_URL, uploadPageUrl } from '../lib/supabase'
import { download, qrPng, qrSvg, signagePdf, SIZES, SizeKey } from '../lib/qr'

export default function QR() {
  const url = uploadPageUrl(), [img, setImg] = useState(''), [busy, setBusy] = useState(false)
  const dev = !SITE_URL || /localhost|127\.0\.0\.1|192\.168\./.test(url)
  useEffect(() => { qrPng(url).then(setImg) }, [url])
  const btn = 'btn-ghost !min-h-0 !py-3 !text-base'
  return <Shell title="Scan to Share Your Photos" sub="Scan this code with your phone to upload and share your favourite wedding memories.">
    {dev && <p className="max-w-xl mx-auto mb-4 rounded-xl bg-amber-50 text-amber-900 text-sm p-3">⚠️ This QR points to <b>{url}</b>, which is not your live website. Set <code>VITE_SITE_URL</code> to your production domain and redeploy before printing.</p>}
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <div className="mx-auto w-full max-w-sm aspect-[210/297] rounded-lg bg-ivory border-[6px] border-double border-gold shadow-2xl p-6 flex flex-col items-center text-center text-sage-dark">
        <h2 className="text-2xl font-bold mt-4">CAPTURE THE MOMENTS</h2>
        <p className="font-serif italic text-sm mt-2 px-4">Scan to share your favourite photos and memories from {COUPLE}'s special day.</p>
        {img && <img src={img} alt="QR code linking to the photo upload page" className="w-3/4 mt-5 bg-white rounded-xl shadow"/>}
        <p className="text-[11px] mt-3">Point your phone camera at the QR code to upload your photos.</p>
        <div className="w-1/3 h-px bg-gold my-4"/><p className="font-serif text-2xl font-semibold">{COUPLE}</p><p className="text-gold text-xs tracking-[0.3em] mt-1">{WEDDING_DATE.toUpperCase()}</p></div>
      <div className="card space-y-5">
        <p className="text-sm break-all">Links to: <b>{url}</b></p>
        <div><h3 className="text-xl mb-2">QR code only</h3><div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button className={btn} onClick={() => download(img, 'winnie-sam-qr.png')}>PNG (2400px)</button>
          <button className={btn} onClick={async () => download(URL.createObjectURL(new Blob([await qrSvg(url)], { type: 'image/svg+xml' })), 'winnie-sam-qr.svg')}>SVG (vector)</button>
          <button className={btn} onClick={async () => download(await qrPng(url, true), 'winnie-sam-qr-transparent.png')}>Transparent PNG</button></div>
          <p className="text-xs mt-2 text-sage-dark/70">Transparent PNG: place only on light backgrounds; dark backgrounds make it unscannable.</p></div>
        <div><h3 className="text-xl mb-2">Print-ready signage (PDF)</h3><div className="grid grid-cols-2 gap-2">
          {(Object.keys(SIZES) as SizeKey[]).map(s => <button key={s} disabled={busy} className={btn} onClick={async () => { setBusy(true); try { await signagePdf(url, s) } finally { setBusy(false) } }}>{s} · {SIZES[s][0]}×{SIZES[s][1]} mm</button>)}</div>
          <p className="text-xs mt-2 text-sage-dark/70">A5/A4/A3 for signs, A6 for table cards &amp; programme inserts. Keep the QR at least 2.5 cm wide.</p></div>
      </div></div></Shell>
}
