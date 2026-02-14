import { BetData, Settlement } from '../../interfaces/index.js';
import { write } from '../../utilities/db-connection.js';


export const addSettleBet = async (settlements: Settlement[]): Promise<void> => {
  try {
    console.log("Adding settlement ");
    if (settlements.length > 0) {
      
      
      const finalData: any[] = [];
      
      for (const settlement of settlements) {
        const { bet_id, bet_amount, winning_color , win_amount, result } = settlement;
        // array and extracting values using array destructuring
        const [initial, lobby_id, user_id, operator_id] = bet_id.split(':');
        

        finalData.push([
          bet_id,
          lobby_id,
          decodeURIComponent(user_id),
          operator_id,
          winning_color,
          Number(bet_amount).toFixed(2),
          result,
          win_amount
        ]);
      }
      
      const placeholders = finalData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
      const SQL_SETTLEMENT = `INSERT INTO settlements (bet_id, lobby_id, user_id, operator_id, winning_color, bet_amount,result, win_amount) VALUES ${placeholders}`;
      const flattenedData = finalData.flat();
      
      await write(SQL_SETTLEMENT, flattenedData);
      console.info('Settlement Data Inserted Successfully');
    } else {
      console.info('No Settlement data for insertion');
    }
  } catch (err) {
    console.error(err);
  }
};

const SQL_INSERT_BETS = 'INSERT INTO bets (bet_id, lobby_id, user_id, operator_id, bet_amount, userBets) VALUES(?,?,?,?,?,?)';

export const insertBets = async (data: BetData): Promise<void> => {
  try {
    console.log("Insert betss");
    const { bet_id, amount, userBets } = data;
    const [initial, lobby_id, user_id, operatorId] = bet_id.split(':');
    await write(SQL_INSERT_BETS, [
      bet_id,
      lobby_id,
      decodeURIComponent(user_id),
      operatorId,
      Number(amount).toFixed(2),
      JSON.stringify(userBets)
    ]);
    console.info(`Bet placed successfully for user`, user_id);
  } catch (err) {
    console.error(err);
  }
};