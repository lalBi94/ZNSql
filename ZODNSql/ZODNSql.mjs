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
    * @param {string} database_link Link to the json file contains players database
    * @param {string} plugins_link Link to the json file contains plugins
    * @return {Promise<boolean>}
    */
    async connect(database_link, plugins_link) {
        const data = await this.loadFile(database_link)
        this.database = data
        this.url = database_link

        if(this.database && this.url && plugins_link) {
            const plugins = await this.loadFile(plugins_link)
            await this.addPlugins(plugins)

            for(let e in plugins) {
                console.info(green(`${e} started.`))
            }
        }

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
    * @return {Promise<boolean>}
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

            return new Promise((resolve, reject) => {
                this.database = file
                resolve(true)
            })
        }
    }

    /**
     * Add new player (Player up-value is required)
     * @param {{indentifier: string, creation: string, firstname: string, 
     *          lastname: string}?}} data The specifics datas for the creation.
     * @param {string} template The url of the template users
     * @param {{}?} plugins_link If you have some plugins
     * @return {Promise<boolean>}
     */
    async addPlayer(data, template, plugins_link) {
        const templateData = await this.loadFile(template)
        const file = {...this.database}

        if(data) {
            const { creation, firstname, lastname } = data

            templateData.Player.creation = creation
            templateData.Player.firstname = firstname
            templateData.Player.lastname = lastname
        }

        file[data.identifier] = templateData

        await fs.writeFile(this.url, JSON.stringify(file), (err) => {
            if(err) {
                return new Promise((resolve, reject) => {
                    reject("Failed to add new player")
                })
            }
        })

        this.database = file

        if(plugins_link) {
            const plugins = await this.loadFile(plugins_link)
            await this.addPlugins(plugins)
        }

        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    /**
     * Get the vehicles list
     * @param {{string}} player_id 
     * @return {Promise<[]>}
     */
    async getVehiclesList(player_id) {
        return new Promise((resolve, reject) => {
            if(!this.database[player_id]) {
                reject(red(`Player ${player_id} doesn't exist.`))
            } else {
                resolve(this.database[player_id]["Vehicles"])
            }
        })
    }

    async deleteVehicleToPlayer(player_id, plate) {
        if(!this.database[player_id]) {
            return new Promise((resolve, reject) => {
                reject(red(`Player ${player_id} doesnt exist`))
            })
        }

        if(this.database[player_id]["Vehicles"].length === 0) {
            return new Promise((resolve, reject) => {
                reject(red(`Player ${player_id} doesnt have vehicles`))
            })
        }

        const file = {...this.database}
        let vehicles = this.database[player_id]["Vehicles"]
        
        for (let i = vehicles.length - 1; i >= 0; i--) {
          if (vehicles[i].plate === plate) {
            vehicles.splice(i, 1)

            file[player_id]["Vehicles"] = vehicles
            
            await fs.writeFile(this.url, JSON.stringify(file), (err) => {
                if(err) {
                    return new Promise((resolve, reject) => {
                        reject(red(`Failed to suppress ${vehicles[i].name}`))
                    })
                }
            })

            this.database = file
            
            return new Promise((resolve, reject) => {
                resolve(true)
            })
          }
        }
    }

    /**
     * Adding a new vehicle to a player
     * @param {string} player_id The player indentifier
     * @param {string} vehicle_name The vehicle name
     * @param {string} vehicle_link The vehicle template link
     * @return {Promise<boolean}
     */
    async addVehicleToPlayer(player_id, vehicle_name, vehicle_link) {
        if(!this.database[player_id]) {
            return new Promise((resolve, reject) => {
                reject(red(`${player_id} doesnt exist`))
            })
        }

        const generatePlate = async () => {
            return new Promise((resolve, reject) => {
                const ac = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let word = '';
                for (let i = 0; i <= 10; i++) {
                    if (i === 3 || i === 7) {
                        word += '-';
                    } else {
                        word += ac[Math.floor(Math.random() * ac.length)];
                    }
                }

                resolve(word)
            })
        }

        const file = {...this.database}
        const vehicle = await this.loadFile(vehicle_link)
        vehicle.name = vehicle_name
        vehicle.plate = await generatePlate()
        console.log(vehicle.plate)
        
        file[player_id]["Vehicles"].push(vehicle)

        await fs.writeFile(this.url, JSON.stringify(file), (err) => {
            if(err) {
                return new Promise((resolve, reject) => {
                    reject(red("Failed to adding vehicle to ${player_id}"))
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
            })
        }
    }
}