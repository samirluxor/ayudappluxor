import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

function PasswordInput({ value, onChange, placeholder }) {
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

export default function AdminSetup() {
  const { checkAdminExists, createUser, login } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [adminExists, setAdminExists] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAdminExists().then((exists) => {
      setAdminExists(exists)
      setChecking(false)
      if (exists) navigate('/login')
    })
  }, [checkAdminExists, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }

    setLoading(true)
    try {
      await createUser(username, password, 'admin')
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-sky-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.webp" alt="Ayuda+" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg object-cover" />
          <h1 className="text-3xl font-bold text-gray-800">Ayuda+</h1>
          <p className="text-gray-500 mt-1">Configuración inicial</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            Crear Administrador
          </h2>
          <p className="text-sm text-gray-500 text-center">
            Crea la cuenta de administrador para gestionar los encuestadores
          </p>

          {error && (
            <div className="bg-pastel-red text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Usuario del admin
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirmar contraseña
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-all shadow-md"
          >
            {loading ? 'Creando...' : 'Crear administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}
