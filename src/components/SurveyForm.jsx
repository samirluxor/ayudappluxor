import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { buscarCedula } from '../services/cedula'
import { saveSurveyLocally } from '../services/sync'
import FamilyMemberForm from './FamilyMemberForm'

export default function SurveyForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const cedulaTimer = useRef(null)
  const [survey, setSurvey] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    genero: '',
    fecha_nacimiento: '',
    direccion_fiscal: '',
    telefono: '',
  })
  const [familyMembers, setFamilyMembers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  const handleChange = (e) => {
    setSurvey({ ...survey, [e.target.name]: e.target.value })
  }

  const buscarAuto = (cedula) => {
    if (cedulaTimer.current) clearTimeout(cedulaTimer.current)
    if (cedula.length < 6) return

    cedulaTimer.current = setTimeout(async () => {
      setBuscando(true)
      const data = await buscarCedula(cedula)
      if (data) {
        setSurvey((prev) => ({
          ...prev,
          nombre: data.nombre || prev.nombre,
          apellido: data.apellido || prev.apellido,
          genero: data.sexo || prev.genero,
          fecha_nacimiento: data.fechaNacimiento || prev.fecha_nacimiento,
        }))
      }
      setBuscando(false)
    }, 600)
  }

  const addFamilyMember = (fm) => {
    setFamilyMembers([...familyMembers, { ...fm, id: Date.now() }])
  }

  const removeFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter((f) => f.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!survey.cedula || !survey.nombre || !survey.apellido) {
      setError('Cédula, nombre y apellido son obligatorios')
      return
    }
    setSaving(true)
    try {
      await saveSurveyLocally(
        { ...survey, encuestadorId: user.username },
        familyMembers.map(({ id, ...rest }) => rest)
      )
      navigate('/dashboard')
    } catch {
      setError('Error al guardar la encuesta')
    } finally {
      setSaving(false)
    }
  }

  const genero = survey.genero?.toLowerCase()
  const generoValue = genero === 'm' ? 'Masculino' : genero === 'f' ? 'Femenino' : survey.genero || ''

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nueva Encuesta</h2>
          <p className="text-gray-500 text-sm">Registro de persona afectada</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Volver</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Datos del encuestado
          </h3>

          {error && <div className="bg-pastel-red text-red-600 text-sm p-3 rounded-lg">{error}</div>}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Cédula de identidad *
            </label>
            <div className="relative">
              <input
                type="text"
                name="cedula"
                value={survey.cedula}
                onChange={(e) => { handleChange(e); buscarAuto(e.target.value) }}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                placeholder="V-12345678"
                required
              />
              {buscando && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Escribe la cédula para buscar datos automáticamente</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre *</label>
              <input type="text" name="nombre" value={survey.nombre} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                placeholder="Nombre" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido *</label>
              <input type="text" name="apellido" value={survey.apellido} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                placeholder="Apellido" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Género</label>
              <select name="genero" value={generoValue} onChange={(e) => setSurvey({ ...survey, genero: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={survey.fecha_nacimiento} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Dirección fiscal</label>
            <textarea name="direccion_fiscal" value={survey.direccion_fiscal} onChange={handleChange} rows="2"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition resize-none"
              placeholder="Dirección completa" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono de contacto</label>
            <input type="tel" name="telefono" value={survey.telefono} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="0412-1234567" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Familiares
          </h3>

          {familyMembers.length > 0 && (
            <div className="space-y-2">
              {familyMembers.map((fm) => (
                <div key={fm.id} className="flex items-center justify-between bg-sky-50 p-3 rounded-xl">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">{fm.nombre} {fm.apellido}</span>
                    <span className="text-gray-500 ml-2">- {fm.parentesco}</span>
                    <span className="text-gray-400 ml-2 text-xs">({fm.cedula})</span>
                  </div>
                  <button type="button" onClick={() => removeFamilyMember(fm.id)}
                    className="text-red-300 hover:text-red-500 transition-colors">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <FamilyMemberForm onAdd={addFamilyMember} />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-md">
            {saving ? 'Guardando...' : 'Guardar encuesta'}
          </button>
        </div>
      </form>
    </div>
  )
}
