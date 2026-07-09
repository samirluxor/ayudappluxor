import { useState, useRef } from 'react'
import { buscarCedula } from '../services/cedula'
import db from '../lib/db'

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

export default function FamilyMemberForm({ onAdd, existingCedulas = [] }) {
  const [fm, setFm] = useState({ cedula: '', nombre: '', apellido: '', sexo: '', fecha_nacimiento: '', parentesco: '' })
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [duplicado, setDuplicado] = useState('')
  const cedulaTimer = useRef(null)

  const buscarAuto = (cedula) => {
    if (cedulaTimer.current) clearTimeout(cedulaTimer.current)
    setDuplicado('')

    if (cedula.length < 6) return

    cedulaTimer.current = setTimeout(async () => {
      setBuscando(true)
      const data = await buscarCedula(cedula)
      if (data) {
        setFm((prev) => ({
          ...prev,
          nombre: data.nombre || prev.nombre,
          apellido: data.apellido || prev.apellido,
          sexo: data.sexo || prev.sexo,
          fecha_nacimiento: data.fechaNacimiento || prev.fecha_nacimiento,
        }))
      }

      const norm = normalizarCedula(cedula)
      const dupeActual = existingCedulas.some((c) => normalizarCedula(c) === norm)
      const dupeDB = await cedulaYaRegistrada(cedula)
      if (dupeActual || dupeDB) {
        setDuplicado('Esta cédula ya se encuentra registrada')
      }
      setBuscando(false)
    }, 600)
  }

  const handleSubmit = async () => {
    if (!fm.cedula || !fm.nombre || !fm.apellido || !fm.sexo || !fm.parentesco) {
      setError('Todos los campos son obligatorios')
      return
    }

    const norm = normalizarCedula(fm.cedula)
    const dupeActual = existingCedulas.some((c) => normalizarCedula(c) === norm)
    const dupeDB = await cedulaYaRegistrada(fm.cedula)
    if (dupeActual || dupeDB) {
      setError('Esta cédula ya se encuentra registrada')
      return
    }

    onAdd({ ...fm })
    setFm({ cedula: '', nombre: '', apellido: '', sexo: '', fecha_nacimiento: '', parentesco: '' })
    setError('')
    setDuplicado('')
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
          <div className="relative">
            <input
              type="text"
              value={fm.cedula}
              onChange={(e) => { setFm({ ...fm, cedula: e.target.value }); buscarAuto(e.target.value) }}
              className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="V-12345678"
            />
            {buscando && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <div className="animate-spin w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
          {duplicado && (
            <p className="text-xs text-red-500 mt-1">{duplicado}</p>
          )}
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

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Sexo</label>
          <div className="flex gap-2">
            {['Masculino', 'Femenino'].map((opt) => (
              <button key={opt} type="button" onClick={() => setFm({ ...fm, sexo: opt })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${fm.sexo === opt ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha de nacimiento</label>
          <input type="date" value={fm.fecha_nacimiento} onChange={(e) => setFm({ ...fm, fecha_nacimiento: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition" />
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
