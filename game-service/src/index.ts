import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer} from "socket.io";

import cors from "cors";
import { initializeSocket } from "./socket.js";
import { createLogger } from "./utilities/logger.js";
import { routes } from "./router/routes.js";
import { initializeRedis } from "./utilities/redis-connection.js";
import { checkDatabaseConnection, createTables } from "./utilities/db-connection.js";
import { connect } from "./utilities/amqp.js";

const port = process.env.PORT || 4200;

const logger = createLogger('Server');

const startServer = async() => {
    try {
        await Promise.all([checkDatabaseConnection(), initializeRedis(), connect(), createTables()]);
    //     await checkDatabaseConnection(); await createTables(); await initializeRedis(); await connect();
        
        const app = express();
        const server = createServer(app);
        const io = new SocketIOServer(server);
        
        app.use(cors());
        
        app.use(express.json());
        
        initializeSocket(io);
        app.use(routes);
        
        server.listen(port, () => {
            logger.info(`Server running at port: ${port}`);
        });
    } catch (err: any) {
        logger.error(`Server failed to start: ${err.message}`);
        process.exit(1);
    }
};


startServer();