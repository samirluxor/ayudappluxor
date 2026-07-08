import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EyeIcon, EyeSlashIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function UserManagement() {
  const { isAdmin, createUser, deleteUser, getAllUsers } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard')
  }, [isAdmin, navigate])

  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [getAllUsers])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username || !password) {
      setError('Usuario y contraseña son obligatorios')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }

    setLoading(true)
    try {
      await createUser(username, password, 'encuestador')
      setSuccess(`Encuestador "${username}" creado exitosamente`)
      setUsername('')
      setPassword('')
      setShowForm(false)
      const updated = await getAllUsers()
      setUsers(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (username) => {
    if (!window.confirm(`¿Eliminar al encuestador "${username}"?`)) return
    try {
      await deleteUser(username)
      const updated = await getAllUsers()
      setUsers(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-gray-500 text-sm">Administrar encuestadores</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Encuestadores ({users.length})
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nuevo
          </button>
        </div>

        {error && (
          <div className="bg-pastel-red text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-pastel-blue text-blue-600 text-sm p-3 rounded-lg">
            {success}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-sky-50 rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-gray-700 text-sm">Nuevo encuestador</h4>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                placeholder="Nombre de usuario"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(''); setUsername(''); setPassword('') }}
                className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
              >
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

        {users.length === 0 && !showForm && (
          <p className="text-gray-400 text-sm text-center py-6">
            No hay encuestadores registrados
          </p>
        )}

        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.username}
              className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{u.username}</p>
                  <p className="text-xs text-gray-400">
                    {u.syncStatus === 'pending' ? 'Pendiente de sync' : 'Sincronizado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(u.username)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
