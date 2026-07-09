import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLocalSurveys, fetchRemoteSurveys, syncSurveys, syncUsuarios } from '../services/sync'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { PlusIcon } from '@heroicons/react/24/outline'
import db from '../lib/db'
import SurveyList from './SurveyList'
import SyncStatus from './SyncStatus'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSurveys = useCallback(async () => {
    const data = await getLocalSurveys()
    setSurveys(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSurveys()
  }, [loadSurveys])

  useEffect(() => {
    if (!isOnline) return
    const doSync = async () => {
      await syncUsuarios()
      await fetchRemoteSurveys(user.username)
      loadSurveys()
    }
    doSync()
  }, [isOnline, user.username, loadSurveys])

  useEffect(() => {
    if (!isOnline) return
    const checkPending = async () => {
      const count = await db.surveys.where('syncStatus').equals('pending').count()
      if (count > 0) {
        await syncSurveys()
        loadSurveys()
      }
    }
    checkPending()
  }, [isOnline, loadSurveys])

  const handleViewSurvey = (localId) => {
    navigate(`/survey/${localId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Mis Encuestas
            </h2>
            <p className="text-sm text-gray-500">
              {surveys.length} encuesta{surveys.length !== 1 ? 's' : ''} registrada{surveys.length !== 1 ? 's' : ''}
            </p>
          </div>
          <SyncStatus />
        </div>
        <button
          onClick={() => navigate('/survey/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold rounded-xl transition-all shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva
        </button>
      </div>

      <SurveyList surveys={surveys} onView={handleViewSurvey} onDelete={loadSurveys} />
    </div>
  )
}
