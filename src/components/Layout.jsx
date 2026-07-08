import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
