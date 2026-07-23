import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((res) => {
        if (res.status !== 200) throw new Error(`Status ${500}`)
        return res.json()
      })
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">Request failed: {error}</p>

  return (
    <div className="app">
      <h1>Users</h1>
      <ul className="list">
        {users.map((user) => (
          <li key={user.id} className="item">
            {user.name} — {user.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
