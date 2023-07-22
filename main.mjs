import ZODNSql from "./ZODNSql/ZODNSql.mjs"
import express from "express"
import cors from "cors"
import { magenta } from "console-log-colors"

const PATHS = {
    DB: "/Users/bilal/Desktop/ZNSql/ZODNSql/database/players.json",
    PLAYER_DATA: "/Users/bilal/Desktop/ZNSql/ZODNSql/database/schemas/player_data.json",
    PLUGINS: "/USERS/bilal/Desktop/ZNSql/ZODNSql/database/plugins.json",
}

const ZSQL = new ZODNSql()
ZSQL.connect(PATHS.DB, PATHS.PLUGINS)

const PORT = 3001
const app = express()

app.use(cors())
app.use(express.json());
app.listen(PORT, () => {
    console.log(magenta(
        `?----------------------------------------?\n` +
        `| Welcome in the new world, ZODNSql !    |\n` +
        `| Owner: General Zod (bilaaaaaaal)       |\n` +
        `| Discord: https://discord.gg/xpCc6XmUaX |\n` +
        `| Listen on localhost:${PORT}               |\n` +
        `?----------------------------------------?`
    ))
})

app.post("/getUserData", async (req, res) => {
    const {playerId, column, value} = req.body
    const data = await ZSQL.fetch(playerId, column, value)
    res.json(data)
})

app.post("/getUserDatas", async (req, res) => {
    const {playerId} = req.body
    const data = await ZSQL.fetch(playerId)
    res.json(data)
})

app.post("/updateUserData", async (req, res) => {
    const {playerId, column, atomic_value, value} = req.body
    const data = await ZSQL.updateValue(playerId, column, atomic_value, value)
    !data ? res.json(false) : res.json(true)
})

app.post("/addPlugins", async (req, res) => {
    const {plugins} = req.body
    const data = await ZSQL.addPlugins(plugins)
    !data ? res.json(false) : res.json(true)
})

app.post("/addPlayer", async (req, res) => {
    const {infos} = req.body
    const data = await ZSQL.addPlayer(infos, PATHS.PLAYER_DATA, PATHS.PLUGINS)
    !data ? res.json(false) : res.json(true)
})