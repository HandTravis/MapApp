import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Pin {
  id: string
  name: string
  lat: number
  lng: number
  distance_m?: number
}

interface MapViewProps {
  apiUrl: string
  isAddingPin: boolean
  onPinAdded: () => void
  onError: (error: string) => void
}

const MapView: React.FC<MapViewProps> = ({ apiUrl, isAddingPin, onPinAdded, onError }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pins, setPins] = useState<Pin[]>([])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [-74.006, 40.7128], // New York City
      zoom: 12
    })

    map.current.on('load', () => {
      setIsLoading(false)
      loadNearbyPins()
    })

    // Handle map clicks for adding pins
    map.current.on('click', (e) => {
      if (isAddingPin) {
        handleMapClick(e.lngLat.lat, e.lngLat.lng)
      }
    })

    // Change cursor when adding pins
    map.current.on('mouseenter', () => {
      if (isAddingPin && map.current) {
        map.current.getCanvas().style.cursor = 'crosshair'
      }
    })

    map.current.on('mouseleave', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = ''
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (map.current) {
      map.current.getCanvas().style.cursor = isAddingPin ? 'crosshair' : ''
    }
  }, [isAddingPin])

  const loadNearbyPins = async () => {
    if (!map.current) return

    try {
      const center = map.current.getCenter()
      const response = await fetch(
        `${apiUrl}/pins?near=${center.lat},${center.lng}&radius=5000`
      )
      
      if (!response.ok) {
        throw new Error('Failed to load pins')
      }

      const nearbyPins = await response.json()
      setPins(nearbyPins)
      renderPins(nearbyPins)
    } catch (error) {
      console.error('Error loading pins:', error)
      onError('Failed to load nearby pins')
    }
  }

  const renderPins = (pinsToRender: Pin[]) => {
    if (!map.current) return

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.pin-marker')
    existingMarkers.forEach(marker => marker.remove())

    // Add new markers
    pinsToRender.forEach(pin => {
      const el = document.createElement('div')
      el.className = 'pin-marker'
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #007bff;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `

      const marker = new maplibregl.Marker(el)
        .setLngLat([pin.lng, pin.lat])
        .addTo(map.current!)

      // Add popup
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`
          <div class="pin-popup">
            <h3>${pin.name}</h3>
            ${pin.distance_m ? `<p>${Math.round(pin.distance_m)}m away</p>` : ''}
          </div>
        `)

      marker.setPopup(popup)
    })
  }

  const handleMapClick = async (lat: number, lng: number) => {
    const name = prompt('Enter a name for this pin:')
    if (!name || !name.trim()) return

    try {
      const response = await fetch(`${apiUrl}/pins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          lat,
          lng
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create pin')
      }

      const result = await response.json()
      console.log('Pin created:', result)
      
      // Reload nearby pins
      await loadNearbyPins()
      onPinAdded()
    } catch (error) {
      console.error('Error creating pin:', error)
      onError(error instanceof Error ? error.message : 'Failed to create pin')
    }
  }

  if (isLoading) {
    return <div className="loading">Loading map...</div>
  }

  return (
    <div
      ref={mapContainer}
      style={{ height: '100vh', width: '100%' }}
    />
  )
}

export default MapView
