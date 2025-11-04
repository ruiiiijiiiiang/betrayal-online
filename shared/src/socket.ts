import { Account } from "./account";
import { Game } from "./game";

export interface ServerToClientEvents { }
export interface ClientToServerEvents {
    "list-games": ListGames;
    "get-game": GetGame;
    "create-game": CreateGame;
    "join-game": JoinGame;
}
export interface InterServerEvents { }
export interface SocketData { account: Account }

export type SocketEventFn<Request, Response> = (request: Request, respond: (response: Response) => void) => void;

// List Games
export interface ListGamesResponse { games: Array<Game>; }
export type ListGames = SocketEventFn<any, ListGamesResponse>;

// Get Game
export interface GetGameRequest { gameId: string; }
export interface GetGameResponse { game: Game | null; }
export type GetGame = SocketEventFn<GetGameRequest, GetGameResponse>;

// Create Game
export interface CreateGameRequest { name: string; password?: string; }
export type CreateGame = SocketEventFn<CreateGameRequest, Game>;

// Join Game
export interface JoinGameRequest { gameId: string; }
export type JoinGame = SocketEventFn<JoinGameRequest, any>;
