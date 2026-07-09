import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

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

const peoplePhotos = [
  '1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d',
  '1438761681033-6461ffad8d80', '1472099645785-5658abf4ff4e',
  '1506794778202-cad84cf45f1d', '1524504388940-b1c1722653e1',
  '1488426862026-3ea34d766590', '1560250097-0b93528c311a',
  '1544717301-9cdcb1f5940f', '1503919545889-aef636e10ad4',
  '1516627145497-ae6968895b74', '1524593689594-aae2f26b23ab',
  '1540569014015-19a7be504e3a', '1552058544-f2b08422138a',
  '1509967419530-da38b4704bc6', '1517457373958-b7bdd4587205',
  '1558618666-fcd25c85f82e', '1531746020-d74166554c04',
  '1517841905240-472988babdf9', '1544005313-94ddf0286df2',
  '1528892952291-009c663cee22', '1502827906530-20f6a0c0a7b6',
  '1531123420370-dd29f3b8955a', '1504591956812-f0c9b3c7e6e8',
  '1519331318064-258f29f6e37c', '1529627145592-dabfe1f1a0a4',
  '1546457332-eefa50ed27f4', '1554725336-2b1b9b9ba5f7',
  '1489424731084-a5d8b219a5bb', '1502827906530-20f6a0c0a7b6',
  '1549472219-2e0c0d4c3b7a', '1559489837-bc1e8f8f7e9a',
  '1504591956812-f0c9b3c7e6e8', '1546457332-eefa50ed27f4',
  '1559489837-bc1e8f8f7e9a', '1529627145592-dabfe1f1a0a4',
  '1528892952291-009c663cee22', '1479936343-716b1fd3d6c8',
]
const collageImages = peoplePhotos.map(
  id => `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=face`
)

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
      <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-0.5 opacity-20 pointer-events-none">
        {collageImages.map((src, i) => (
          <div
            key={i}
            className="bg-gray-200 bg-cover bg-center rounded-sm aspect-square"
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/60 pointer-events-none" />
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
