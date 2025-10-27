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

export type ListGames = (data: any, callback: (data: { games: Array<Game> }) => void) => void;

export interface CreateGameRequest { password?: string; }
export type CreateGame = (data: CreateGameRequest, callback: (data: Game) => void) => void;

export type JoinGame = (data: { gameId: string }, callback: (data: any) => void) => void;
