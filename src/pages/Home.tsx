import { Link } from 'react-router-dom'
import Shell from '../components/Shell'
import { COUPLE, WEDDING_DATE } from '../lib/config'
export default function Home() {
  return <Shell><section className="text-center pt-10 pb-6 rise">
    <p className="text-gold tracking-[0.4em] text-sm">✦ {WEDDING_DATE.toUpperCase()} ✦</p>
    <p className="font-serif italic text-2xl text-sage-dark mt-4">{COUPLE}</p>
    <h1 className="text-5xl md:text-7xl text-sage-dark mt-4 leading-tight">Capture the Moments</h1>
    <p className="mt-4 text-lg text-sage-dark/80 max-w-md mx-auto">Share your favourite memories from our special day.</p>
    <div className="mt-10 flex flex-col gap-4 max-w-sm mx-auto">
      <Link to="/photos" className="btn-primary">Upload Photos</Link>
      <Link to="/gallery" className="btn-ghost">View Wedding Gallery</Link></div>
    <p className="mt-6 text-sm text-sage-dark/70 italic">Your photos will become part of our wedding memories.</p>
  </section></Shell>
}
