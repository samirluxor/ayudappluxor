import { useState, useRef, useEffect } from 'react'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export default function AddressAutocomplete({ value, onChange, placeholder, onAddressSelect, name = 'direccion_fiscal' }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const timer = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = (q) => {
    if (timer.current) clearTimeout(timer.current)
    const trimmed = q.trim()
    if (trimmed.length < 4) {
      setSuggestions([])
      setOpen(false)
      return
    }
    timer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          format: 'json',
          countrycodes: 've',
          limit: '6',
          addressdetails: '1',
        })
        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: { 'User-Agent': 'AyudappLuxor/1.0' },
        })
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
        setActiveIdx(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, 400)
  }

  const selectItem = (item) => {
    const display = item.display_name
    setQuery(display)
    setOpen(false)
    onChange({ target: { name, value: display } })
    if (onAddressSelect && item.address) {
      onAddressSelect(item.address)
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    fetchSuggestions(val)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      selectItem(suggestions[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, i) => (
            <li
              key={item.place_id}
              onClick={() => selectItem(item)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                i === activeIdx ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="block leading-snug">{item.display_name}</span>
              {item.type && <span className="text-xs text-gray-400 mt-0.5 block">{item.type}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
