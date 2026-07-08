import { useState } from 'react'

export default function FamilyMemberForm({ onAdd }) {
  const [fm, setFm] = useState({ cedula: '', nombre: '', apellido: '', parentesco: '' })
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!fm.cedula || !fm.nombre || !fm.apellido || !fm.parentesco) {
      setError('Todos los campos son obligatorios')
      return
    }
    onAdd({ ...fm })
    setFm({ cedula: '', nombre: '', apellido: '', parentesco: '' })
    setError('')
  }

  return (
    <div className="bg-sky-50 rounded-xl p-4">
      <h4 className="font-medium text-gray-700 mb-3">Agregar familiar</h4>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cédula del familiar
          </label>
          <input
            type="text"
            value={fm.cedula}
            onChange={(e) => setFm({ ...fm, cedula: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
            placeholder="V-12345678"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={fm.nombre}
              onChange={(e) => setFm({ ...fm, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="Nombre"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={fm.apellido}
              onChange={(e) => setFm({ ...fm, apellido: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="Apellido"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Parentesco
          </label>
          <select
            value={fm.parentesco}
            onChange={(e) => setFm({ ...fm, parentesco: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
          >
            <option value="">Seleccionar...</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Cónyuge">Cónyuge</option>
            <option value="Padre">Padre</option>
            <option value="Madre">Madre</option>
            <option value="Hermano/a">Hermano/a</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Tío/a">Tío/a</option>
            <option value="Primo/a">Primo/a</option>
            <option value="Suegro/a">Suegro/a</option>
            <option value="Cuñado/a">Cuñado/a</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2 bg-white hover:bg-gray-50 text-blue-600 font-medium text-sm rounded-lg border border-gray-200 transition-colors"
        >
          + Agregar familiar
        </button>
      </div>
    </div>
  )
}
