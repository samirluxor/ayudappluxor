export default async function handler(req, res) {
  const { app_id, token, nacionalidad, cedula } = req.query

  if (!cedula) {
    return res.status(400).json({ error: 'Falta la cédula' })
  }

  const url = `https://api.cedula.com.ve/api/v1?app_id=${app_id}&token=${token}&nacionalidad=${nacionalidad || 'V'}&cedula=${cedula}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(response.status).json(data)
  } catch {
    res.status(500).json({ error: 'Error al consultar la cédula' })
  }
}
