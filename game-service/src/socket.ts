import { Server, Socket } from "socket.io";
import { getUserDataFromSource } from "./players/player-details.js";
import { deleteCache, getCache, setCache } from "./utilities/redis-connection.js";
import { messageRouter } from "./router/message-router.js";
import { eventRouter } from "./router/event-router.js";
import { getMatchHistory } from "./module/bets/bets-session.js";

export const initializeSocket = async (io: Server) => {
    
    // takes i o server instace as args
    await eventRouter(io);

    io.on("connection", async (socket: Socket) => {

        const { token, game_id } = socket.handshake.query as { token?: string; game_id?: string };
        
        // reference
        console.log("Token , game_id", token, game_id);

        if ( !token || !game_id) {
            socket.disconnect(true);
            console.log("Mandatory params are missing ", token);
            return;
        }

        const userData = await getUserDataFromSource(token, game_id);

        if (!userData) {
            console.log('Invalid token ', token);
            socket.disconnect(true);
            return;
        }

        const oldSocketId = await getCache(userData.id);
        if (oldSocketId) {
            const oldSocket = io.sockets.sockets.get(oldSocketId);
            if (oldSocket) {
                oldSocket.emit('message', {
                    eventName: 'betError',
                    data: { message: 'User connected from another source' },
                });
                oldSocket.disconnect(true);
            }
        };
        
        socket.emit('info', 
            {
                user_id: userData.user_id,
                operator_id: userData.operatorId,
                balance: userData.balance,
            },
        );

        await setCache(userData.id, socket.id);

        await setCache(`PL:${socket.id}`, JSON.stringify({ ...userData, socket_id: socket.id}), 3600);

        await getMatchHistory(socket, userData.user_id, userData.operatorId, userData.id);

        messageRouter(io, socket);

        socket.on('disconnect', async () => {
            console.log("User disconnected: ", socket.id);
            await deleteCache(`PL:${socket.id}`)
            await deleteCache('oldSocketId');
        });

        socket.on('error', (error: Error) => {
            console.error(`Socket error: ${socket.id}. Error: ${error.message}`);
        });


    });
};