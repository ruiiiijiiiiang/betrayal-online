import { type Server, Socket } from "socket.io";
import { DateTime } from "luxon";
import { GameStatus, ListGames, CreateGame, JoinGame, Game } from "@betrayal/shared";
import { GameModel } from "./models";

export default (io: Server, socket: Socket) => {
    const listGames: ListGames = async (_, cb) => {
        const mgames = await GameModel.find().select('-password');
        const games: Array<Game> = mgames.map(mgame => ({
            ...mgame.toObject(),
            id: mgame._id as string,
            isPasswordProtected: !!mgame.password
        }));
        cb({ games });
    }

    const createGame: CreateGame = async (data, cb) => {
        const players = {
            [socket.data.account.sub]: {
                isReady: false
            }
        }
        const playersOrder = [socket.data.account.sub];
        const state = {}
        const createdAt = DateTime.now();

        const game = new GameModel({
            password: data.password,
            status: GameStatus.WAITING,
            players,
            playersOrder,
            state,
            createdAt,
        });
        const createdGame = await game.save()

        const response: Game = {
            id: createdGame._id as string,
            isPasswordProtected: createdGame.password !== undefined,
            status: createdGame.status,
            players,
            playersOrder,
            state,
            createdAt,
        }
        cb(response);
    }

    const joinGame: JoinGame = (data, cb) => {
        const { gameId } = data;
        const response = {
            gameId,
            status: GameStatus.WAITING
        };
        cb(response);
    }

    socket.on("list-games", listGames);
    socket.on("create-game", createGame);
    socket.on("join-game", joinGame);
}