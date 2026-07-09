import { useState } from 'react'
import Sidebar from './Sidebar'
import SyncStatus from './SyncStatus'

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="lg:pl-64">
        <div className="hidden lg:flex fixed top-0 right-0 z-20 h-14 items-center justify-end px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200" style={{ left: '16rem' }}>
          <SyncStatus />
        </div>
        <main className="max-w-4xl mx-auto px-4 py-6 pt-14 lg:pt-20">
          {children}
        </main>
      </div>
    </div>
  )
}