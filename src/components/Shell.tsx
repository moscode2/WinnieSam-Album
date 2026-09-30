import { Link, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { COUPLE, WEDDING_DATE } from '../lib/config'
export default function Shell({ children, title, sub }: { children: ReactNode; title?: string; sub?: string }) {
  const { pathname } = useLocation()
  const nav = [['/photos', 'Upload'], ['/gallery', 'Gallery']]
  return <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#F3ECDC,#FBF7EE_60%)]">
    <header className="max-w-5xl mx-auto flex items-center justify-between px-5 py-4">
      <Link to="/" className="font-serif text-xl tracking-widest text-sage-dark">{COUPLE.toUpperCase()}</Link>
      <nav className="flex gap-5 text-sm">{nav.map(([to, l]) => <Link key={to} to={to} className={pathname === to ? 'text-gold font-medium' : 'text-sage-dark'}>{l}</Link>)}</nav>
    </header>
    <main className="max-w-5xl mx-auto px-5 pb-16">
      {title && <div className="text-center my-8 rise"><h1 className="text-4xl md:text-5xl text-sage-dark">{title}</h1>{sub && <p className="mt-2 text-sage-dark/80">{sub}</p>}<div className="mx-auto mt-4 h-px w-24 bg-gold"/></div>}
      {children}</main>
    <footer className="text-center text-xs text-sage-dark/60 pb-8 tracking-widest">{COUPLE.toUpperCase()} · {WEDDING_DATE.toUpperCase()}</footer>
  </div>
}
