import { createLogger } from "./logger.js";

const failedBetLogger = createLogger('failedBets', 'jsonl');

export const logEventAndEmitResponse = (
    req: any,
    res: any,
    event: string,
    socket: any
) => {
    if (event === 'BT') {
        failedBetLogger.error(JSON.stringify({ req, res }));
    }
    socket.emit('betError', res);
    return;
};

