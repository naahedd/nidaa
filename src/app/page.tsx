'use client'

import { useState, useEffect } from 'react'
import SOSButton from '@/components/SOSButton'
import StatusBar from '@/components/StatusBar'
import LocationInfo from '@/components/LocationInfo'
import TestControls from '@/components/TestControls'
import SensorTestPanel from '@/components/SensorTestPanel'


export default function Home() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Status Bar */}
        <StatusBar isOnline={isOnline} />
        <LocationInfo />
        <SensorTestPanel />
        
        {/* Main SOS Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <SOSButton />
        </div>
        {process.env.NODE_ENV === 'development' && (
          <TestControls />
        )}
      </div>
    </main>
  )
}