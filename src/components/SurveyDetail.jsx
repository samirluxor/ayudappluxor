import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLocalSurvey, deleteSurvey } from '../services/sync'
import { TrashIcon } from '@heroicons/react/24/outline'
import ConfirmModal from './ConfirmModal'

export default function SurveyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    async function load() {
      const s = await getLocalSurvey(Number(id))
      setSurvey(s)
      setLoading(false)
    }
    load()
  }, [id])

  const calcularEdad = (fecha) => {
    if (!fecha) return null
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Encuesta no encontrada</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-500 hover:text-blue-600 font-medium">← Volver</button>
      </div>
    )
  }

  const edad = calcularEdad(survey.fecha_nacimiento)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalle de Encuesta</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Eliminar
          </button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Volver</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Datos del encuestado
          </h3>
          {survey.syncStatus === 'pending' && <span className="text-xs px-2 py-0.5 bg-sky-100 text-blue-600 rounded-full">Pendiente</span>}
          {survey.syncStatus === 'synced' && <span className="text-xs px-2 py-0.5 bg-pastel-blue text-blue-600 rounded-full">Sincronizado</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Cédula</p>
            <p className="text-gray-800 font-medium">{survey.cedula}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Nombre completo</p>
            <p className="text-gray-800 font-medium">{survey.nombre} {survey.apellido}</p>
          </div>
          {survey.genero && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Género</p>
              <p className="text-gray-800">{survey.genero}</p>
            </div>
          )}
          {survey.fecha_nacimiento && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de nacimiento</p>
              <p className="text-gray-800">
                {new Date(survey.fecha_nacimiento).toLocaleDateString('es-VE')}
                {edad !== null && <span className="text-gray-400 ml-2">({edad} años)</span>}
              </p>
            </div>
          )}
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Dirección fiscal</p>
            <p className="text-gray-800">{survey.direccion_fiscal || 'No registrada'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Teléfono</p>
            <p className="text-gray-800">{survey.telefono || 'No registrado'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Registrado</p>
            <p className="text-gray-800">
              {new Date(survey.createdAt).toLocaleDateString('es-VE', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      {survey.nivel_ansiedad && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Evaluación Psicológica
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Nivel de ansiedad</p>
              <p className="text-gray-800">{survey.nivel_ansiedad}</p>
            </div>
            {survey.estado_familiar && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Estado familiar</p>
                <p className="text-gray-800">{survey.estado_familiar}</p>
              </div>
            )}
            {survey.condicion_vivienda && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Condición de vivienda</p>
                <p className="text-gray-800">{survey.condicion_vivienda}</p>
              </div>
            )}
            {survey.fallecimiento_familiares && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Fallecimiento de familiares</p>
                <p className="text-gray-800">{survey.fallecimiento_familiares}</p>
              </div>
            )}
            {survey.familiares_desaparecidos && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Familiares desaparecidos</p>
                <p className="text-gray-800">{survey.familiares_desaparecidos}</p>
              </div>
            )}
            {survey.observacion_estado_familiar && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Observación (estado familiar)</p>
                <p className="text-gray-800">{survey.observacion_estado_familiar}</p>
              </div>
            )}
            {survey.observacion_condicion_vivienda && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Observación (condición vivienda)</p>
                <p className="text-gray-800">{survey.observacion_condicion_vivienda}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          Familiares ({survey.familyMembers?.length || 0})
        </h3>

        {(!survey.familyMembers || survey.familyMembers.length === 0) && (
          <p className="text-gray-400 text-sm">No se registraron familiares</p>
        )}

        <div className="space-y-3">
          {survey.familyMembers?.map((fm) => (
            <div key={fm.localId || fm.id} className="bg-sky-50 p-4 rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Cédula</p>
                  <p className="text-gray-700 font-medium">{fm.cedula}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Nombre</p>
                  <p className="text-gray-700">{fm.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Apellido</p>
                  <p className="text-gray-700">{fm.apellido}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Parentesco</p>
                  <p className="text-gray-700">{fm.parentesco}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Sexo</p>
                  <p className="text-gray-700">{fm.sexo || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha de nacimiento</p>
                  <p className="text-gray-700">{fm.fecha_nacimiento ? new Date(fm.fecha_nacimiento).toLocaleDateString('es-VE') : '-'}</p>
                </div>
              </div>
              {fm.requiereApoyo && (
                <p className="mt-2 text-xs text-purple-600 font-medium flex items-center gap-1">
                  <span>🫂</span> Solicita apoyo psicológico
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <ConfirmModal
        open={showDelete}
        title="Eliminar encuesta"
        message={`¿Estás seguro de eliminar la encuesta de "${survey?.nombre} ${survey?.apellido}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          await deleteSurvey(survey.localId)
          navigate('/dashboard')
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
