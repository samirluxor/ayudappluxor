import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import db from '../lib/db'
import { hashPassword } from '../lib/crypto'
import { supabase } from '../lib/supabase'

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
    const key = username.toLowerCase()
    let usuario = await db.usuarios.get(key)

    if (!usuario && navigator.onLine) {
      const { data } = await supabase.from('usuarios').select('*').eq('username', key).single()
      if (data) {
        await db.usuarios.add({
          username: key,
          password: data.password,
          role: data.role,
          createdBy: data.created_by,
          syncStatus: 'synced',
          createdAt: data.created_at,
        })
        usuario = data
      }
    }

    if (!usuario) throw new Error('Usuario no encontrado')

    const hash = await hashPassword(password)
    if (usuario.password !== hash) throw new Error('Contraseña incorrecta')

    const userData = { username: key, role: usuario.role }
    setUser(userData)
    localStorage.setItem('ayudapp_user', JSON.stringify(userData))

    if (navigator.onLine) {
      import('../services/sync').then(({ syncUsuarios, fetchRemoteSurveys, syncSurveys }) => {
        syncUsuarios().catch(() => {})
        fetchRemoteSurveys(key).catch(() => {})
        syncSurveys().catch(() => {})
      })
    }

    return userData
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('ayudapp_user')
  }

  const createUser = async (username, password, role = 'encuestador', extra = {}) => {
    const key = username.toLowerCase()
    const existing = await db.usuarios.get(key)
    if (existing) throw new Error('El usuario ya existe')

    const hash = await hashPassword(password)
    await db.usuarios.add({
      username: key,
      password: hash,
      role,
      nombre: extra.nombre || '',
      apellido: extra.apellido || '',
      createdBy: user?.username || null,
      syncStatus: 'pending',
      createdAt: new Date().toISOString(),
    })

    return { username: key, role }
  }

  const updatePassword = async (username, newPassword) => {
    const key = username.toLowerCase()
    const existing = await db.usuarios.get(key)
    if (!existing) throw new Error('Usuario no encontrado')
    const hash = await hashPassword(newPassword)
    await db.usuarios.update(key, {
      password: hash,
      syncStatus: 'pending',
    })
    if (navigator.onLine) {
      await supabase.from('usuarios').upsert({
        username: key,
        password: hash,
        role: existing.role,
        nombre: existing.nombre || '',
        apellido: existing.apellido || '',
        created_by: existing.createdBy,
      }, { onConflict: 'username' })
      await db.usuarios.update(key, { syncStatus: 'synced' })
    }
  }

  const deleteUser = async (username) => {
    const key = username.toLowerCase()
    if (key === 'admin') throw new Error('No se puede eliminar el admin principal')
    await db.usuarios.delete(key)
    if (navigator.onLine) {
      await supabase.from('usuarios').delete().eq('username', key)
    }
  }

  const getAllUsers = useCallback(async () => {
    return db.usuarios.toArray()
  }, [])

  const checkAdminExists = useCallback(async () => {
    const local = await db.usuarios.get('admin')
    if (local) return true

    if (navigator.onLine) {
      const { data: rows } = await supabase.from('usuarios').select('*').or('username.eq.admin,username.eq.Admin')
      const data = rows?.[0]
      if (data) {
        await db.usuarios.add({
          username: 'admin',
          password: data.password,
          role: data.role,
          createdBy: data.created_by,
          syncStatus: 'synced',
          createdAt: data.created_at,
        })
        return true
      }
    }

    return false
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      createUser,
      updatePassword,
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
