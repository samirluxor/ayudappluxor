const API_URL = '/api/cedula'
const APP_ID = '9172'
const TOKEN = '5a33185978a57f0053f7b9e4d148570c'

async function predecirGenero(nombre) {
  const primerNombre = nombre?.split(' ')[0]?.toLowerCase()
  if (!primerNombre) return ''
  try {
    const res = await fetch(`https://api.genderize.io?name=${primerNombre}`)
    if (!res.ok) return ''
    const data = await res.json()
    if (data.gender === 'male') return 'Masculino'
    if (data.gender === 'female') return 'Femenino'
    return ''
  } catch {
    return ''
  }
}

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
    const genero = d.sexo === 'M' ? 'Masculino' : d.sexo === 'F' ? 'Femenino' : await predecirGenero(nombre)

    return {
      nombre,
      apellido,
      fechaNacimiento: d.fecha_nac || '',
      sexo: genero,
    }
  } catch {
    return null
  }
}
