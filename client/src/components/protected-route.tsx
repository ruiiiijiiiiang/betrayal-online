import { Outlet, useNavigate } from 'react-router-dom';
import { useTimeoutFn } from 'react-use';
import { useSocket } from './socket';

export const ProtectedRoute = () => {
    const { socket } = useSocket()
    const navigate = useNavigate();
    useTimeoutFn(() => {
        if (!socket.connected) {
            navigate('/');
        }
    }, 2000);

    if (!socket.connected) {
        return (
            <div className="min-h-screen bg-[url('/bg-light-big.jpg')] bg-repeat bg-cover bg-center flex items-center justify-center">
                <div className="text-yellow-900 text-2xl font-tomarik-brush">Loading...</div>
            </div>
        )
    }

    return <Outlet />
};
