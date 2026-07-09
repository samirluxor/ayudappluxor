import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, PhoneIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { deleteSurvey } from '../services/sync'
import ConfirmModal from './ConfirmModal'

export default function SurveyList({ surveys, onView, onDelete }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = surveys.filter((s) => {
    const q = search.toLowerCase()
    return (
      s.cedula.toLowerCase().includes(q) ||
      s.nombre.toLowerCase().includes(q) ||
      s.apellido.toLowerCase().includes(q) ||
      s.telefono?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cédula, nombre o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition shadow-sm"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">
            {search ? 'Sin resultados' : 'No hay encuestas registradas'}
          </p>
          {!search && (
            <p className="text-sm text-gray-300 mt-1">Presiona "Nueva" para comenzar</p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((survey) => (
          <div
            key={survey.localId}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-sky-200 transition-all"
          >
            <button
              onClick={() => onView(survey.localId)}
              className="w-full text-left p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 truncate">
                    {survey.nombre} {survey.apellido}
                  </p>
                  <p className="text-sm text-gray-500">
                    {survey.cedula}
                  </p>
                  {survey.telefono && (
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                      {survey.telefono}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {survey.syncStatus === 'pending' && (
                    <span className="text-xs px-2 py-0.5 bg-sky-100 text-blue-600 rounded-full">
                      Pendiente
                    </span>
                  )}
                  {survey.syncStatus === 'synced' && (
                    <span className="text-xs px-2 py-0.5 bg-pastel-blue text-blue-600 rounded-full">
                      Sincronizado
                    </span>
                  )}
                  {survey.syncStatus === 'error' && (
                    <span className="text-xs px-2 py-0.5 bg-pastel-red text-red-500 rounded-full">
                      Error
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {survey.familyMembers?.length || 0} familiares
                  </span>
                </div>
              </div>
            </button>
            <div className="px-4 pb-3 flex justify-end gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/survey/edit/${survey.localId}`) }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <PencilIcon className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(survey) }}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar encuesta"
        message={`¿Estás seguro de eliminar la encuesta de "${deleteTarget?.nombre} ${deleteTarget?.apellido}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          if (!deleteTarget) return
          await deleteSurvey(deleteTarget.localId)
          setDeleteTarget(null)
          onDelete?.()
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
