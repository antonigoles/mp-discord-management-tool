const dotenv = require("dotenv");
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_ID = process.env.APP_ID;
const DEV_SERVER_ID = process.env.DEV_SERVER_ID;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

exports.env = {
  BOT_TOKEN,
  APP_ID,
  DEV_SERVER_ID,
  DB_CONNECTION_STRING,
};
