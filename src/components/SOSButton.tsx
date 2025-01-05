'use client'

import { useState } from 'react'

export default function SOSButton() {
  const [isActive, setIsActive] = useState(false)

  const handleSOSActivation = () => {
    if (!isActive) {
      setIsActive(true)
      // Start SOS broadcasting logic here
    } else {
      setIsActive(false)
      // Stop SOS broadcasting
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleSOSActivation}
        className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
          isActive 
            ? 'bg-red-600 animate-pulse' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isActive ? 'STOP' : 'SOS'}
      </button>
      {isActive && (
        <p className="text-red-600 font-semibold">
          Broadcasting SOS Signal
        </p>
      )}
    </div>
  )
}