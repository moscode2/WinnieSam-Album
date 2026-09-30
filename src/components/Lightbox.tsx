import { useEffect, useRef } from 'react'
import { Photo, photoUrl } from '../lib/supabase'
export default function Lightbox({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const p = photos[index], x0 = useRef(0)
  const go = (d: number) => onIndex((index + d + photos.length) % photos.length)
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' ? onClose() : e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' && go(-1)
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  })
  const b = 'absolute text-white text-3xl w-12 h-12 rounded-full bg-black/30 flex items-center justify-center'
  return <div className="fixed inset-0 z-50 bg-ink/95 flex flex-col items-center justify-center p-4"
    onTouchStart={e => (x0.current = e.touches[0].clientX)} onTouchEnd={e => { const d = e.changedTouches[0].clientX - x0.current; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1) }}>
    <button aria-label="Close" className={`${b} top-4 right-4`} onClick={onClose}>×</button>
    <button aria-label="Previous" className={`${b} left-3`} onClick={() => go(-1)}>‹</button>
    <button aria-label="Next" className={`${b} right-3`} onClick={() => go(1)}>›</button>
    <img src={photoUrl(p.file_path)} alt="" className="max-h-[80vh] max-w-full rounded-xl object-contain"/>
    <p className="text-ivory mt-3 text-sm">{p.guest_name ? `${p.guest_name} · ` : ''}{new Date(p.uploaded_at).toLocaleString()}</p>
  </div>
}
