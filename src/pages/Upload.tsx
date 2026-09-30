import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../components/Shell'
import { ACCEPT, MAX_PHOTOS, MAX_RAW_MB } from '../lib/config'
import { compress } from '../lib/compress'
import { BUCKET, supabase } from '../lib/supabase'

type Item = { id: string; file: File; preview: string }
const OK = ['image/jpeg', 'image/png', 'image/webp']
const timeout = <T,>(p: Promise<T>, ms = 60000) => Promise.race([p, new Promise<T>((_, r) => setTimeout(() => r(new Error('timeout')), ms))])
const FAIL = 'Something went wrong while uploading your photos. Please check your connection and try again.'

export default function Upload() {
  const [items, setItems] = useState<Item[]>([]), [name, setName] = useState('')
  const [busy, setBusy] = useState(false), [done, setDone] = useState(0), [total, setTotal] = useState(0)
  const [msg, setMsg] = useState(''), [detail, setDetail] = useState(''), [ok, setOk] = useState(0), lock = useRef(false), input = useRef<HTMLInputElement>(null)

  function pick(files: FileList | null) {
    if (!files) return
    const errs: string[] = [], next = [...items]
    for (const f of Array.from(files)) {
      if (!OK.includes(f.type)) { errs.push(`"${f.name}" isn't supported. Please choose JPG, PNG or WEBP photos.`); continue }
      if (f.size > MAX_RAW_MB * 1024 * 1024) { errs.push(`"${f.name}" is too large (max ${MAX_RAW_MB} MB).`); continue }
      if (next.some(i => i.file.name === f.name && i.file.size === f.size && i.file.lastModified === f.lastModified)) continue // duplicate
      if (next.length >= MAX_PHOTOS) { errs.push(`You can upload up to ${MAX_PHOTOS} photos at a time. Upload these, then add more!`); break }
      next.push({ id: crypto.randomUUID(), file: f, preview: URL.createObjectURL(f) })
    }
    setItems(next); setMsg(errs.join(' ')); setOk(0)
    if (input.current) input.current.value = ''
  }
  const remove = (id: string) => setItems(items.filter(i => { if (i.id === id) URL.revokeObjectURL(i.preview); return i.id !== id }))

  async function upload() {
    if (lock.current) return
    if (!items.length) { setMsg('Please choose at least one photo first.'); return }
    lock.current = true; setBusy(true); setMsg(''); setDone(0); setTotal(items.length)
    const failed: Item[] = []; let good = 0, last = ''; setDetail('')
    for (const it of items) {
      try {
        const blob = await compress(it.file), path = `guest/${crypto.randomUUID()}.jpg`
        const up = await timeout(supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' }))
        if (up.error) throw up.error
        const ins = await timeout(Promise.resolve(supabase.from("photos").insert({ file_path: path, guest_name: name.trim().slice(0, 60) || null })))
        if (ins.error) { await supabase.storage.from(BUCKET).remove([path]).catch(() => {}); throw ins.error }
        good++; URL.revokeObjectURL(it.preview)
      } catch (e: any) { console.error('Upload error:', e); last = e?.message || String(e); failed.push(it) }
      setDone(d => d + 1)
    }
    setDetail(last); setItems(failed); setOk(good); setBusy(false); lock.current = false
    if (failed.length) setMsg(good ? `${good} uploaded, but ${failed.length} didn't go through. ${FAIL}` : FAIL)
  }

  if (ok && !items.length) return <Shell title="Thank You!" sub="Your photos are now part of our memories.">
    <div className="card max-w-md mx-auto text-center rise"><div className="text-6xl">💐</div>
      <p className="mt-3 text-lg">{ok} photo{ok > 1 ? 's' : ''} uploaded successfully.</p>
      <div className="mt-6 flex flex-col gap-3"><Link to="/gallery" className="btn-primary">View Wedding Gallery</Link>
        <button className="btn-ghost" onClick={() => setOk(0)}>Upload more photos</button></div></div></Shell>

  return <Shell title="Share Your Photos" sub={`Up to ${MAX_PHOTOS} photos at a time · JPG, PNG or WEBP · large photos are resized automatically`}>
    <div className="card max-w-xl mx-auto rise">
      <label className="block text-sm mb-1 text-sage-dark">Your name (optional)</label>
      <input value={name} maxLength={60} onChange={e => setName(e.target.value)} disabled={busy} placeholder="e.g. Auntie Mei" className="w-full rounded-2xl border border-gold-soft bg-ivory px-4 py-3 text-base outline-none focus:border-gold"/>
      <input ref={input} type="file" multiple accept={ACCEPT} className="hidden" onChange={e => pick(e.target.files)}/>
      <button className="btn-primary w-full mt-5 text-xl" disabled={busy} onClick={() => input.current?.click()}>📷 {items.length ? 'Add more photos' : 'Choose Photos'}</button>
      {items.length > 0 && <div className="grid grid-cols-3 gap-2 mt-5">{items.map(i => <div key={i.id} className="relative aspect-square">
        <img src={i.preview} alt="" className="w-full h-full object-cover rounded-xl"/>
        {!busy && <button aria-label="Remove photo" onClick={() => remove(i.id)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-ink text-white text-lg shadow">×</button>}</div>)}</div>}
      {msg && <p role="alert" className="mt-4 rounded-xl bg-red-50 text-red-800 text-sm p-3">{msg}{detail && <span className="block mt-2 text-xs opacity-70">Details: {detail}</span>}</p>}
      {busy && <div className="mt-4"><div className="h-3 rounded-full bg-cream overflow-hidden"><div className="h-full bg-gold transition-all" style={{ width: `${(done / total) * 100}%` }}/></div>
        <p className="text-center text-sm mt-1">Uploading {Math.min(done + 1, total)} of {total}… please keep this page open</p></div>}
      <button className="btn-primary w-full mt-5 text-xl" disabled={busy || !items.length} onClick={upload}>{busy ? 'Uploading…' : `Upload ${items.length || ''} Photo${items.length === 1 ? '' : 's'}`}</button>
    </div></Shell>
}
