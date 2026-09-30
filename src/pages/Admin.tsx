import { FormEvent, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Shell from '../components/Shell'
import { BUCKET, Photo, photoUrl, supabase } from '../lib/supabase'

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === undefined) return null
  return <Shell title="Admin">{session ? <Panel/> : <Login/>}</Shell>
}
function Login() {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  async function go(e: FormEvent) { e.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email, password: pw }); if (error) { console.error(error); setErr(error.message === 'Invalid login credentials' ? 'Incorrect email or password (or this user does not exist in Supabase).' : `Login failed: ${error.message}`) } }
  const f = 'w-full rounded-2xl border border-gold-soft bg-ivory px-4 py-3 mb-3'
  return <form onSubmit={go} className="card max-w-sm mx-auto">
    <input className={f} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/>
    <input className={f} type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)} required/>
    {err && <p className="text-red-800 text-sm mb-3">{err}</p>}<button className="btn-primary w-full">Sign in</button></form>
}
function Panel() {
  const [photos, setPhotos] = useState<Photo[]>([]), [admin, setAdmin] = useState<boolean | null>(null), [err, setErr] = useState('')
  const [filter, setFilter] = useState<'all' | 'hidden'>('all')
  async function load() {
    const { data: a } = await supabase.from('admins').select('user_id').maybeSingle()
    setAdmin(!!a); if (!a) return
    const { data, error } = await supabase.from('photos').select('*').order('uploaded_at', { ascending: false })
    if (error) setErr(error.message); else setPhotos(data)
  }
  useEffect(() => { load() }, [])
  async function toggle(p: Photo) {
    const { error } = await supabase.from('photos').update({ approved: !p.approved }).eq('id', p.id)
    if (error) setErr(error.message); else setPhotos(x => x.map(y => (y.id === p.id ? { ...y, approved: !p.approved } : y)))
  }
  async function del(p: Photo) {
    if (!confirm('Delete this photo permanently?')) return
    const r = await supabase.storage.from(BUCKET).remove([p.file_path]); if (r.error) return setErr(r.error.message)
    const { error } = await supabase.from('photos').delete().eq('id', p.id)
    if (error) setErr(error.message); else setPhotos(x => x.filter(y => y.id !== p.id))
  }
  if (admin === false) return <div className="card max-w-md mx-auto text-center"><p>This account isn't an administrator. See README → Admin setup.</p><button className="btn-ghost mt-4" onClick={() => supabase.auth.signOut()}>Sign out</button></div>
  const shown = photos.filter(p => filter === 'all' || !p.approved)
  return <>
    <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
      <div className="flex gap-2">{(['all', 'hidden'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm ${filter === f ? 'bg-sage-dark text-ivory' : 'bg-white border border-gold-soft'}`}>{f === 'all' ? `All (${photos.length})` : `Hidden/pending (${photos.filter(p => !p.approved).length})`}</button>)}</div>
      <div className="flex gap-2"><a href="/qr" className="btn-ghost !min-h-0 !py-2 !text-sm">QR &amp; Signage</a><button className="btn-ghost !min-h-0 !py-2 !text-sm" onClick={() => supabase.auth.signOut()}>Sign out</button></div></div>
    {err && <p className="text-red-800 mb-3">{err}</p>}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{shown.map(p => <div key={p.id} className="card !p-2">
      <img src={photoUrl(p.file_path)} loading="lazy" alt="" className={`w-full aspect-square object-cover rounded-2xl ${p.approved ? '' : 'opacity-40'}`}/>
      <p className="text-xs mt-2 px-1"><b>{p.guest_name || 'Anonymous'}</b><br/>{new Date(p.uploaded_at).toLocaleString()}</p>
      <div className="flex gap-2 mt-2"><button className="flex-1 rounded-full bg-sage/20 py-2 text-sm" onClick={() => toggle(p)}>{p.approved ? 'Reject' : 'Approve'}</button>
        <button className="flex-1 rounded-full bg-red-100 text-red-800 py-2 text-sm" onClick={() => del(p)}>Delete</button></div></div>)}</div>
  </>
}
