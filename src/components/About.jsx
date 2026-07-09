import { HeartIcon, GlobeAltIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <img src="/logo.webp" alt="AyudApp Luxor" className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg object-cover" />
        <h2 className="text-3xl font-bold text-gray-800">AyudApp Luxor</h2>
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
          del pueblo venezolano, ha puesto en marcha la <strong>AyudApp Luxor</strong> como una herramienta 
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
          La <strong>AyudApp Luxor</strong> es parte de este esfuerzo: una plataforma gratuita, de código 
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
          Cada encuesta registrada en AyudApp Luxor representa una familia que necesita ser escuchada 
          y atendida. Cada dato recolectado es un paso hacia una distribución más justa y eficiente de 
          la ayuda. Invitamos a todos los voluntarios, organizaciones y ciudadanos de bien a sumarse a 
          esta causa. <strong>Juntos podemos reconstruir Venezuela.</strong>
        </p>
      </div>

      <p className="text-center text-sm text-gray-400 pb-8">
        AyudApp Luxor &copy; {new Date().getFullYear()} &mdash; Una iniciativa de Supermercados Luxor
      </p>
    </div>
  )
}