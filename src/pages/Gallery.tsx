import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../components/Shell'
import Lightbox from '../components/Lightbox'
import { Photo, photoUrl, supabase } from '../lib/supabase'
const PAGE = 40
export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]), [more, setMore] = useState(true), [err, setErr] = useState(''), [loading, setLoading] = useState(true), [open, setOpen] = useState<number | null>(null)
  const load = useCallback(async (from: number) => {
    setLoading(true)
    const { data, error } = await supabase.from('photos').select('id,file_path,guest_name,uploaded_at,approved').eq('approved', true).order('uploaded_at', { ascending: false }).range(from, from + PAGE - 1)
    setLoading(false)
    if (error) return setErr("We couldn't load the gallery. Please check your connection and try again.")
    setErr(''); setPhotos(p => (from ? [...p, ...data] : data)); setMore(data.length === PAGE)
  }, [])
  useEffect(() => { load(0) }, [load])
  return <Shell title="Wedding Gallery" sub="Memories shared by our lovely guests">
    {err && <p className="text-center text-red-800 mb-4">{err} <button className="underline" onClick={() => load(photos.length)}>Retry</button></p>}
    {!loading && !err && !photos.length && <div className="text-center"><p>No photos yet — be the first to share one!</p><Link to="/photos" className="btn-primary mt-5">Upload Photos</Link></div>}
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3">{photos.map((p, i) =>
      <figure key={p.id} className="mb-3 break-inside-avoid rounded-2xl overflow-hidden bg-cream shadow-md shadow-gold/10 cursor-pointer" onClick={() => setOpen(i)}>
        <img src={photoUrl(p.file_path)} loading="lazy" decoding="async" alt={p.guest_name ? `Photo by ${p.guest_name}` : 'Wedding photo'} className="w-full block min-h-[120px]"/>
        <figcaption className="px-3 py-2 text-xs text-sage-dark">{p.guest_name && <b className="block">{p.guest_name}</b>}{new Date(p.uploaded_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</figcaption></figure>)}</div>
    {loading && <p className="text-center mt-4">Loading…</p>}
    {more && !loading && photos.length > 0 && <div className="text-center mt-6"><button className="btn-ghost" onClick={() => load(photos.length)}>Load more</button></div>}
    {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)}/>}
  </Shell>
}
