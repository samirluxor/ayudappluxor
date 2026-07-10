import { useState } from 'react'
import { HeartIcon, GlobeAltIcon, BuildingStorefrontIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const vulnerabilidadDocs = [
  {
    label: 'Nivel de ansiedad',
    field: 'psico_nivel_ansiedad',
    weight: '20%',
    options: [
      { text: 'Muy bajo / Me siento completamente tranquilo(a) y en control.', score: 0 },
      { text: 'Bajo / Siento leve nerviosismo...', score: 1 },
      { text: 'Moderado / Siento ansiedad intermitente...', score: 2 },
      { text: 'Alto / Siento miedo constante, insomnio...', score: 3 },
      { text: 'Muy alto / Siento pánico severo...', score: 4 },
    ],
  },
  {
    label: 'Estado familiar',
    field: 'psico_estado_familiar',
    weight: '20%',
    options: [
      { text: 'Todos estamos bien y a salvo.', score: 0 },
      { text: 'Hay familiares heridos o con alguna emergencia médica actual.', score: 1 },
      { text: 'No he logrado comunicarme con toda mi familia...', score: 2 },
    ],
  },
  {
    label: 'Condición de vivienda',
    field: 'psico_condicion_vivienda',
    weight: '20%',
    options: [
      { text: 'Sin daños / Estructura e infraestructura intactas.', score: 0 },
      { text: 'Daños leves / Fisuras superficiales...', score: 1 },
    ],
  },
  {
    label: 'Fallecimiento de familiares',
    field: 'psico_fallecimiento_familiares',
    weight: '20%',
    options: [
      { text: 'Ninguno / Afortunadamente ningún familiar ha fallecido.', score: 0 },
      { text: 'Familiar lejano / Fallecimiento de tíos, primos...', score: 1 },
      { text: 'Familiar cercano / Fallecimiento de abuelos, hermanos...', score: 2 },
      { text: 'Familiar directo (Primer grado) / Fallecimiento de padres o hijos.', score: 3 },
    ],
  },
  {
    label: 'Familiares desaparecidos',
    field: 'psico_familiares_desaparecidos',
    weight: '20%',
    options: [
      { text: 'Todos localizados / Sé dónde y cómo está todo mi grupo familiar.', score: 0 },
      { text: 'Sin comunicación temporal / Sé que están bien por terceros...', score: 1 },
      { text: 'Familiares incomunicados / No he tenido reporte...', score: 2 },
      { text: 'Varios familiares desaparecidos / Más de 3 familiares...', score: 3 },
      { text: 'Todo mi núcleo familiar desaparecido...', score: 4 },
    ],
  },
]

function calcExample() {
  const answers = [
    { field: 'psico_nivel_ansiedad', idx: 3 },
    { field: 'psico_estado_familiar', idx: 1 },
    { field: 'psico_condicion_vivienda', idx: 1 },
    { field: 'psico_fallecimiento_familiares', idx: 2 },
    { field: 'psico_familiares_desaparecidos', idx: 3 },
  ]
  const maxScores = [4, 2, 1, 3, 4]
  let total = 0
  const lines = []
  for (let i = 0; i < answers.length; i++) {
    const pct = (answers[i].idx / maxScores[i]) * 20
    total += pct
    lines.push({ label: vulnerabilidadDocs[i].label, raw: `${answers[i].idx}/${maxScores[i]}`, pct: Math.round(pct) })
  }
  return { total: Math.round(total), lines }
}

export default function About() {
  const [docOpen, setDocOpen] = useState(false)
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <img src="/logo.webp" alt="SOMOS LUXOR" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg object-cover" />
        <h2 className="text-3xl font-bold text-gray-800">SOMOS LUXOR</h2>
        <p className="text-gray-500 mt-2">Censo y encuestas para la reconstrucción</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-lg">
          <GlobeAltIcon className="w-5 h-5 text-blue-500" />
          Nuestra iniciativa
        </h3>
        <p className="text-gray-600 leading-relaxed">
          El 24 de junio de 2026, un devastador terremoto sacudió Venezuela, dejando a su paso miles de familias 
          damnificadas, pérdidas humanas y una profunda huella en las comunidades más vulnerables del país. 
          Ante esta emergencia nacional, <strong>Supermercados Luxor</strong>, comprometido con el bienestar 
          del pueblo venezolano, ha puesto en marcha la <strong>SOMOS LUXOR</strong> como una herramienta 
          tecnológica para el censo y la recolección de datos de las personas afectadas.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Esta aplicación permite a los encuestadores registrar de manera rápida y eficiente la información 
          de los damnificados —incluso sin conexión a internet—, incluyendo datos personales, composición 
          familiar y necesidades básicas. Toda la información se sincroniza automáticamente cuando hay 
          conexión, facilitando la toma de decisiones y la distribución oportuna de la ayuda humanitaria.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-lg">
          <BuildingStorefrontIcon className="w-5 h-5 text-blue-500" />
          Compromiso de Supermercados Luxor
        </h3>
        <p className="text-gray-600 leading-relaxed">
          En <strong>Supermercados Luxor</strong> creemos que la empresa privada tiene un rol fundamental 
          en la reconstrucción del tejido social de Venezuela. Por eso, desde el primer momento nos 
          movilizamos para llevar alimentos, agua potable, medicinas y artículos de primera necesidad a 
          las zonas más afectadas por el terremoto.
        </p>
        <p className="text-gray-600 leading-relaxed">
          La <strong>SOMOS LUXOR</strong> es parte de este esfuerzo: una plataforma gratuita, de código 
          abierto, diseñada para que organizaciones sociales, líderes comunitarios y voluntarios puedan 
          censar a las familias damnificadas de manera organizada y transparente. Creemos en la 
          solidaridad como motor de cambio y en la tecnología como aliada para llegar más lejos.
        </p>
      </div>

      <div className="bg-sky-50 rounded-2xl border border-sky-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-lg">
          <HeartIcon className="w-5 h-5 text-red-400" />
          Solidaridad con el pueblo venezolano
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Venezuela ha enfrentado una de las peores tragedias naturales de su historia. Miles de familias 
          lo han perdido todo: sus hogares, sus pertenencias y, en muchos casos, a sus seres queridos. 
          Pero en medio de la adversidad, la solidaridad del pueblo venezolano brilla con fuerza.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Cada encuesta registrada en SOMOS LUXOR representa una familia que necesita ser escuchada 
          y atendida. Cada dato recolectado es un paso hacia una distribución más justa y eficiente de 
          la ayuda. Invitamos a todos los voluntarios, organizaciones y ciudadanos de bien a sumarse a 
          esta causa. <strong>Juntos podemos reconstruir Venezuela.</strong>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <button onClick={() => setDocOpen(!docOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-lg">
            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
            Documentación del Test de Psicobienestar
          </h3>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${docOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {docOpen && (
          <div className="px-5 pb-6 space-y-5 border-t border-gray-100 pt-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Metodología de cálculo</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                El <strong>porcentaje de vulnerabilidad</strong> se calcula evaluando 5 dimensiones del test de
                Psicobienestar. Cada dimensión tiene un peso del <strong>20%</strong> sobre el total (0% = óptimo,
                100% = crítico). La puntuación se obtiene asignando un valor de 0 a <em>n</em> según la respuesta
                seleccionada, dividiendo entre el valor máximo posible de esa dimensión y multiplicando por 20.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Dimensión</th>
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Peso</th>
                    <th className="text-left py-2 font-medium text-gray-500">Opciones (puntaje)</th>
                  </tr>
                </thead>
                <tbody>
                  {vulnerabilidadDocs.map((dim) => (
                    <tr key={dim.field} className="border-b border-gray-100">
                      <td className="py-2 pr-4 align-top text-gray-700 font-medium">{dim.label}</td>
                      <td className="py-2 pr-4 align-top text-gray-500">{dim.weight}</td>
                      <td className="py-2">
                        <ul className="space-y-0.5">
                          {dim.options.map((opt) => (
                            <li key={opt.score} className="text-gray-600">
                              <span className={`inline-block w-5 h-5 leading-5 text-center text-xs font-bold rounded-full mr-1.5 ${opt.score === 0 ? 'bg-green-100 text-green-700' : ''} ${opt.score === dim.options.length - 1 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                {opt.score}
                              </span>
                              <span className="text-xs">{opt.text}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-1">Fórmula</h4>
              <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-700 leading-relaxed">
                Vulnerabilidad (%) = &sum; ( (puntaje_obtenido / puntaje_máximo) × 20 )
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Ejemplo práctico</h4>
              {(() => { const ex = calcExample(); return (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="py-1 pr-3 text-gray-500 font-medium">Dimensión</th>
                        <th className="py-1 pr-3 text-gray-500 font-medium">Respuesta</th>
                        <th className="py-1 text-gray-500 font-medium">Aporte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.lines.map((l) => (
                        <tr key={l.label} className="border-b border-gray-100">
                          <td className="py-1 pr-3 text-gray-700">{l.label}</td>
                          <td className="py-1 pr-3 text-gray-600 font-mono">{l.raw}</td>
                          <td className="py-1 text-gray-700 font-mono">{l.pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-sm font-semibold text-gray-800 pt-1">
                    Total: <span className="text-blue-600">{ex.total}%</span> &rarr;{' '}
                    {ex.total < 25 ? 'Baja' : ex.total < 50 ? 'Media' : ex.total < 75 ? 'Alta' : 'Crítica'}
                  </p>
                </div>
              )})()}
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-1">Interpretación</h4>
              <div className="space-y-1.5 text-sm">
                <p className="text-gray-600"><span className="inline-block w-16 text-green-600 font-medium">&lt; 25%</span> Baja vulnerabilidad</p>
                <p className="text-gray-600"><span className="inline-block w-16 text-yellow-600 font-medium">25–49%</span> Media vulnerabilidad</p>
                <p className="text-gray-600"><span className="inline-block w-16 text-orange-600 font-medium">50–74%</span> Alta vulnerabilidad</p>
                <p className="text-gray-600"><span className="inline-block w-16 text-red-600 font-medium">≥ 75%</span> Crítica — ayuda inmediata</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-400 pb-8">
        SOMOS LUXOR &copy; {new Date().getFullYear()} &mdash; Una iniciativa de Supermercados Luxor
      </p>
    </div>
  )
}