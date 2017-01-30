const _ = require('lodash')
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

    updateUser({ id, data, upsert = false }) {
        const update = upsert ? { $setOnInsert: data } : { $set: data }
        return this.getMongoConnection()
            .then((db) => co(function*() {
                const users = db.collection('users')
                const user = yield users.findAndModify(
                    { _id: id }, [['_id', 1]],
                    update,
                    { new: true, upsert }
                )
                db.close()
                return user.value
            }))
    }

    newHabit({ userId, data }) {
        return this.getMongoConnection()
            .then((db) => co(function*() {
                const habits = db.collection('habits')
                const habit = yield habits.insertOne(_.merge(data, { userId }))
                db.close()
                console.log(habit)
                console.log(habit.value)
                return habit.value
            }))
    }
}

module.exports = Store
