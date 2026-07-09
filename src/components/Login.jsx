import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import {
  HeartIcon,
  HandRaisedIcon,
  UsersIcon,
  UserIcon,
  FaceSmileIcon,
  HomeIcon,
} from '@heroicons/react/24/solid'

function WheelchairIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="5" r="2" />
      <path d="M8 12h4l2 8h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  )
}

function CrutchesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 4v4a4 4 0 0 0 4 4" strokeLinecap="round" />
      <path d="M16 4v4a4 4 0 0 1-4 4" strokeLinecap="round" />
      <path d="M4 20l4-4" strokeLinecap="round" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
      <path d="M12 12v8" strokeLinecap="round" />
      <path d="M8 4h8" strokeLinecap="round" />
    </svg>
  )
}

function MotherIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="10" cy="7" r="3" />
      <path d="M6 18v-2a4 4 0 0 1 4-4" strokeLinecap="round" />
      <circle cx="18" cy="13" r="2" />
      <path d="M18 15v5M16 17h4" strokeLinecap="round" />
    </svg>
  )
}

function GrandfatherIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" strokeLinecap="round" />
      <path d="M16 8l4-4 4 4M20 4v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PetIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <ellipse cx="7" cy="12" rx="2.8" ry="3.5" />
      <ellipse cx="17" cy="12" rx="2.8" ry="3.5" />
      <ellipse cx="10" cy="6" rx="2.2" ry="3" />
      <ellipse cx="14" cy="6" rx="2.2" ry="3" />
      <ellipse cx="12" cy="15" rx="4.5" ry="5.5" />
      <ellipse cx="12" cy="21" rx="2.5" ry="1.5" />
    </svg>
  )
}

function MedicalIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  )
}

function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
    </div>
  )
}

const iconTiles = [
  { icon: HeartIcon, bg: '#ef4444' },
  { icon: HandRaisedIcon, bg: '#f97316' },
  { icon: UsersIcon, bg: '#8b5cf6' },
  { icon: UserIcon, bg: '#06b6d4' },
  { icon: FaceSmileIcon, bg: '#eab308' },
  { icon: MotherIcon, bg: '#ec4899' },
  { icon: GrandfatherIcon, bg: '#14b8a6' },
  { icon: WheelchairIcon, bg: '#3b82f6' },
  { icon: CrutchesIcon, bg: '#f59e0b' },
  { icon: HomeIcon, bg: '#10b981' },
  { icon: PetIcon, bg: '#a855f7' },
  { icon: MedicalIcon, bg: '#f43f5e' },
  { icon: HeartIcon, bg: '#dc2626' },
  { icon: UsersIcon, bg: '#7c3aed' },
  { icon: FaceSmileIcon, bg: '#ca8a04' },
  { icon: WheelchairIcon, bg: '#2563eb' },
]

const allTiles = Array.from({ length: 48 }, (_, i) => iconTiles[i % iconTiles.length])

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100">
      <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-0.5 pointer-events-none">
        {allTiles.map((tile, i) => (
          <div
            key={i}
            className="flex items-center justify-center rounded-sm aspect-square"
            style={{ backgroundColor: tile.bg }}
          >
            <tile.icon className="w-8 h-8 text-white/45" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <img src="/logo.webp" alt="AyudApp Luxor" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg object-cover" />
          <h1 className="text-3xl font-bold text-gray-800">AyudApp Luxor</h1>
          <p className="text-gray-500 mt-1">Censo y encuestas</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="bg-pastel-red text-red-600 text-sm p-3 rounded-lg">
              <p>{error}</p>
              <a
                href="https://wa.me/584128445726"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 underline"
              >
                Contactar al administrador por WhatsApp
              </a>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="Nombre de usuario"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-all shadow-md"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="text-xs text-gray-600 text-center mt-6 leading-relaxed">
          Hecho con 💛💙❤️ por el departamento de<br />Talento Humano de Supermercados Luxor
        </p>
      </div>
    </div>
  )
}
