import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import db from '../lib/db'
import { hashPassword } from '../lib/crypto'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ayudapp_user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('ayudapp_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const usuario = await db.usuarios.get(username)
    if (!usuario) throw new Error('Usuario no encontrado')

    const hash = await hashPassword(password)
    if (usuario.password !== hash) throw new Error('Contraseña incorrecta')

    const userData = { username: usuario.username, role: usuario.role }
    setUser(userData)
    localStorage.setItem('ayudapp_user', JSON.stringify(userData))
    return userData
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('ayudapp_user')
  }

  const createUser = async (username, password, role = 'encuestador') => {
    const existing = await db.usuarios.get(username)
    if (existing) throw new Error('El usuario ya existe')

    const hash = await hashPassword(password)
    await db.usuarios.add({
      username,
      password: hash,
      role,
      createdBy: user?.username || null,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
    })

    return { username, role }
  }

  const deleteUser = async (username) => {
    if (username === 'admin') throw new Error('No se puede eliminar el admin principal')
    await db.usuarios.delete(username)
  }

  const getAllUsers = useCallback(async () => {
    return db.usuarios.where('role').notEqual('admin').toArray()
  }, [])

  const checkAdminExists = useCallback(async () => {
    const admin = await db.usuarios.get('admin')
    return !!admin
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      createUser,
      deleteUser,
      getAllUsers,
      checkAdminExists,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
