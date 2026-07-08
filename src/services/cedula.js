const API_URL = '/api/cedula'
const APP_ID = '9172'
const TOKEN = '5a33185978a57f0053f7b9e4d148570c'

export async function buscarCedula(cedula) {
  if (!cedula || cedula.length < 6) return null

  const nacionalidad = cedula.startsWith('V-') || cedula.startsWith('v-')
    ? 'V' : cedula.startsWith('E-') || cedula.startsWith('e-')
    ? 'E' : 'V'

  const numero = cedula.replace(/[VEve-]/g, '').trim()
  if (!numero) return null

  const url = `${API_URL}?app_id=${APP_ID}&token=${TOKEN}&nacionalidad=${nacionalidad}&cedula=${numero}`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()

    const d = data?.data
    if (!d) return null

    const nombre = [d.primer_nombre, d.segundo_nombre].filter(Boolean).join(' ')
    const apellido = [d.primer_apellido, d.segundo_apellido].filter(Boolean).join(' ')

    return {
      nombre,
      apellido,
      fechaNacimiento: d.fecha_nac || '',
      sexo: d.sexo || '',
    }
  } catch {
    return null
  }
}
