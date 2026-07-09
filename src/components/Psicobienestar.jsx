import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import db from '../lib/db'
import { updateFamilyPsychTest, updateSurveyPsychTest } from '../services/sync'

const psychQuestions = [
  {
    field: 'psico_nivel_ansiedad',
    title: 'Estado de Salud y Seguridad Familiar',
    question: 'El sismo doble generó un fuerte impacto. ¿Cómo evaluarías tu nivel de ansiedad, temor o estrés emocional actual al recordar o asociar el evento?',
    options: ['Muy bajo / Me siento completamente tranquilo(a) y en control.', 'Bajo / Siento leve nerviosismo, pero puedo realizar mis actividades.', 'Moderado / Siento ansiedad intermitente y me cuesta concentrarme.', 'Alto / Siento miedo constante, insomnio o hipervigilancia.', 'Muy alto / Siento pánico severo, crisis de llanto o parálisis emocional.'],
  },
  {
    field: 'psico_estado_familiar',
    title: 'Estado de Salud y Seguridad Familiar',
    question: '¿Cómo te encuentras tú y los familiares que viven contigo?',
    options: ['Todos estamos bien y a salvo.', 'Hay familiares heridos o con alguna emergencia médica actual.', 'No he logrado comunicarme con toda mi familia y estoy en su búsqueda.'],
  },
  {
    field: 'psico_condicion_vivienda',
    title: 'Daños en Estructura y Terreno (Vivienda/Hábitat)',
    question: '¿Cuál es la condición física actual de tu vivienda y el terreno donde se encuentra ubicada tras los sismos?',
    options: ['Sin daños / Estructura e infraestructura intactas.', 'Daños leves / Fisuras superficiales en paredes o caída de objetos, pero es habitable.'],
  },
  {
    field: 'psico_fallecimiento_familiares',
    title: 'Fallecimiento de Familiares',
    question: 'Lamentamos profundamente la situación general, ¿usted ha tenido alguna pérdida?',
    options: ['Ninguno / Afortunadamente ningún familiar ha fallecido.', 'Familiar lejano / Fallecimiento de tíos, primos o familiares de tercer grado.', 'Familiar cercano / Fallecimiento de abuelos, hermanos, suegros o cuñados.', 'Familiar directo (Primer grado) / Fallecimiento de padres o hijos.'],
  },
  {
    field: 'psico_familiares_desaparecidos',
    title: 'Familiares Desaparecidos',
    question: 'Ante la dificultad de comunicación y colapso de estructuras, ¿Cuál es el estatus de localización de tus familiares en la zona de impacto?',
    options: ['Todos localizados / Sé dónde y cómo está todo mi grupo familiar.', 'Sin comunicación temporal / Sé que están bien por terceros, pero no he podido hablar directamente con ellos.', 'Familiares incomunicados / No he tenido reporte ni rastro de ellos desde el sismo.', 'Varios familiares desaparecidos / Más de 3 familiares sin reporte, en zonas de alto impacto o colapso.', 'Todo mi núcleo familiar desaparecido / No tengo noticias de ninguno de los miembros que habitan conmigo.'],
  },
]

function isCompletado(fm) {
  return psychQuestions.every((q) => fm[q.field])
}

function calcVulnerabilidad(fm) {
  if (!isCompletado(fm)) return null

  const scoreMap = {}
  for (const q of psychQuestions) {
    const idx = q.options.indexOf(fm[q.field])
    scoreMap[q.field] = idx >= 0 ? idx : 0
  }

  const maxScores = {
    psico_nivel_ansiedad: 4,
    psico_estado_familiar: 2,
    psico_condicion_vivienda: 1,
    psico_fallecimiento_familiares: 3,
    psico_familiares_desaparecidos: 4,
  }

  let total = 0
  for (const q of psychQuestions) {
    const current = scoreMap[q.field] ?? 0
    const max = maxScores[q.field]
    total += (current / max) * 20
  }

  return Math.round(total)
}

function colorVuln(pct) {
  if (pct === null) return 'bg-gray-100 text-gray-400'
  if (pct < 25) return 'bg-green-100 text-green-700'
  if (pct < 50) return 'bg-yellow-100 text-yellow-700'
  if (pct < 75) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

function labelVuln(pct) {
  if (pct === null) return 'Sin test'
  if (pct < 25) return 'Baja'
  if (pct < 50) return 'Media'
  if (pct < 75) return 'Alta'
  return 'Crítica'
}

export default function Psicobienestar() {
  const navigate = useNavigate()
  const [familyMembers, setFamilyMembers] = useState([])
  const [surveys, setSurveys] = useState({})
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [answers, setAnswers] = useState({})
  const [psychStep, setPsychStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const allSurveys = await db.surveys.toArray()
      const surveyMap = {}
      for (const s of allSurveys) {
        surveyMap[s.localId] = s
      }
      setSurveys(surveyMap)

      const allFam = await db.familyMembers.toArray()

      const virtualEncuestados = allSurveys
        .filter((s) => s.nombre)
        .map((s) => {
          const oldCompleted = !!(s.nivel_ansiedad && s.estado_familiar && s.condicion_vivienda && s.fallecimiento_familiares && s.familiares_desaparecidos)
          return {
            localId: `enc-${s.localId}`,
            surveyLocalId: s.localId,
            nombre: s.nombre,
            apellido: s.apellido,
            cedula: s.cedula,
            parentesco: 'Titular (Encuestado)',
            psico_nivel_ansiedad: s.psico_nivel_ansiedad || s.nivel_ansiedad || '',
            psico_estado_familiar: s.psico_estado_familiar || s.estado_familiar || '',
            psico_condicion_vivienda: s.psico_condicion_vivienda || s.condicion_vivienda || '',
            psico_fallecimiento_familiares: s.psico_fallecimiento_familiares || s.fallecimiento_familiares || '',
            psico_familiares_desaparecidos: s.psico_familiares_desaparecidos || s.familiares_desaparecidos || '',
            psico_observacion_estado_familiar: s.psico_observacion_estado_familiar || s.observacion_estado_familiar || '',
            psico_observacion_condicion_vivienda: s.psico_observacion_condicion_vivienda || s.observacion_condicion_vivienda || '',
            psico_completado: s.psico_completado || oldCompleted,
            isEncuestado: true,
          }
        })

      setFamilyMembers([...virtualEncuestados, ...allFam])
      setLoading(false)
    }
    load()
  }, [])

  const startTest = (fm) => {
    setEditing(fm)
    const initial = {}
    for (const q of psychQuestions) {
      initial[q.field] = fm[q.field] || ''
    }
    setAnswers(initial)
    setPsychStep(0)
  }

  const handleAnswer = (field, value) => {
    setAnswers((prev) => ({ ...prev, [field]: value }))
  }

  const saveTest = async () => {
    if (!editing) return
    setSaving(true)
    const completed = psychQuestions.every((q) => answers[q.field])
    if (editing.isEncuestado) {
      await updateSurveyPsychTest(editing.surveyLocalId, { ...answers, psico_completado: completed })
    } else {
      await updateFamilyPsychTest(editing.localId, { ...answers, psico_completado: completed })
    }
    setFamilyMembers((prev) =>
      prev.map((fm) =>
        fm.localId === editing.localId ? { ...fm, ...answers, psico_completado: completed } : fm
      )
    )
    setEditing(null)
    setSaving(false)
    setPsychStep(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (editing) {
    const q = psychQuestions[psychStep]
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Test de Psicobienestar</h2>
            <p className="text-gray-500 text-sm">
              {editing.isEncuestado ? 'Titular' : 'Familiar'}: {editing.nombre} {editing.apellido}
            </p>
          </div>
          <button onClick={() => { setEditing(null); setPsychStep(0) }} className="text-sm text-gray-400 hover:text-gray-600">← Volver</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex gap-1.5">
            {psychQuestions.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= psychStep && answers[q.field] ? 'bg-blue-500' : i < psychStep ? 'bg-blue-300' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">{q.title}</p>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label key={opt} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${answers[q.field] === opt ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name={q.field} value={opt} checked={answers[q.field] === opt} onChange={() => handleAnswer(q.field, opt)} className="mt-0.5 accent-blue-500" />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>

            {q.field === 'psico_estado_familiar' && answers[q.field] === 'Hay familiares heridos o con alguna emergencia médica actual.' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                <textarea value={answers.psico_observacion_estado_familiar || ''} onChange={(e) => handleAnswer('psico_observacion_estado_familiar', e.target.value)} rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe la situación..." />
              </div>
            )}

            {q.field === 'psico_condicion_vivienda' && answers[q.field] === 'Daños leves / Fisuras superficiales en paredes o caída de objetos, pero es habitable.' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Observación</label>
                <textarea value={answers.psico_observacion_condicion_vivienda || ''} onChange={(e) => handleAnswer('psico_observacion_condicion_vivienda', e.target.value)} rows="2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe los daños..." />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => setPsychStep(Math.max(0, psychStep - 1))} disabled={psychStep === 0}
              className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors">
              Anterior
            </button>
            {psychStep < psychQuestions.length - 1 ? (
              <button type="button" onClick={() => { if (answers[q.field]) setPsychStep(psychStep + 1) }}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                Siguiente
              </button>
            ) : (
              <button type="button" onClick={saveTest} disabled={saving || !answers[q.field]}
                className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-md">
                {saving ? 'Guardando...' : 'Guardar test'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const searchTerm = search.toLowerCase().trim()
  const filtered = familyMembers.filter((fm) => {
    const survey = surveys[fm.surveyLocalId]
    if (!survey) return false
    if (!searchTerm) return true
    return (
      fm.nombre?.toLowerCase().includes(searchTerm) ||
      fm.apellido?.toLowerCase().includes(searchTerm) ||
      fm.cedula?.includes(searchTerm)
    )
  })

  const grupos = {}
  for (const fm of filtered) {
    const survey = surveys[fm.surveyLocalId]
    const key = survey ? `${survey.nombre} ${survey.apellido} (${survey.cedula})` : `Encuesta #${fm.surveyLocalId}`
    if (!grupos[key]) grupos[key] = { survey, familyMembers: [] }
    grupos[key].familyMembers.push(fm)
  }

  const totalPendientes = filtered.filter((fm) => !isCompletado(fm)).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Psicobienestar</h2>
          <p className="text-gray-500 text-sm">
            {filtered.length} persona{filtered.length !== 1 ? 's' : ''} registrada{filtered.length !== 1 ? 's' : ''}
            {totalPendientes > 0 && <span className="text-amber-500 ml-1">· {totalPendientes} pendiente{totalPendientes !== 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido o cédula..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400">{search ? 'No se encontraron personas' : 'No hay personas registradas'}</p>
        </div>
      )}

      {Object.entries(grupos).map(([key, grupo]) => (
        <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">{key}</p>
            {grupo.survey && (
              <button onClick={() => navigate(`/survey/${grupo.survey.localId}`)} className="text-xs text-blue-500 hover:text-blue-600">Ver encuesta →</button>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {grupo.familyMembers.map((fm) => {
              const completo = isCompletado(fm)
              const vuln = calcVulnerabilidad(fm)
              return (
                <div key={fm.localId || fm.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {fm.nombre} {fm.apellido}
                    </p>
                    <p className="text-xs text-gray-400">{fm.parentesco} · {fm.cedula}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {vuln !== null && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorVuln(vuln)}`}>
                        {vuln}% · {labelVuln(vuln)}
                      </span>
                    )}
                    {completo ? (
                      <span className="text-xs px-2 py-0.5 bg-pastel-blue text-blue-600 rounded-full">Completado</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">Pendiente</span>
                    )}
                    <button onClick={() => startTest(fm)}
                      className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      {completo ? 'Ver / Editar' : 'Tomar test'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
