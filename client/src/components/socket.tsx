import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@betrayal/shared'
import { useAuth0 } from '@auth0/auth0-react'

type SocketContextValue = {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
    isConnected: boolean
    isConnecting: boolean
    error: any | null
    connect: () => Promise<Socket<ServerToClientEvents, ClientToServerEvents> | null>
    disconnect: () => void
} | null

const SocketContext = createContext<SocketContextValue>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const url = "http://localhost:4000"

    const { isAuthenticated, getAccessTokenSilently } = useAuth0()

    const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents>>(
        io(url, {
            autoConnect: false,
        })
    )
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<any | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    const fetchToken = useCallback(async () => {
        try {
            const token = await getAccessTokenSilently()
            setAccessToken(token)
            return token
        } catch (err) {
            setAccessToken(null)
            return null
        }
    }, [getAccessTokenSilently])

    const connect = useCallback(async () => {
        setIsConnecting(true)
        setError(null)

        try {
            let token = accessToken
            if (!token && isAuthenticated) {
                token = await fetchToken()
            }

            const authPayload = token ? { token: `Bearer ${token}` } : undefined

            const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(url, {
                autoConnect: true,
                withCredentials: true,
                auth: authPayload,
            })
            setSocket(socket)

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

            return socket
        } catch (err) {
            setError(err)
            setIsConnecting(false)
            return null
        }
    }, [accessToken, fetchToken, isAuthenticated, url])

    const disconnect = useCallback(() => {
        socket.disconnect()
        setIsConnected(false)
        setIsConnecting(false)
    }, [])

    // Auto connect when authenticated
    useEffect(() => {
        if (isAuthenticated) void connect()
        else disconnect()

        return () => {
            disconnect()
        }
    }, [isAuthenticated, connect, disconnect])

    // If token changes while connected, update handshake and reconnect
    useEffect(() => {
        if (accessToken) {
            try {
                socket.auth = { token: `Bearer ${accessToken}` }
                socket.disconnect()
                socket.connect()
            } catch (e) {
                // ignore
            }
        }
    }, [accessToken])

    // Fetch token when authenticated initially
    useEffect(() => {
        if (isAuthenticated) void fetchToken()
        else setAccessToken(null)
    }, [isAuthenticated, fetchToken])

    const value = useMemo(() => ({
        socket,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
    }), [isConnected, isConnecting, error, connect, disconnect])

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
    const ctx = useContext(SocketContext)
    if (!ctx) throw new Error('useSocketContext must be used within a <SocketProvider>')
    return ctx
}

export default SocketProvider
