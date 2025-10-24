import React, { useState } from 'react'
import MapView from './components/MapView'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingPin, setIsAddingPin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    try {
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const results = await response.json()
      console.log('Search results:', results)
      // TODO: Display search results on map
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error('Search error:', err)
    }
  }

  const handleAddPin = () => {
    setIsAddingPin(!isAddingPin)
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className="map-container">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery)
            }
          }}
        />
        <button
          className={`add-pin-button ${isAddingPin ? 'active' : ''}`}
          onClick={handleAddPin}
        >
          {isAddingPin ? 'Cancel' : 'Add Pin'}
        </button>
      </div>

      {error && (
        <div className="error">
          {error}
          <button onClick={clearError} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      )}

      <MapView
        apiUrl={API_URL}
        isAddingPin={isAddingPin}
        onPinAdded={() => {
          setIsAddingPin(false)
          setError(null)
        }}
        onError={setError}
      />
    </div>
  )
}

export default App
