const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeiRessource = sequelize.define('dei_ressources', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom_ressource: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING(255),
    },
}, {
    timestamps: false,
});

module.exports = DeiRessource;
