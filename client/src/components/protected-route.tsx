import { Outlet, useNavigate } from 'react-router-dom';
import { useTimeoutFn } from 'react-use';
import { useSocket } from './socket';

export const ProtectedRoute = () => {
    const { isConnected, isConnecting } = useSocket()
    const navigate = useNavigate();
    useTimeoutFn(() => {
        if (!isConnected && !isConnecting) {
            navigate('/');
        }
    }, 2000);

    if (isConnecting) {
        return (
            <div className="min-h-screen bg-[url('/bg-light-big.webp')] bg-repeat bg-cover bg-center flex items-center justify-center">
                <div className="text-yellow-900 text-2xl font-tomarik-brush">Loading...</div>
            </div>
        )
    }

    return <Outlet />
};
