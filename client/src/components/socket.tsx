import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@betrayal/shared'
import { useAuth0 } from '@auth0/auth0-react'

type SocketContextValue = {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
    isConnected: boolean
    isConnecting: boolean
    error?: Error
}

const SocketContext = createContext<SocketContextValue>(undefined!)

const SOCKET_URL = "http://localhost:4000"
const SINGLETON_SOCKET = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        SINGLETON_SOCKET.auth = async (cb) => {
            const token = await getAccessTokenSilently()
            cb({ token })
        }
        SINGLETON_SOCKET.on('connect_error', (err) => {
            setError(err)
        })
        SINGLETON_SOCKET.on('connect', () => {
            setIsConnected(true)
            setIsConnecting(false)
            setError(undefined)
        })
        SINGLETON_SOCKET.on('disconnect', () => {
            setIsConnected(false)
            setIsConnecting(false)
            setError(undefined)
        })
        SINGLETON_SOCKET.connect()
        return () => {
            SINGLETON_SOCKET.disconnect()
            SINGLETON_SOCKET.removeAllListeners()
        }
    }, [isAuthenticated, SINGLETON_SOCKET])

    const value = useMemo(() => ({
        socket: SINGLETON_SOCKET,
        isConnected,
        isConnecting,
        error,
    }), [SINGLETON_SOCKET, isConnected, isConnecting, error])

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocketContext must be used within a <SocketProvider>')
    return ctx
}

export default SocketProvider
