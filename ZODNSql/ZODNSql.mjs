import axios from "axios"
import fs from "fs"
import {green, red, magenta} from "console-log-colors"

export default class ZODNSql {
    constructor() {
        this.url = ""
        this.database = {}
    }

   /**
    * Set connection to the json
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
    * Disconnected
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
     * 
     * @param {string} player_id 
     * @param {string} column 
     * @param {string} atomic_value 
     * @param {any} value
     * @return {Promise<boolean>}
     */
    async updateValue(player_id, column, atomic_value, value) {
        if(this.database && this.url) {
            const file = await this.loadFile(this.url)
            file[player_id][column][atomic_value] = value

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
     * @param {{plugins:{}}} plugins The plugins list
     * @return {Promise<boolean>}
     */
    async addPlugins(plugins) {
        if(this.database && this.url.length > 0) {
            const file = await this.loadFile(this.url)
            
            for(let p in file) {
                for(let e in plugins) {
                    if(!file[p][e]) {
                        file[p][e] = plugins[e]
                        console.log(JSON.stringify(file))

                        await fs.writeFile(this.url, JSON.stringify(file), (err) => {
                            if(err) {
                                return new Promise((resolve, reject) => { 
                                    reject(red("Failed to load ur script"))
                                })
                            }
                        })
                    }
                }
            }

            for(let e in plugins) {
                console.info(green(`${e} started.`))
            }

            return new Promise((resolve, reject) => {
                resolve(true)
            })
        }
    }

    /**
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