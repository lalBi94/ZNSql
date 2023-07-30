import ZODNSql from "./ZODNSql/ZODNSql.mjs"
import express from "express"
import cors from "cors"
import { magenta } from "console-log-colors"

const PATHS = {
    DB: "C:/Users/tipha/OneDrive/Bureau/BilouWorks/ZODNSql/ZODNSql/database/players.json",
    PLAYER_DATA: "C:/Users/tipha/OneDrive/Bureau/BilouWorks/ZODNSql/ZODNSql/database/schemas/player_data.json",
    VEHICLE_DATA: "C:/Users/tipha/OneDrive/Bureau/BilouWorks/ZODNSql/ZODNSql/database/schemas/vehicle_data.json",
    PLUGINS: "C:/Users/tipha/OneDrive/Bureau/BilouWorks/ZODNSql/ZODNSql/database/plugins.json",
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

/*****************
* GENERICS CALLS *
*****************/
app.post("/getUserData", async (req, res) => {
    const {playerId, column, value} = req.body
    const data = await ZSQL.fetch(playerId, column, value)
    res.json(data)
})

app.post("/addPlayer", async (req, res) => {
    const {infos} = req.body
    const data = await ZSQL.addPlayer(infos, PATHS.PLAYER_DATA, PATHS.PLUGINS)
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
    res.json(data)
})

app.post("/addPlugins", async (req, res) => {
    const {plugins} = req.body
    const data = await ZSQL.addPlugins(plugins)
    res.json(data)
})

/*****************
* VEHICLES CALLS *
******************/
app.post("/getVehiclesList", async (req, res) => {
    const {playerId} = req.body
    const data = await ZSQL.getVehiclesList(playerId)
    res.json(data)
})

app.post("/addVehicleToPlayer", async (req, res) => {
    const {playerId, name} = req.body
    const data = await ZSQL.addVehicleToPlayer(playerId, name, PATHS.VEHICLE_DATA)
    res.json(data)
})

app.post("/deleteVehicleToPlayer", async (req, res) => {
    const {playerId, plate} = req.body
    const data = await ZSQL.deleteVehicleToPlayer(playerId, plate)
    res.json(data)
})