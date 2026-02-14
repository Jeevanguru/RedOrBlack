// Logger related
export interface LogEntry {
    time: number;
    level: LogLevel;
    name: string;
    msg: string;
} 

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// User details from token/source
export interface FinalUserData {
    id: string;
    user_id: string;
    operatorId: string;
    balance: string;
    game_id?: string;
    token?: string;
}

// Card & Suit
export interface Suit {
    name: string;
    color: 'red' | 'black';
}

export interface Card {
    rank: string;
    suit: string;
    color: 'red' | 'black';
}

// App config
export interface AppConfig {
    minBetAmount: number;
    maxBetAmount: number;
    maxCashoutAmount: number;
    dbConfig: DBConfig;
    redis: RedisConfig;
}

interface DBConfig {
    host: string;
    user: string;
    database: string;
    password: string;
    port: string;
    retries: string;
    interval: string;
}

interface RedisConfig {
    url: string;
    retry: number;
    interval: number;
}

// Lobby info
export interface LobbiesData {
    lobbyId: number;
    status: number;
}

// Lobby insert data
export interface LobbyData {
    lobbyId: number;
    start_timer: number;
    end_timer: number;
    winningColor: string;
    time?: Date;
}

// Settlement info (DB & emit)
export interface Settlement {
    bet_id: string;
    bet_amount: number;
    win_amount: number;
    winning_color: string;
    result: BetStatus;
    user_id: string;
    operator_id: string;
    lobby_id: number;
}

// Bet info for DB insert
export interface BetData {
    bet_id: string;
    amount: number;
    userBets: BetType; 
}

// Bet type (amount + chip choice)
export interface BetType {
    chip: number;  // 1 -> red, 2 -> black
    amount: number;
}

// Bet object stored in memory for current bet
export interface BetObject {
    id: string;
    bet_id: string;
    token: string;
    socket_id: string;
    game_id: string;
    bet_amount?: number;
    userBets?: BetType;
    lobbyId: number;
    txnid?: string;
    ip?: string;
}

// Player details for webhook calls
export interface PlayerDetails {
    game_id: string;
    operatorId: string;
    token: string;
}

// Bets for webhook / upstream
export interface BetsData {
    id?: number;
    bet_amount?: number | string;
    winning_amount?: number | string;
    game_id?: string;
    user_id: string;
    bet_id?: string;
    txn_id?: string;
    txn_ref_id?: string;
    ip?: string;
}

// Webhook keys
export type WebhookKey = 'CREDIT' | 'DEBIT';

// Webhook result
export interface AccountsResult {
    txn_id?: string;
    status: boolean;
    type: WebhookKey;
}

// Webhook request data
export interface WebhookData {
    txn_id: string;
    ip?: string;
    game_id?: string;
    user_id: string;
    amount?: number | string;
    description?: string;
    bet_id?: string;
    txn_type?: number;
    txn_ref_id?: string;
}

// Incoming bet from frontend
export interface IncomingBetData {
    lobby_id: string;
    chip: number;      
    amount: number;    
}

export type BetStatus = "Win" | "Loss";

export interface ProcessedBetResult {
    chip: number;
    betAmount: number;
    isWin: boolean;
    multiplier: number;
    winAmount: number;
    bet_status: BetStatus;

}
