const REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'

export async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: true,
    })
  })
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat,
    lon,
    format: 'json',
    addressdetails: '1',
  })
  const res = await fetch(`${REVERSE_URL}?${params}`, {
    headers: { 'User-Agent': 'AyudappLuxor/1.0' },
  })
  if (!res.ok) throw new Error('Error al obtener ubicación')
  return res.json()
}

export function extractCity(address) {
  return address.city || address.town || address.village || address.county || address.municipality || ''
}

export function extractState(address) {
  return address.state || ''
}
