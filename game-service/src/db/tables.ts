export const lobbies = `create table if not exists lobbies (
    id int primary key  auto_increment,
    lobby_id BIGINT NOT NULL,
    start_timer INT NOT NULL,
    end_timer INT NOT NULL,
    winning_color TEXT ,
    created_at datetime DEFAULT CURRENT_TIMESTAMP
 );`

export const bets = `CREATE TABLE IF NOT EXISTS bets (
   id int primary key  auto_increment,
   bet_id varchar(255) NOT NULL,
   lobby_id varchar(255) NOT NULL,
   user_id varchar(255) NOT NULL,
   operator_id varchar(255) DEFAULT NULL,
   bet_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
   userBets TEXT DEFAULT NULL,
   created_at datetime DEFAULT CURRENT_TIMESTAMP
 );`


export const settlement = `CREATE TABLE IF NOT EXISTS settlements (
   settlement_id int NOT NULL AUTO_INCREMENT,
   bet_id varchar(255) NOT NULL,
   lobby_id varchar(255) NOT NULL,
   user_id varchar(255) NOT NULL,
   operator_id varchar(255) DEFAULT NULL,
   winning_color TEXT,
   bet_amount decimal(10, 2) DEFAULT 0.00,
   result text not null,
   win_amount decimal(10, 2) DEFAULT 0.00,
   created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (settlement_id)
 );`
    