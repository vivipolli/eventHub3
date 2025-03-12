'use client'

import { useState, useEffect } from 'react'
import {
  connect,
  disconnect,
  isConnected,
  getLocalStorage,
} from '@stacks/connect'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const authenticated = isConnected()
    if (authenticated) {
      const data = getLocalStorage()
      setUserData(data)
    }
    setIsAuthenticated(authenticated)
  }

  const handleConnect = async () => {
    try {
      const response = await connect()
      setUserData(response)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsAuthenticated(false)
    setUserData(null)
  }

  return {
    isAuthenticated,
    userData,
    connect: handleConnect,
    disconnect: handleDisconnect,
  }
}
