import { useState, useEffect } from 'react'
import estadosYCiudades from '../data/venezuela'

export default function StateCitySelector({ estado, ciudad, onEstadoChange, onCiudadChange }) {
  const [customCiudad, setCustomCiudad] = useState(false)
  const estados = Object.keys(estadosYCiudades)
  const ciudades = estado ? estadosYCiudades[estado] : []

  useEffect(() => {
    if (ciudad && estado && !ciudades.includes(ciudad)) {
      setCustomCiudad(true)
    }
  }, [ciudad, estado])

  const handleEstadoChange = (e) => {
    const val = e.target.value
    onEstadoChange({ target: { name: 'direccion_estado', value: val } })
    onCiudadChange({ target: { name: 'direccion_ciudad', value: '' } })
    setCustomCiudad(false)
  }

  const handleCiudadSelect = (e) => {
    const val = e.target.value
    if (val === '__otra__') {
      setCustomCiudad(true)
      onCiudadChange({ target: { name: 'direccion_ciudad', value: '' } })
    } else {
      setCustomCiudad(false)
      onCiudadChange({ target: { name: 'direccion_ciudad', value: val } })
    }
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
        <select value={estado} onChange={handleEstadoChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition appearance-none">
          <option value="">Seleccionar estado</option>
          {estados.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Ciudad</label>
        {!customCiudad ? (
          <select value={ciudad} onChange={handleCiudadSelect} disabled={!estado}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
            <option value="">Seleccionar ciudad</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__otra__">Otra (especificar)</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input type="text" value={ciudad} onChange={onCiudadChange} name="direccion_ciudad"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
              placeholder="Escribe la ciudad" autoFocus />
            <button type="button" onClick={() => setCustomCiudad(false)}
              className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap">Lista</button>
          </div>
        )}
      </div>
    </>
  )
}
