import axios from "axios"
import fs from "fs"
import {green, red, magenta} from "console-log-colors"

export default class ZODNSql {
    constructor() {
        this.url = ""
        this.database = {}
    }

   /**
    * Set connection to database
    * @param {string} database Link to the json
    * @return {{}}
    */
    async connect(database) {
        const data = await this.loadFile(database)
        this.database = data
        this.url = database

        return new Promise((resolve, reject) => {
            if(this.database && this.url) {
                console.info(green("Database connected."))
                resolve(true)
            } else {
                reject(red("Cannot find your database."))
            }
        })
    }

    /**
    * Disconnect database
    * @return {boolean}
    */
    async disconnect() {
        return new Promise((resolve, reject) => {
            if(this.database) {
                this.database = {}
                console.info(green("Database disconnected."))
                resolve(true)
            } else {
                reject(red("Database is not set."))
            }
        })
    }

    /**
    * Get an information
    * @param {string} player_id The player id
    * @param {string ?} column The category Player etc...
    * @param {string ?} atomic_value The target in category Player.firstname etc...
    * @return {Promise<any>}
    */
    async fetch(player_id, column, atomic_value) {
        return new Promise((resolve, reject) => {
            try {
                if(Object.keys(this.database).length > 0) {
                    column ? 
                        atomic_value ? resolve(this.database[player_id][column][atomic_value]) :
                            resolve(this.database[player_id][column])
                        : resolve(this.database[player_id])
                } else {
                    reject(red("Data not found."))
                }
            } catch(err) {
                console.error(err)
            }
        })
    }

    /**
     * Update a specify atomic value
     * @param {string} player_id 
     * @param {string} column 
     * @param {string} atomic_value 
     * @param {any} value
     * @return {Promise<boolean>}
     */
    async updateValue(player_id, column, atomic_value, value) {
        if(this.database && this.url) {
            const file = {...this.database}
            file[player_id][column][atomic_value] = value
            this.database = file

            await fs.writeFile(this.url, JSON.stringify(file), (err) => {
                if(err) {
                    return new Promise((resolve, reject) => {
                        reject(red("Failed to write on the db file."))
                    })
                }
            })

            return new Promise((resolve, reject) => {
                resolve(true)
            })
        }
    }

    /**
     * Add somes customs plugins in db
     * @param {{plugins:{}}} plugins The plugins list
     * @return {Promise<boolean>}
     */
    async addPlugins(plugins) {
        if(this.database && this.url.length > 0) {
            const file = {...this.database}
            
            for(let p in file) {
                for(let e in plugins) {
                    if(!file[p][e]) {
                        file[p][e] = plugins[e]
                    } 
                }
            }

            await fs.writeFile(this.url, JSON.stringify(file), (err) => {
                if(err) {
                    return new Promise((resolve, reject) => { 
                        reject(red("Failed to load ur script"))
                    })
                }
            })

            for(let e in plugins) {
                console.info(green(`${e} started.`))
            }

            return new Promise((resolve, reject) => {
                this.database = file
                resolve(true)
            })
        }
    }

    /**
     * Add new player (Player up-value is required)
     * @param {{indentifier: string, creation: string, firstname: string, 
     *          lastname: string, lastPos: {x: number, y: number, z: number}, clothes: {},
     *          accounts: {money: number, bank: number, black_money: number
     *          vehicles: []}?}} data The specifics datas for the creation.
     * @param {string} template The url of the template users
     * @param {{}?} plugins If you have some plugins
     * @return {Promise<boolean>}
     */
    async addPlayer(data, template, plugins) {
        const templateData = await this.loadFile(template)
        const file = {...this.database}

        if(data) {
            const { creation, firstname, lastname, lastPos, 
                clothes, accounts, vehicles } = data

            templateData.Player.creation = creation
            templateData.Player.firstname = firstname
            templateData.Player.lastname = lastname
            templateData.Player.lastPos = lastPos
            templateData.Player.clothes = clothes
            templateData.Player.accounts = accounts
            templateData.Player.vehicles = vehicles
        }

        file[data.identifier] = templateData

        if(plugins) {
            await this.addPlugins(plugins)
        }

        await fs.writeFile(this.url, JSON.stringify(file), (err) => {
            if(err) {
                return new Promise((resolve, reject) => {
                    reject("Failed to add new player")
                })
            }
        })

        this.database = file

        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    /**
     * Load file from anywhere
     * @param {string} source The dist/local file path.
     * @return {{}}
     */
    async loadFile(source) {
        if (source.startsWith('http://') || source.startsWith('https://')) {
            const response = await axios.get(source);
            return new Promise((resolve, reject) => {
                resolve(response.data)
            })
        } else {
            const data = await fs.promises.readFile(source, 'utf-8');
            return new Promise((resolve, reject) => {
                resolve(JSON.parse(data))
            });
        }
    }
}