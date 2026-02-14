import { Server, Socket } from "socket.io";
import { BetObject, BetStatus, BetType, IncomingBetData, LobbiesData, ProcessedBetResult, Settlement } from "../../interfaces/index.js";
import { createLogger } from "../../utilities/logger.js";
import { getCache, setCache } from "../../utilities/redis-connection.js";
import { addSettleBet, insertBets } from "./bets-db.js";
import { logEventAndEmitResponse } from "../../utilities/helper-function.js";
import { appConfig } from "../../utilities/app-config.js";
import { updateBalanceFromAccount } from "../../utilities/common-function.js";
import { read } from "../../utilities/db-connection.js";

let lobbyData: LobbiesData = { lobbyId: 0, status: 0};

const logger = createLogger('Bets', 'jsonl');
const settleBetLogger = createLogger('Settlement', 'jsonl');

// let currentBet: BetObject | null = null;
let roundBets: BetObject[] = [];

export const setCurrentLobby = (data: LobbiesData ) => {
    lobbyData = data;
};

export const settleBet = async (
    io: Server,
    winningColor: string,
    lobbyId: number
): Promise<void> => {

    const logContext = {
        event: "SETTLE_BET",
        lobbyId,
        winningColor
    };
    
    try {

    // if (!currentBet) { settleBetLogger.info(logContext, "No bet to settle"); return;}
    if (roundBets.length === 0) {
            settleBetLogger.info(logContext ,"No bets to settle");
            return;
        }
    
    settleBetLogger.info(
        { ...logContext,totalBets: roundBets.length },
        "Settlement Started");
        
        const winningNumber = winningColor === "red" ? 1 : 2;
        
        const settlements: Settlement[] = [];
        
        for (const eachBet of roundBets ) {
            
            const {
                bet_id,
                socket_id,
                game_id,
                txnid,
                userBets,
                ip,
                token
            } = eachBet;
            
            if (!userBets) {
                settleBetLogger.warn(logContext, "User bets missing");
                continue;
            }
            
            const [, , user_id, operator_id] = bet_id.split(":");
            
            // win process
            const MULTIPLIER = 1.98;
            const isWin = userBets.chip === winningNumber;
            const bet_status: BetStatus = (isWin) ? "Win" : "Loss";  
            
            const processedResult = {
                chip: userBets.chip,
                betAmount: userBets.amount,
                isWin,
                multiplier: isWin ? MULTIPLIER : 0,
                bet_status, //isWin ? "Win" : "Loss",
                winAmount: isWin
                ? Number((userBets.amount * MULTIPLIER).toFixed(2))
                : 0.00
            };
            
            settlements.push({
                bet_id,
                bet_amount: processedResult.betAmount,
                win_amount: processedResult.winAmount,
                winning_color: winningColor,
                result: processedResult.bet_status,
                user_id,
                operator_id,
                lobby_id: lobbyId
            });
    
            settleBetLogger.info(
                {
                    ...logContext,
                    bet_id,
                    user_id,
                    processedResult
                },
                "Bet evaluated"
            );

            // credit
            if (processedResult.isWin) {

                const winAmount = processedResult.winAmount.toFixed(2);
                
                settleBetLogger.info(
                    { ...logContext, bet_id, user_id, winAmount },
                    "Crediting winning amount"
                );
                
                const creditResp = await updateBalanceFromAccount(
                    {
                        user_id,
                        winning_amount: winAmount,
                        id: lobbyId,
                        txn_ref_id: txnid,
                        game_id,
                        ip
                    },
                    "CREDIT",
                    { game_id, operatorId: operator_id, token }
                );
                
                if (!creditResp?.status) {
                    settleBetLogger.error(
                        { ...logContext, bet_id, user_id, creditResp },
                        "Credit failed from upstream"
                    );
                }
                
                const cached = await getCache(`PL:${socket_id}`);
                
                if (cached) {
                    const parsed = JSON.parse(cached);
                    parsed.balance = (
                        Number(parsed.balance) + processedResult.winAmount
                    ).toFixed(2);
                    
                    await setCache(`PL:${socket_id}`, JSON.stringify(parsed));
                    
                    io.to(socket_id).emit("info", {
                        user_id,
                        operator_id,
                        balance: parsed.balance
                    });
                }
                
                io.to(socket_id).emit("settlement", {
                    status: "WIN",
                    message: `You Win ${winAmount}`,
                    mywinningAmount: winAmount,
                    roundResult: winningColor,
                    betResult: processedResult,
                    lobby_id: lobbyId
                });
                
                settleBetLogger.info(
                    { ...logContext, bet_id, user_id, winAmount },
                    "Win settlement completed"
                );
                
            } 
            else {
                io.to(socket_id).emit("settlement", {
                    status: "LOSS",
                    message: `You lost ${processedResult.betAmount}`,
                    lossAmount: processedResult.betAmount,
                    roundResult: winningNumber,
                    betResult: processedResult,
                    lobby_id: lobbyId
                });
                
                settleBetLogger.info(
                {
                    ...logContext,
                    bet_id,
                    user_id,
                    lossAmount: processedResult.betAmount
                },
                "Loss settlement completed"
                );
            }
            
    //  await addSettleBet([{
        //     bet_id,
        //     lobby_id: lobbyId,
        //     user_id,
        //     operator_id,
        //     winning_color: winningColor,
        //     bet_amount: processedResult.betAmount,
        //     win_amount: processedResult.winAmount,
        //     result: processedResult.bet_status
        // }]);
    }  
        
        await addSettleBet(settlements);
        
        settleBetLogger.info(
            // { ...logContext, settlementsCount: settlements.length },
            'Settlement saved successfully'
        );
        roundBets.length = 0;
        // currentBet = null; 
    } 
    catch (error :any) {
        settleBetLogger.error(
            { ...logContext, error },
            'Error settling Bets'
        );
    }
};

// let txnid: string| undefined;

export const placeBet = async (socket: Socket, betData: IncomingBetData) => {
    const logContext = {
        socketId: socket.id,
        event: 'PLACE_BET'
    };

    logger.info({ ...logContext, betData }, 'Place bet request received');

    const playerDetails = await getCache(`PL:${socket.id}`);
    if (!playerDetails) {
        logger.warn(logContext, 'Invalid player details');
        return socket.emit('betError', 'Invalid Player Details');
    }

    const parsedPlayerDetails = JSON.parse(playerDetails);
    const { id, user_id, operatorId, token, game_id, balance, socket_id } = parsedPlayerDetails;

    console.log(playerDetails, "player details in place bet");

    const lobbyId = Number(betData.lobby_id);

    if (lobbyData.status !== 1) {
        logger.warn({ ...logContext, user_id, lobbyId }, 'Betting Closed');
        return socket.emit("betError", 'Betting Closed');
    }

    console.log("operator_id", operatorId);

    const bet_id = `BT:${lobbyId}:${user_id}:${operatorId}`;

    // const betExists = currentBet && (currentBet.bet_id === bet_id || currentBet.token === token);

    const betExists = roundBets.find(
        b => b.bet_id === bet_id || b.token === token
    );

    if (betExists) {
        logger.warn(
            { ...logContext, bet_id, user_id },
            'Duplicate bet attempt'
        );
        return logEventAndEmitResponse(socket, {}, "Bet Already Placed", "bet");
    }

    const betObj: BetObject = {
        id, 
        bet_id, 
        token, 
        socket_id: socket_id,
        game_id,
        lobbyId: lobbyId
    };

    
    const chip = Number(betData.chip);
    const amount = Number(betData.amount);
    
    // changed to object
    const userBets: BetType = {
        chip, amount  
    };
    
    console.log(userBets , "user bets ")

    if (chip < 1 || chip > 2 || isNaN(amount) || amount <= 0 || amount > appConfig.maxBetAmount) {
        logger.error({ ...logContext, bet_id, chip, amount }, 'Invalid bet data');
        socket.emit("betError", 'Invalid Bet');
        return logEventAndEmitResponse(socket, betObj, "Invalid Bet", "bet");
    }

    if (amount > Number(balance)) {
        logger.warn({ ...logContext, bet_id, balance, amount }, 'Insufficient balance');
        socket.emit("betError", "Insufficient balance");
        return logEventAndEmitResponse(socket, betObj, "Insufficient Balance", "bet");
    }
    
        const ip = getUserIP(socket);

        Object.assign(betObj, {
            bet_amount: amount,
            userBets,
            ip
        });

        logger.info(
        { ...logContext, bet_id, amount },
        'Debiting user balance'
        );

         const webhookData = await updateBalanceFromAccount(
        {
            id: lobbyId,
            bet_amount: amount,
            game_id,
            bet_id,
            ip,
            user_id
        },
        "DEBIT",
        { game_id, operatorId, token }
    );

    if (!webhookData.status) {
        logger.error(
            { ...logContext, bet_id, webhookData },
            'Upstream debit failed'
        );
        return socket.emit("betError", "Bet Cancelled By Upstream Server");
    }

    if (webhookData.txn_id) {
        betObj.txnid = webhookData.txn_id;
    }

    // currentBet = betObj;
    roundBets.push(betObj);

    await insertBets({
        amount,
        bet_id,
        userBets
    });

    parsedPlayerDetails.balance = Number(balance - amount).toFixed(2);

    await setCache(`PL:${socket.id}`, JSON.stringify(parsedPlayerDetails));

    logger.info(
        {
            ...logContext,
            bet_id,
            user_id,
            balance: parsedPlayerDetails.balance
        },
        'Bet placed successfully'
    );

    socket.emit("info", {
        user_id,
        operator_id: operatorId,
        balance: parsedPlayerDetails.balance
    });

    return socket.emit("bet", { message: "Bet Placed Successfully" });

};

export const getUserIP = (socket: any): string => {
    const forwardedFor = socket.handshake.headers?.['x-forwarded-for'];

    if (forwardedFor) {
        const ip = forwardedFor.split(',')[0].trim();
        if (ip) return ip;
    }
    return socket.handshake.address || '';
};



export const getMatchHistory = async (socket: Socket, userId: string, operator_id: string, id: string) => {
    try {
        const decodedUserId = decodeURIComponent(userId);

        const getLastWin = await read(
            `SELECT win_amount FROM settlements WHERE user_id = ? and operator_id = ? ORDER BY created_at DESC LIMIT 1`, 
            [decodedUserId, operator_id]
        );
        
        socket.emit('lastWin', { 
            myWinningAmount: (getLastWin && getLastWin.length > 0) ? getLastWin[0].win_amount : '0.00' 
        });

        // Re-assign socket id for active bets
        roundBets.forEach((bet: BetObject) => {
            if (bet.id == id) bet.socket_id = socket.id;
        });
        return;
    } catch (err) {
        console.error(`Error in getMatchHistory:`, err);

    }
}
