const dotenv = require('dotenv')
dotenv.config()

const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_ID = process.env.APP_ID;
const DEV_SERVER_ID = process.env.DEV_SERVER_ID;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const MAX_CMD_ARGUMENT_LIST_LENGTH = Number(process.env.MAX_CMD_ARGUMENT_LIST_LENGTH)

exports.env =  {
    BOT_TOKEN, APP_ID, DB_USER, DB_PASS, DEV_SERVER_ID, MAX_CMD_ARGUMENT_LIST_LENGTH
}