const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // désactive les logs SQL (optionnel)
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // nécessaire pour Heroku
        },
    },
});

module.exports = sequelize;