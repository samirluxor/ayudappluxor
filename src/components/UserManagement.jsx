import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buscarCedula } from '../services/cedula'
import { syncUsuarios } from '../services/sync'
import { EyeIcon, EyeSlashIcon, TrashIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import ConfirmModal from './ConfirmModal'

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
  const { isAdmin, createUser, updatePassword, deleteUser, getAllUsers } = useAuth()
  const navigate = useNavigate()
  const cedulaTimer = useRef(null)
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [password, setPassword] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [editPassword, setEditPassword] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard')
  }, [isAdmin, navigate])

  useEffect(() => {
    async function load() {
      if (navigator.onLine) await syncUsuarios()
      const u = await getAllUsers()
      setUsers(u)
    }
    load()
  }, [getAllUsers])

  const buscarAuto = (value) => {
    if (cedulaTimer.current) clearTimeout(cedulaTimer.current)
    const num = value.replace(/[VEve-]/g, '').trim()
    if (num.length < 6) return
    cedulaTimer.current = setTimeout(async () => {
      setBuscando(true)
      const data = await buscarCedula(`V-${num}`)
      if (data) {
        setNombre(data.nombre || '')
        setApellido(data.apellido || '')
      }
      setBuscando(false)
    }, 600)
  }

  const resetForm = () => {
    setCedula('')
    setNombre('')
    setApellido('')
    setPassword('')
    setError('')
    setSuccess('')
    setShowForm(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const num = cedula.replace(/[VEve-]/g, '').trim()
    if (!num || !password) {
      setError('Cédula y contraseña son obligatorios')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }

    setLoading(true)
    try {
      await createUser(num, password, 'encuestador', { nombre, apellido })
      setSuccess(`Encuestador "${num}" creado exitosamente`)
      resetForm()
      const updated = await getAllUsers()
      setUsers(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPassword = async (username) => {
    if (!editPassword || editPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await updatePassword(username, editPassword)
      setSuccess(`Contraseña actualizada para "${username}"`)
      setEditUser(null)
      setEditPassword('')
      const updated = await getAllUsers()
      setUsers(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget)
      const updated = await getAllUsers()
      setUsers(updated)
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
    }
  }

  const displayName = (u) => {
    if (u.nombre || u.apellido) return `${u.nombre || ''} ${u.apellido || ''}`.trim()
    return u.username
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
          <p className="text-gray-500 text-sm">Administrar usuarios del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Usuarios ({users.length})
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
          <div className="bg-pastel-red text-red-600 text-sm p-3 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="bg-pastel-blue text-blue-600 text-sm p-3 rounded-lg">{success}</div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-sky-50 rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-gray-700 text-sm">Nuevo encuestador</h4>
            <div className="relative">
              <label className="block text-xs font-medium text-gray-500 mb-1">Cédula (será su usuario)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cedula}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setCedula(v); buscarAuto(v) }}
                  className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                  placeholder="12345678"
                  required
                />
                {buscando && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input type="text" value={nombre} readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
                <input type="text" value={apellido} readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm outline-none" />
              </div>
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
              <button type="button" onClick={resetForm}
                className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-all shadow-sm">
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

        {users.length === 0 && !showForm && (
          <p className="text-gray-400 text-sm text-center py-6">No hay usuarios registrados</p>
        )}

        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.username}>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                    {displayName(u).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      <span className="truncate">{displayName(u)}</span>
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {u.role === 'admin' ? 'Admin' : 'Encuestador'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      @{u.username}
                      {u.syncStatus === 'pending' && <span className="ml-2 text-amber-500">Pendiente</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {u.role !== 'admin' && (
                    <>
                      <button onClick={() => setEditUser(u)}
                        className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors" title="Cambiar contraseña">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(u.username)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {editUser?.username === u.username && (
                <div className="mt-1 ml-11 bg-sky-50 rounded-xl p-3 flex items-center gap-2">
                  <PasswordInput
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                  />
                  <button onClick={() => handleEditPassword(u.username)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                    Guardar
                  </button>
                  <button onClick={() => { setEditUser(null); setEditPassword('') }}
                    className="px-3 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al encuestador "${deleteTarget}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
