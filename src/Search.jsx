import { useState } from "react";

export default function Search() {
  const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'
  const [authorSearch, setAuthorSearch] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  function handleFetch(url) {
    fetch(url)
        .then(async r => {
        const data = await r.json()
        return data
        })
        .then(resp => {
        const list = Array.isArray(resp.data) ? resp.data : [resp.data]
        if(resp.code === 404){
            setError(resp.data)
        } else {
            setResults(list)
            setError(null)
        }
        })
    
 }

  function onClick() {
    if (authorSearch === '' && nameSearch === '') {
      handleFetch(`${API_BASE}/api/v1/blueprints`)
    } else if (authorSearch !== '' && nameSearch === '') {
      handleFetch(`${API_BASE}/api/v1/blueprints/${authorSearch}`)
    } else {
      handleFetch(`${API_BASE}/api/v1/blueprints/${authorSearch}/${nameSearch}`)
    }
  }

  return (
    <div>
      <input value={authorSearch} onChange={e=>setAuthorSearch(e.target.value)} placeholder="autor"/>
      <input value={nameSearch} onChange={e=>setNameSearch(e.target.value)} placeholder="plano"/>
      <button onClick={onClick}>Buscar</button>

      {error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <ul>
          {results.map(bp => (
            <li key={`${bp.author}-${bp.name}`}>
              {bp.author} - {bp.name} points:
                <ul>
                    {bp.points.map((p,i) => (
                        <li key={i}>({p.x}, {p.y})</li>
                    ))}
                </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}