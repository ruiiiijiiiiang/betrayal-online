import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInterval } from 'react-use';
import { Button } from '../components/button'
import { CoverContainer } from '../components/cover-container'
import { useSocket } from '../components/socket';
import { Game } from '@betrayal/shared';


export default function GamesList() {
    const navigate = useNavigate()
    const [matches, setMatches] = useState<Game[]>([])
    const { socket } = useSocket();

    const loadMatches = async () => {
        socket?.emit('list-games', {}, (response) => {
            setMatches(response.games);
        })
    }

    useInterval(loadMatches, 10000);

    return (
        <CoverContainer>
            <div className='bg-red-800/10 p-6 space-y-5 my-12'>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-3xl font-tomarik-brush text-red-900/85'>Available Games</h1>
                    <Button onClick={loadMatches} className='bg-amber-700 text-white px-4 py-2 hover:bg-amber-600'>Refresh</Button>
                </div>

                {matches.length === 0 && (
                    <div className='text-amber-900'>No games found.</div>
                )}
            </div>
        </CoverContainer>
    )
}
