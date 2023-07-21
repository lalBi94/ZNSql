import ZODNSql from "./ZODNSql/ZODNSql.mjs"
import express from "express"
import cors from "cors"
import { magenta } from "console-log-colors"

const ZSQL = new ZODNSql()
ZSQL.connect("/Users/bilal/Desktop/ZNSql/tests/db_exemple.json")

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