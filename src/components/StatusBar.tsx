'use client'

import { useState, useEffect } from 'react'
import { SignalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'

export default function StatusBar({ isOnline }: { isOnline: boolean }) {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Only set time on client side
    setTime(new Date().toLocaleTimeString())
    
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <SignalIcon className="h-5 w-5 text-green-500" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
        )}
        <span className="font-medium">
          {isOnline ? 'Online' : 'Offline Mode'}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        {time}
      </div>
    </div>
  )
}