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

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const url = "http://localhost:4000"
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<Error>()
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(url, {
        autoConnect: true,
        withCredentials: true,
        auth: async (cb) => {
            const token = await getAccessTokenSilently()
            cb({ token })
        },
    })

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true)
            setIsConnecting(false)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
        })

        socket.on('connect_error', (err) => {
            setError(err)
            setIsConnecting(false)
        })

        return () => {
            socket.disconnect()
            socket.removeAllListeners()
        }
    }, [isAuthenticated])

    const value = useMemo(() => ({
        socket,
        isConnected,
        isConnecting,
        error,
    }), [isConnected, isConnecting, error])

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocketContext must be used within a <SocketProvider>')
    return ctx
}

export default SocketProvider
