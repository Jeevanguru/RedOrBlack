import { Server } from "socket.io";
import { createLogger } from "../../utilities/logger.js";
import { getRandomCard } from "../game/games.js";
import { setCurrentLobby, settleBet } from "../bets/bets-session.js";
import { insertLobbies } from "./lobbies-db.js";
import { setCache } from "../../utilities/redis-connection.js";

const logger = createLogger('lobbies', 'jsonl');
//in memory cache
export let matchHistoryCache: any[] = []; 

const MAX_HISTORY_LIMIT = 3;

export const initRounds = async (io: Server): Promise<void> => {
    logger.info("lobby started");
    await initLobby(io);
};

const sleep = (ms: number) :Promise<void> =>{
    return  new Promise((resolve) => setTimeout(resolve, ms));
}

const initLobby = async (io: Server) :Promise<void> => {

    // const lobbyId = Date.now();
    const lobbyId = 1765798642937;

    await setCache('Current_Lobby', String(lobbyId), 30);

    const recurLobbyData: { lobbyId: number; status: number } = {
        lobbyId,
        status: 0,
    };
    
    setCurrentLobby(recurLobbyData);
    
    const start_timer = 10;
    const end_timer = 6;
    // Starting phase
    for (let x = start_timer; x >= 0 ;x--) {
        io.emit('lobby', `${lobbyId}:${x}:STARTING`);
        await sleep(1000);
    }
    
    recurLobbyData.status = 1;
    setCurrentLobby(recurLobbyData);
    
    // Calculating phase
    for (let w = 5; w >= 0 ;w--) {
        io.emit('lobby', `${lobbyId}:${w}:CALCULATING`);
        await sleep(1000);
    }
    
    recurLobbyData.status = 2;
    setCurrentLobby(recurLobbyData);
    
    // Winning Card and color
    const result = getRandomCard();
    const winningColor = result.color;
    
    // Emit Result 
    for (let y = 8; y >= 0 ;y--) {
        io.emit('lobby', `${lobbyId}:${y}:${JSON.stringify(winningColor)}:Result`);
        await sleep(1000);
    }
    
    // settlebet for every rounds result
    // console.log("Settling bet for every round if bet is placed");
    await settleBet(io, winningColor, lobbyId);

    recurLobbyData.status = 3;
    setCurrentLobby(recurLobbyData);
    
    // Ending phase
    for (let z = end_timer; z >= 0 ;z--) {
        io.emit('lobby', `${lobbyId}:${z}:ENDED`);
        await sleep(1000);
    }
    const history = {
        lobbyId,
        start_timer,
        end_timer,
        winningColor
    };

    const matchHistoryEntry = {
        lobbyId,
        winningColor,
        time: new Date()
    };

    matchHistoryCache.unshift(matchHistoryEntry); 
    while (matchHistoryCache.length > MAX_HISTORY_LIMIT) {
        matchHistoryCache.pop();
    }

    io.emit('historyData', matchHistoryCache);

    logger.info(JSON.stringify(history));

    await insertLobbies(history);

    return initLobby(io);
}