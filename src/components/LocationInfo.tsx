'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon } from '@heroicons/react/24/solid'

export default function LocationInfo() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          setError('Unable to get location')
        }
      )
    } else {
      setError('Geolocation not supported')
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-2">
        <MapPinIcon className="h-5 w-5 text-gray-500" />
        <span className="font-medium">Location</span>
      </div>
      
      {location ? (
        <p className="mt-2 text-sm text-gray-600">
          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </p>
      ) : (
        <p className="mt-2 text-sm text-red-500">
          {error || 'Getting location...'}
        </p>
      )}
    </div>
  )
}