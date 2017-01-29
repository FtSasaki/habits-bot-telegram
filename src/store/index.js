const co = require('co')
const MongoClient = require('mongodb').MongoClient

const logger = require('../util/logger')

class Store {
    constructor(config) {
        this.config = config
    }

    getMongoConnection() {
        const { host, port, database } = this.config.mongoDB
        const url = `mongodb://${ host }:${ port }/${ database }`
        return co(function*() {
            logger.debug(`Store: connecting to MongoDB at ${ url }...`)
            const db = yield MongoClient.connect(url)
            logger.debug(`Store: connected to ${ url }`)
            return db
        })
    }

    userUpsert(id, userData) {
        return this.getMongoConnection()
            .then((db) => co(function*() {
                const users = db.collection('users')
                const user = yield users.findAndModify(
                    { _id: id }, [['_id', 1]],
                    { $set: userData },
                    { new: true, upsert: true }
                )
                db.close()
                return user.value
            }))
    }
}

module.exports = Store