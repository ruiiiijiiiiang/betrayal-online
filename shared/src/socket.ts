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

export type SocketEventFn<Request, Response> = (request: Request, respond: (response: Response) => void) => void;

// List Games
export interface ListGamesResponse { games: Array<Game>; }
export type ListGames = SocketEventFn<any, ListGamesResponse>;

// Create Game
export interface CreateGameRequest { password?: string; }
export type CreateGame = SocketEventFn<CreateGameRequest, Game>;

// Join Game
export interface JoinGameRequest { gameId: string; }
export type JoinGame = SocketEventFn<JoinGameRequest, any>;
