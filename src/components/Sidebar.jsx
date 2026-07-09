import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchRemoteSurveys, syncSurveys } from '../services/sync'
import SyncStatus from './SyncStatus'
import { HomeIcon, ChartBarSquareIcon, UsersIcon, InformationCircleIcon, HeartIcon, ArrowPathIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

const navItems = [
  { label: 'Tablero', path: '/tablero', icon: ChartBarSquareIcon, adminOnly: false },
  { label: 'Encuestas', path: '/dashboard', icon: HomeIcon, adminOnly: false },
  { label: 'Psicobienestar', path: '/psicobienestar', icon: HeartIcon, adminOnly: false },
  { label: 'Usuarios', path: '/users', icon: UsersIcon, adminOnly: true },
  { label: 'Más sobre Ayudapp', path: '/about', icon: InformationCircleIcon, adminOnly: false },
]

export default function Sidebar({ open, setOpen }) {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [syncing, setSyncing] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleForceSync = async () => {
    if (syncing || !navigator.onLine) return
    setSyncing(true)
    try {
      await fetchRemoteSurveys(user.username)
      await syncSurveys()
      window.location.reload()
    } catch {
      /* ignore */
    } finally {
      setSyncing(false)
    }
  }

  const isActive = (path) => location.pathname === path

  const menu = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="Logo" className="w-9 h-9 rounded-xl object-cover shadow-md shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">AyudApp Luxor</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 truncate">@{user?.username}</span>
              {isAdmin && (
                <span className="text-[10px] px-1.5 py-0.5 bg-sky-100 text-blue-600 rounded-full font-medium">Admin</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-2">
        <button
          onClick={handleForceSync}
          disabled={syncing || !navigator.onLine}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-sky-100 hover:text-blue-600 transition-all disabled:opacity-40"
        >
          <ArrowPathIcon className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Forzar sincronización'}
        </button>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Hecho con 💛💙❤️ por el departamento de<br />Talento Humano de Supermercados Luxor
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-pastel-red hover:text-red-500 transition-all"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <img src="/logo.webp" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <span className="font-bold text-gray-800 text-sm">AyudApp Luxor</span>
        </div>
        <SyncStatus />
      </div>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed top-0 left-0 z-20 h-full w-64 bg-white shadow-2xl border-r border-gray-200 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {menu}
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          {menu}
        </div>
      </div>
    </>
  )
}
