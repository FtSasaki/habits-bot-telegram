const _ = require('lodash')
const co = require('co')
const mongodb = require('mongodb')
const { MongoClient, ObjectId } = mongodb

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

    getOrCreateUser({ id, data }) {
        return this._updateOrCreateUser({ id, data, upsert: true })
    }

    updateUser({ id, data }) {
        return this._updateOrCreateUser({ id, data, upsert: false })
    }

    _updateOrCreateUser({ id, data, upsert = false }) {
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
                return habit.value
            }))
    }

    deleteHabit({ userId, id }) {
        return this.getMongoConnection()
            .then((db) => co(function*() {
                const habits = db.collection('habits')
                const deletedHabit = yield habits.findOneAndDelete({
                    userId: userId,
                    _id: ObjectId(id),
                })
                db.close()
                return deletedHabit.value
            }))
    }

    getHabits({ userId }) {
        return this.getMongoConnection()
            .then((db) => co(function*() {
                const habits = yield db.collection('habits').find({ userId }).toArray()
                db.close()
                return habits
            }))
    }
}

module.exports = Store
