-- To run this script, use:
--   mysql -u root -p < db/schema.sql

DROP DATABASE IF EXISTS tictactoe;
DROP USER IF EXISTS 'tictactoe_user'@'localhost';

CREATE DATABASE tictactoe;
CREATE USER 'tictactoe_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON tictactoe.* TO 'tictactoe_user'@'localhost';
FLUSH PRIVILEGES;

USE tictactoe;

CREATE TABLE IF NOT EXISTS Games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player1 VARCHAR(64) NOT NULL,
  player2 VARCHAR(64),
  state TEXT NOT NULL
); 