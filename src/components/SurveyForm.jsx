import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { buscarCedula } from '../services/cedula'
import { saveSurveyLocally } from '../services/sync'
import db from '../lib/db'
import FamilyMemberForm from './FamilyMemberForm'

function normalizarCedula(c) {
  return c.replace(/[VEve-]/g, '').trim()
}

async function cedulaYaRegistrada(cedula) {
  const norm = normalizarCedula(cedula)
  if (!norm) return false

  const surveys = await db.surveys.toArray()
  for (const s of surveys) {
    if (normalizarCedula(s.cedula || '') === norm) return true
  }

  const fams = await db.familyMembers.toArray()
  for (const f of fams) {
    if (normalizarCedula(f.cedula || '') === norm) return true
  }

  return false
}

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
    nivel_ansiedad: '',
    estado_familiar: '',
    condicion_vivienda: '',
    fallecimiento_familiares: '',
    familiares_desaparecidos: '',
    observacion_estado_familiar: '',
    observacion_condicion_vivienda: '',
  })
  const [familyMembers, setFamilyMembers] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [duplicado, setDuplicado] = useState('')
  const [psychStep, setPsychStep] = useState(0)

  const psychQuestions = [
    {
      field: 'nivel_ansiedad',
      title: 'Estado de Salud y Seguridad Familiar',
      question: 'El sismo doble generó un fuerte impacto. ¿Cómo evaluarías tu nivel de ansiedad, temor o estrés emocional actual al recordar o asociar el evento?',
      options: ['Muy bajo / Me siento completamente tranquilo(a) y en control.', 'Bajo / Siento leve nerviosismo, pero puedo realizar mis actividades.', 'Moderado / Siento ansiedad intermitente y me cuesta concentrarme.', 'Alto / Siento miedo constante, insomnio o hipervigilancia.', 'Muy alto / Siento pánico severo, crisis de llanto o parálisis emocional.'],
    },
    {
      field: 'estado_familiar',
      title: 'Estado de Salud y Seguridad Familiar',
      question: '¿Cómo te encuentras tú y los familiares que viven contigo?',
      options: ['Todos estamos bien y a salvo.', 'Hay familiares heridos o con alguna emergencia médica actual.', 'No he logrado comunicarme con toda mi familia y estoy en su búsqueda.'],
    },
    {
      field: 'condicion_vivienda',
      title: 'Daños en Estructura y Terreno (Vivienda/Hábitat)',
      question: '¿Cuál es la condición física actual de tu vivienda y el terreno donde se encuentra ubicada tras los sismos?',
      options: ['Sin daños / Estructura e infraestructura intactas.', 'Daños leves / Fisuras superficiales en paredes o caída de objetos, pero es habitable.'],
    },
    {
      field: 'fallecimiento_familiares',
      title: 'Fallecimiento de Familiares',
      question: 'Lamentamos profundamente la situación general, ¿usted ha tenido alguna pérdida?',
      options: ['Ninguno / Afortunadamente ningún familiar ha fallecido.', 'Familiar lejano / Fallecimiento de tíos, primos o familiares de tercer grado.', 'Familiar cercano / Fallecimiento de abuelos, hermanos, suegros o cuñados.', 'Familiar directo (Primer grado) / Fallecimiento de padres o hijos.'],
    },
    {
      field: 'familiares_desaparecidos',
      title: 'Familiares Desaparecidos',
      question: 'Ante la dificultad de comunicación y colapso de estructuras, ¿Cuál es el estatus de localización de tus familiares en la zona de impacto?',
      options: ['Todos localizados / Sé dónde y cómo está todo mi grupo familiar.', 'Sin comunicación temporal / Sé que están bien por terceros, pero no he podido hablar directamente con ellos.', 'Familiares incomunicados / No he tenido reporte ni rastro de ellos desde el sismo.', 'Varios familiares desaparecidos / Más de 3 familiares sin reporte, en zonas de alto impacto o colapso.', 'Todo mi núcleo familiar desaparecido / No tengo noticias de ninguno de los miembros que habitan conmigo.'],
    },
  ]

  const handleChange = (e) => {
    setSurvey({ ...survey, [e.target.name]: e.target.value })
  }

  const buscarAuto = (cedula) => {
    if (cedulaTimer.current) clearTimeout(cedulaTimer.current)
    setDuplicado('')

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

      const dupe = await cedulaYaRegistrada(cedula)
      if (dupe) {
        setDuplicado('Esta cédula ya se encuentra registrada')
      }
      setBuscando(false)
    }, 600)
  }

  const addFamilyMember = (fm) => {
    setFamilyMembers([...familyMembers, { ...fm, id: Date.now(), requiereApoyo: false }])
  }

  const toggleApoyo = (id) => {
    setFamilyMembers(familyMembers.map((f) => f.id === id ? { ...f, requiereApoyo: !f.requiereApoyo } : f))
  }

  const removeFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter((f) => f.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!survey.cedula || !survey.nombre || !survey.apellido || !survey.genero) {
      setError('Cédula, nombre, apellido y género son obligatorios')
      return
    }

    const dupe = await cedulaYaRegistrada(survey.cedula)
    if (dupe) {
      setError('Esta cédula ya se encuentra registrada en otra encuesta')
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
            {duplicado && (
              <p className="text-xs text-red-500 mt-1">{duplicado}</p>
            )}
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
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Género *</label>
              <div className="flex gap-2">
                {['Masculino', 'Femenino'].map((opt) => (
                  <button key={opt} type="button" onClick={() => setSurvey({ ...survey, genero: opt })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${survey.genero === opt ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                    {opt}
                  </button>
                ))}
              </div>
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
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Evaluación Psicológica
          </h3>

          <div className="flex gap-1.5">
            {psychQuestions.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= psychStep && survey[psychQuestions[i].field] ? 'bg-purple-500' : i < psychStep ? 'bg-purple-300' : 'bg-gray-200'}`} />
            ))}
          </div>

          {psychQuestions.map((q, i) => (
            <div key={q.field} className={psychStep !== i ? 'hidden' : ''}>
              <p className="text-sm font-medium text-gray-700 mb-1">{q.title}</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${survey[q.field] === opt ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name={q.field} value={opt} checked={survey[q.field] === opt} onChange={handleChange} className="mt-0.5 accent-purple-500" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>

              {q.field === 'estado_familiar' && survey.estado_familiar === 'Hay familiares heridos o con alguna emergencia médica actual.' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                  <textarea name="observacion_estado_familiar" value={survey.observacion_estado_familiar} onChange={handleChange} rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition resize-none"
                    placeholder="Describe la situación..."
                  />
                </div>
              )}

              {q.field === 'condicion_vivienda' && survey.condicion_vivienda === 'Daños leves / Fisuras superficiales en paredes o caída de objetos, pero es habitable.' && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                  <textarea name="observacion_condicion_vivienda" value={survey.observacion_condicion_vivienda} onChange={handleChange} rows="2"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition resize-none"
                    placeholder="Describe los daños..."
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setPsychStep(Math.max(0, psychStep - 1))} disabled={psychStep === 0}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  Anterior
                </button>
                {psychStep < psychQuestions.length - 1 ? (
                  <button type="button" onClick={() => { if (survey[q.field]) setPsychStep(psychStep + 1) }}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                    Siguiente
                  </button>
                ) : (
                  <span className="flex-1 flex items-center justify-center text-xs text-purple-600 font-medium">Última pregunta</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Familiares
          </h3>

          {familyMembers.length > 0 && (
            <div className="space-y-2">
              {familyMembers.map((fm) => (
                <div key={fm.id} className="bg-sky-50 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">{fm.nombre} {fm.apellido}</span>
                    <span className="text-gray-500 ml-2">- {fm.parentesco}</span>
                    <span className="text-gray-400 ml-2 text-xs">({fm.cedula})</span>
                    {fm.sexo && <span className="text-gray-400 ml-1 text-xs">| {fm.sexo}</span>}
                    {fm.fecha_nacimiento && <span className="text-gray-400 ml-1 text-xs">| {fm.fecha_nacimiento}</span>}
                    </div>
                    <button type="button" onClick={() => removeFamilyMember(fm.id)}
                      className="text-red-300 hover:text-red-500 transition-colors">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={fm.requiereApoyo} onChange={() => toggleApoyo(fm.id)} className="accent-purple-500 w-4 h-4" />
                    <span className="text-xs text-purple-600">Solicita apoyo psicológico para este familiar</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          <FamilyMemberForm onAdd={addFamilyMember} existingCedulas={familyMembers.map(f => f.cedula)} />
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
