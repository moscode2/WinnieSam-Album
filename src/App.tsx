import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Gallery from './pages/Gallery'
const Admin = lazy(() => import('./pages/Admin'))
const QR = lazy(() => import('./pages/QR'))
export default function App() {
  return <Suspense fallback={<p className="p-10 text-center">Loading…</p>}><Routes>
    <Route path="/" element={<Home/>}/><Route path="/photos" element={<Upload/>}/>
    <Route path="/gallery" element={<Gallery/>}/><Route path="/admin" element={<Admin/>}/><Route path="/qr" element={<QR/>}/>
    <Route path="*" element={<Home/>}/></Routes></Suspense>
}
