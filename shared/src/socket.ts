import { Account } from "./account";
import { Game } from "./game";

export interface ServerToClientEvents { }
export interface ClientToServerEvents {
    "list-games": ListGames;
    "create-game": CreateGame;
    "join-game": JoinGame;
}
export interface InterServerEvents { }
export interface SocketData { account: Account }

export type SocketEventFn<Data, CallbackFn> = (data: Data, callback: CallbackFn) => void;

// List Games
export type ListGames = SocketEventFn<any, (data: { games: Array<Game> }) => void>;

// Create Game
export interface CreateGameRequest { password?: string; }
export type CreateGame = SocketEventFn<CreateGameRequest, (data: Game) => void>;

// Join Game
export type JoinGame = SocketEventFn<{ gameId: string }, (data: any) => void>;
