import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@betrayal/shared'
import { useAuth0 } from '@auth0/auth0-react'

type SocketContextValue = {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
    error?: Error
    connect: () => Promise<void>
    disconnect: () => void
}

const SocketContext = createContext<SocketContextValue>(undefined!)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const url = "http://localhost:4000"
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()
    const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>(io())
    const [error, setError] = useState<Error>()

    const connect = useCallback(async () => {
        if (!isAuthenticated) return

        setError(undefined)

        const token = await getAccessTokenSilently()
        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(url, {
            autoConnect: true,
            withCredentials: true,
            auth: { token: `Bearer ${token}` },
        })
        setSocket(socket)

        socket.on('connect_error', (err) => {
            setError(err)
        })
    }, [isAuthenticated])

    const disconnect = useCallback(() => {
        socket.disconnect()
    }, [socket])

    useEffect(() => {
        void connect()
        return () => disconnect()
    }, [isAuthenticated])

    const value = useMemo(() => ({
        socket,
        error,
        connect,
        disconnect,
    }), [socket, error, connect, disconnect])

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocketContext must be used within a <SocketProvider>')
    return ctx
}

export default SocketProvider
