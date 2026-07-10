import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import {
  Heart, HandHelping, Users, User, SmilePlus, Baby,
  Accessibility, Stethoscope, House, PawPrint, Cross,
} from 'lucide-react'

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
  { icon: Heart, bg: '#ef4444' },
  { icon: HandHelping, bg: '#f97316' },
  { icon: Users, bg: '#8b5cf6' },
  { icon: User, bg: '#06b6d4' },
  { icon: SmilePlus, bg: '#eab308' },
  { icon: Baby, bg: '#ec4899' },
  { icon: Heart, bg: '#14b8a6' },
  { icon: Accessibility, bg: '#3b82f6' },
  { icon: Stethoscope, bg: '#f59e0b' },
  { icon: House, bg: '#10b981' },
  { icon: PawPrint, bg: '#a855f7' },
  { icon: Cross, bg: '#f43f5e' },
  { icon: Heart, bg: '#dc2626' },
  { icon: Users, bg: '#7c3aed' },
  { icon: SmilePlus, bg: '#ca8a04' },
  { icon: Accessibility, bg: '#2563eb' },
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
          <img src="/logo.webp" alt="Ayuda+" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg object-cover" />
          <h1 className="text-3xl font-bold text-gray-800">Ayuda+</h1>
          <p className="text-gray-500 mt-1">Una iniciativa de Supermercados Luxor</p>
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
        <p className="text-sm text-gray-600 text-center mt-4">
          Hecho con 💛💙❤️ por el departamento de Talento Humano
        </p>
      </div>
    </div>
  )
}
