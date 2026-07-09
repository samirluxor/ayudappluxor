import { useState, useEffect } from 'react'
import lugares from '../data/lugares'

export default function PlaceSelector({ estado, ciudad, value, onChange }) {
  const [custom, setCustom] = useState(false)
  const places = estado && ciudad && lugares[estado]?.[ciudad] ? lugares[estado][ciudad] : []

  useEffect(() => {
    if (value && places.length > 0 && !places.includes(value)) {
      setCustom(true)
    }
  }, [value, estado, ciudad])

  if (places.length === 0) {
    return (
      <input type="text" value={value} onChange={onChange} name="direccion_sector"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
        placeholder="Sector / Urbanización" />
    )
  }

  if (custom) {
    return (
      <div className="flex gap-2">
        <input type="text" value={value} onChange={onChange} name="direccion_sector"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
          placeholder="Escribe el sector" autoFocus />
        <button type="button" onClick={() => setCustom(false)}
          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap">Lista</button>
      </div>
    )
  }

  return (
    <select value={value} onChange={(e) => {
      const val = e.target.value
      if (val === '__otro__') {
        setCustom(true)
        onChange({ target: { name: 'direccion_sector', value: '' } })
      } else {
        setCustom(false)
        onChange({ target: { name: 'direccion_sector', value: val } })
      }
    }} disabled={!estado || !ciudad}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
      <option value="">Seleccionar sector</option>
      {places.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
      <option value="__otro__">Otro (especificar)</option>
    </select>
  )
}
