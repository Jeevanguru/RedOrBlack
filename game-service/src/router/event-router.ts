import { Server } from "socket.io";
import { initRounds } from "../module/lobbies/lobby-event.js";

export const eventRouter = async (io: Server): Promise<void> => {
    console.log("Initializing rounds");
    initRounds(io);
};