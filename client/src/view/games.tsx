import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffectOnce, useInterval } from 'react-use';
import { Button } from '../components/button'
import { CoverContainer } from '../components/cover-container'
import { useSocket } from '../components/socket';
import { Game } from '@betrayal/shared';


export default function GamesList() {
    const navigate = useNavigate()
    const [games, setGames] = useState<Game[]>([])
    const { socket } = useSocket();

    const loadGames = async () => {
        socket?.emit('list-games', {}, (response) => {
            setGames(response.games);
        })
    }

    useEffectOnce(() => {
        loadGames();
    });

    useInterval(loadGames, 10000);

    const onGameDetails = (gameId: string) => {
        navigate(`/games/${encodeURIComponent(gameId)}`);
    }

    return (
        <CoverContainer>
            <div className='bg-red-800/10 p-6 space-y-5 my-12'>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-3xl font-tomarik-brush text-red-900/85'>Available Games</h1>
                    <Button onClick={loadGames} className='bg-amber-700 text-white px-4 py-2 hover:bg-amber-600'>Refresh</Button>
                </div>

                {
                    games.map((game) => (
                        <div
                            key={game.id}
                            className='p-4 bg-white/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer'
                            onClick={() => onGameDetails(game.id)}
                        >
                            <div>
                                <div className='text-xl text-amber-900 font-medium'>{game.name}</div>
                                <div className='text-amber-800 text-sm'>{Object.keys(game.players).length}/6 players</div>
                                <p className='text-sm text-amber-800'>Status: {game.status}</p>
                                <p className='text-sm text-amber-800'>Password Protected: {game.isPasswordProtected ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    ))
                }

                {games.length === 0 && (
                    <div className='text-amber-900'>No games found.</div>
                )}
            </div>
        </CoverContainer>
    )
}
