import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/button';
import { CoverContainer } from '../components/cover-container';
import { Switch } from '../components/switch';
import { useSocket } from '../components/socket';


export default function NewGame() {
    const navigate = useNavigate();
    const { socket } = useSocket();

    const [isPrivate, setIsPrivate] = useState<boolean>(true);
    const [password, setPassword] = useState<string>();

    const handleCreateGame = async () => {
        socket?.emit('create-game', { password }, (response: any) => {
            const { id } = response;
            navigate(`/games/${id}`);
        });
    };

    return (
        <CoverContainer>
            <div className='bg-red-800/10 p-6 space-y-6 my-12 max-w-lg mx-auto'>
                <div className='flex items-center justify-between'>
                    <h1 className='text-3xl font-tomarik-brush text-red-900/85'>Create New Game</h1>
                </div>

                <div className='space-y-5'>
                    {/* Game Password */}
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <label className='block text-amber-900 font-medium'>Password Protected Game</label>
                            <Switch
                                checked={isPrivate}
                                onChange={(v: boolean) => setIsPrivate(v)}
                            />
                        </div>

                        {isPrivate && (
                            <div className='space-y-2'>
                                <input
                                    id='gamePassword'
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Password to join this game'
                                    className='w-full rounded border px-3 py-2'
                                />
                                <p className='text-sm text-amber-800'>
                                    Set a password so only players with the password can join.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 pt-4'>
                    <Button
                        onClick={handleCreateGame}
                        disabled={isCreating}
                        className='flex-1 bg-yellow-700 text-white font-tomarik-brush text-lg px-6 py-3 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isCreating ? 'Creating...' : 'Create Game'}
                    </Button>
                </div>
            </div>
        </CoverContainer>
    );
}
