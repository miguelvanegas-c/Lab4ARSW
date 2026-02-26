import { useEffect, useRef, useState } from 'react'
import { createStompClient, subscribeBlueprint } from './lib/stompClient.js'
import { createSocket } from './lib/socketIoClient.js'
import Search from './Search.jsx'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080' // Spring
const IO_BASE  = import.meta.env.VITE_IO_BASE  ?? 'http://localhost:3001' // Node/Socket.IO

export default function App() {
  const [tech, setTech] = useState('stomp')
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  const stompRef = useRef(null)
  const unsubRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    handleFetch(`${API_BASE}/api/v1/blueprints/${author}/${name}`)
      
  }, [tech, author, name])

  function handleFetch(url) {
    fetch(url)
        .then(async r => {
        const data = await r.json()
        return data
        })
        .then(resp => {
        const bp = resp
        if(resp.code === 404){
            setError(resp.data)
        } else {
            setError(null)
            drawAll(bp)
        }
        })
    
 }

  function drawAll(bp) {
    
    const ctx = canvasRef.current?.getContext('2d')
    
    if (!ctx) return
    ctx.clearRect(0,0,600,400)
    ctx.beginPath()
    bp.data.points.forEach((p,i)=> {
      if (i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y)
    })
    ctx.stroke()
  }

  useEffect(() => {
    unsubRef.current?.(); unsubRef.current = null
    stompRef.current?.desactivate?.(); stompRef.current = null
    socketRef.current?.disconnect?.(); socketRef.current = null

    if (tech === 'stomp') {
      const client = createStompClient(IO_BASE)
      stompRef.current = client
      client.onConnect = () => {
        unsubRef.current = subscribeBlueprint(client, author, name, (upd)=> {
          drawAll({ data: { points: upd.points } })
        })
      }
      client.activate()
    } else {
      const s = createSocket(IO_BASE)
      socketRef.current = s
      const room = `blueprints.${author}.${name}`
      s.emit('join-room', room)
      s.on('blueprint-update', (upd)=> drawAll({ data: { points: upd.points } }))
    }
    return () => {
      unsubRef.current.unsubscribe?.(); unsubRef.current = null
      stompRef.current?.desactivate?.()
      socketRef.current?.disconnect?.()
    }
  }, [tech, author, name])

  async function onClick(e) {
    const rect = e.target.getBoundingClientRect()
    const point = { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) }
    
    if (tech === 'stomp' && stompRef.current?.connected) {
      const bp = await updatePoints(point)
      const points = bp.data.points
      drawAll({ data: { points } })
      stompRef.current.publish({ destination: '/app/draw', body: JSON.stringify({ author, name, points }) })
      
    } else if (tech === 'socketio' && socketRef.current?.connected) {
      const room = `blueprints.${author}.${name}`
      socketRef.current.emit('draw-event', { room, author, name, point })
    }
  }

  async function updatePoints(point) {
    const resp = await fetch(`${API_BASE}/api/v1/blueprints/${author}/${name}/points`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(point)
    })

    if (!resp.ok) {
      throw new Error("Error guardando punto")
    }
    return await fetch(`${API_BASE}/api/v1/blueprints/${author}/${name}`)
      .then(r => r.json())
      

}
function crearPlano(url) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "author": author,
      "name": name,
      "points": []
    })
     })
  .then(async r => {
    if (!r.ok) {
      const errorData = await r.json()
      setError(errorData.message || "Error creando plano")
      return null
    }
    setError(null)
    return await r.json()
  })
  .then(data => {
    if (data) drawAll(data)
  })
  .catch(err => {
    setError(err.message || "Error creando plano")
  })
}
function deletePlano(url) {
  fetch(url, {
    method: 'DELETE'
  })
  .then(async r => {
    if (!r.ok) {
      const errorData = await r.json()
      setError(errorData.message || "Error eliminando plano")
      return null
    }
    setError(null)
    return await r.json()
  })
  .then(data => {
    if (data) drawAll({ data: { points: [] } })
  })
  .catch(err => {
    setError(err.message || "Error eliminando plano")
  })
}

  return (
    <div style={{fontFamily:'Inter, system-ui', padding:16, maxWidth:900}}>
      <h2>BluePrints RT STOMP</h2>
      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
        <label>Tecnología:</label>
        <select value={tech} onChange={e=>setTech(e.target.value)}>
          <option value="stomp">STOMP (Spring)</option>
          <option value="socketio">Socket.IO (Node)</option>
        </select>
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="autor"/>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="plano"/>
        <button onClick={() => crearPlano(`${API_BASE}/api/v1/blueprints`)}>Crear plano</button>
        <button onClick={() => deletePlano(`${API_BASE}/api/v1/blueprints/${author}/${name}`)}>Eliminar plano</button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{border:'1px solid #ddd', borderRadius:12}}
        onClick={onClick}
      />
      <p style={{opacity:.7, marginTop:8}}>Tip: abre 2 pestañas y dibuja alternando para ver la colaboración.</p>
      {Search && <Search />}
    </div>
  )
}