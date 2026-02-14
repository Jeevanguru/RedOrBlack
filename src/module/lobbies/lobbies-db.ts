import { LobbyData } from "../../interfaces/index.js";
import { write } from '../../utilities/db-connection.js'

const SQL_INSERT_LOBBIES = 'INSERT INTO lobbies(lobby_id, start_timer, end_timer, winning_color) values(?,?,?,?)';
export const insertLobbies = async (data: LobbyData): Promise<void> => {
    try {
        console.log("Inserting into lobbies ");
        // const { time, ...lobbyInfo } = data;
        await write(SQL_INSERT_LOBBIES, [
            data.lobbyId, data.start_timer, data.end_timer, data.winningColor
        ]);
        console.log("success");
    } catch (err :any) {
        console.error(err);
    }
};
