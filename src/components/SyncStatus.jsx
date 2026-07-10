import { useState, useEffect, useRef } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { onSyncStatusChange, syncSurveys } from '../services/sync'
import db from '../lib/db'

export default function SyncStatus() {
  const isOnline = useOnlineStatus()
  const [syncStatus, setSyncStatus] = useState('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSync, setLastSync] = useState(localStorage.getItem('lastSync') || '')
  const prevSyncStatus = useRef('idle')

  useEffect(() => {
    const unsub = onSyncStatusChange(setSyncStatus)
    return unsub
  }, [])

  useEffect(() => {
    if (prevSyncStatus.current === 'syncing' && syncStatus === 'idle') {
      const now = new Date().toLocaleString('es-ES')
      localStorage.setItem('lastSync', now)
      setLastSync(now)
    }
    prevSyncStatus.current = syncStatus
  }, [syncStatus])

  useEffect(() => {
    async function countPending() {
      const count = await db.surveys.where('syncStatus').equals('pending').count()
      setPendingCount(count)
    }
    countPending()
    const interval = setInterval(countPending, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSync = async () => {
    await syncSurveys()
    const now = new Date().toLocaleString('es-ES')
    localStorage.setItem('lastSync', now)
    setLastSync(now)
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-sky-100 px-3 py-1.5 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Sin conexión
        {pendingCount > 0 && <span className="font-medium">({pendingCount})</span>}
      </div>
    )
  }

  if (syncStatus === 'syncing') {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-pastel-blue px-3 py-1.5 rounded-lg">
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Sincronizando...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-emerald-600 bg-pastel-blue px-3 py-1.5 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Conectado
        {lastSync && <span className="text-gray-400 font-normal">· {lastSync}</span>}
      </div>
      {pendingCount > 0 && (
        <button
          onClick={handleSync}
          className="text-sm px-3 py-1.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-lg transition-all shadow-sm"
        >
          Sync ({pendingCount})
        </button>
      )}
    </div>
  )
}
