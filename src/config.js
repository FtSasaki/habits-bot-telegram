const config = {
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN,
    },
    store: {
        mongoDB: {
            host: process.env.MONGODB_HOST || 'localhost',
            port: process.env.MONGODB_PORT || 27017,
            database: process.env.MONGODB_DATABASE || 'habitsBot',
        }
    },
}

module.exports = config
