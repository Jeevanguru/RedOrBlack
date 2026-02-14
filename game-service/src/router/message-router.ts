import { Server, Socket } from "socket.io";
import { createLogger } from "../utilities/logger.js";
import { IncomingBetData } from "../interfaces/index.js";
import { placeBet } from "../module/bets/bets-session.js";
import { getCache } from "../utilities/redis-connection.js";
import { logEventAndEmitResponse } from "../utilities/helper-function.js";

const logger = createLogger('Event');

export const messageRouter = (io :Server, socket: Socket): void => {
    socket.on('message', async (payload: string) => {
        try {
            //                                  1 -> red    2 -> black
            // * Example payload: BT:1765798642937:1:25  
            //   or  2-50
            const [event, lobby_id, chipstr, amountstr, extra] = payload.split(":");
            const chip = Number(chipstr);
            const amount = Number(amountstr);

            if (extra) {
                socket.emit("betError", 'Invalid Bet type');
                return;
                // return logEventAndEmitResponse("", {}, "Invalid bet type", "bet");
            } else {
                const currentLobbyId = await getCache('Current_Lobby');
                if (!currentLobbyId) {
                    socket.emit("betError", { message: "No active round" });
                    return;
                }
                
                if (lobby_id !== currentLobbyId) {
                    socket.emit('message', { message: 'Invalid or expired lobby'});
                    return;
                }
                
                logger.info(`Received event=${event}, socket=${socket.id}, payload:${payload}`);
                
                if (!event || !lobby_id || !chip || !amount) {
                    logger.warn(`Invalid payload format: ${payload}`);
                    return;
                }
                
                if (event === 'BT') {
                    const betData : IncomingBetData = {
                        lobby_id,
                        chip,
                        amount
                    };
                    await placeBet(socket, betData);
                }
            }
        } catch (err :any) {
            logger.error(`Message Handler error: ${err}`);
        }
    })
}