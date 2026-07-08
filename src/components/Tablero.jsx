import { useState, useEffect } from 'react'
import { getLocalSurveys } from '../services/sync'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { DocumentTextIcon, UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline'

const COLORS = ['#3B82F6', '#0EA5E9', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#F97316']

function calcularEdad(fecha) {
  if (!fecha) return null
  const hoy = new Date()
  const nac = new Date(fecha)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

export default function Tablero() {
  const [surveys, setSurveys] = useState([])

  useEffect(() => {
    getLocalSurveys().then(setSurveys)
  }, [])

  const totalEncuestados = surveys.length
  const totalFamiliares = surveys.reduce((s, e) => s + (e.familyMembers?.length || 0), 0)
  const totalPersonas = totalEncuestados + totalFamiliares

  const familiaPorTamano = [0, 0, 0, 0, 0, 0]
  surveys.forEach((s) => {
    const n = s.familyMembers?.length || 0
    familiaPorTamano[Math.min(n, 5)]++
  })

  const familiaData = [
    { name: '0', value: familiaPorTamano[0] },
    { name: '1', value: familiaPorTamano[1] },
    { name: '2', value: familiaPorTamano[2] },
    { name: '3', value: familiaPorTamano[3] },
    { name: '4', value: familiaPorTamano[4] },
    { name: '5+', value: familiaPorTamano[5] },
  ]

  const generoMap = { Masculino: 0, Femenino: 0, Otro: 0 }
  surveys.forEach((s) => {
    const g = s.genero || ''
    if (g === 'Masculino' || g === 'M') generoMap.Masculino++
    else if (g === 'Femenino' || g === 'F') generoMap.Femenino++
    else if (g) generoMap.Otro++
  })
  const generoData = Object.entries(generoMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
  const sinGenero = surveys.filter((s) => !s.genero).length

  const edadRangos = { '0-12': 0, '13-17': 0, '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 }
  surveys.forEach((s) => {
    const edad = calcularEdad(s.fecha_nacimiento)
    if (edad === null) return
    if (edad <= 12) edadRangos['0-12']++
    else if (edad <= 17) edadRangos['13-17']++
    else if (edad <= 30) edadRangos['18-30']++
    else if (edad <= 45) edadRangos['31-45']++
    else if (edad <= 60) edadRangos['46-60']++
    else edadRangos['60+']++
  })
  const edadData = Object.entries(edadRangos)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const zonasMap = {}
  surveys.forEach((s) => {
    const dir = (s.direccion_fiscal || '').trim().toLowerCase()
    if (!dir) return
    const zona = dir.split(',')[0].split(' ').slice(0, 2).join(' ')
    zonasMap[zona] = (zonasMap[zona] || 0) + 1
  })
  const zonasData = Object.entries(zonasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const sinDatos = surveys.length === 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tablero</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalEncuestados}</p>
            <p className="text-sm text-gray-500">Encuestas</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalFamiliares}</p>
            <p className="text-sm text-gray-500">Familiares</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <UserGroupIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalPersonas}</p>
            <p className="text-sm text-gray-500">Personas registradas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Familiares por encuesta</h3>
          {sinDatos ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={familiaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" label={{ value: 'Cant. familiares', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#9CA3AF' }} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Encuestas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución por género</h3>
          {sinDatos || (generoData.length === 0 && !sinGenero) ? (
            <p className="text-gray-400 text-sm text-center py-8">Completa encuestas para ver datos</p>
          ) : (
            <div>
              {sinGenero > 0 && (
                <p className="text-xs text-amber-500 mb-2">{sinGenero} encuesta{sinGenero !== 1 ? 's' : ''} sin género registrado</p>
              )}
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={generoData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                    {generoData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                  <Legend iconType="circle" formatter={(v) => <span className="text-sm text-gray-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución por edades</h3>
          {sinDatos || edadData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Completa fecha de nacimiento para ver datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={edadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Bar dataKey="value" fill="#0EA5E9" radius={[6, 6, 0, 0]} name="Personas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Distribución por zonas</h3>
          {sinDatos || zonasData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Completa dirección para ver datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={zonasData} cx="50%" cy="50%" outerRadius={80} dataKey="value" stroke="none" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {zonasData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }} />
                <Legend iconType="circle" formatter={(v) => <span className="text-sm text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
