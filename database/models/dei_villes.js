const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const DeiRoyaume = require('./dei_royaumes');

const DeiVille = sequelize.define('dei_villes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    royaume_id: {
        type: DataTypes.INTEGER,
        references: {
            model: DeiRoyaume,
            key: 'id',
        },
        allowNull: false,
    },
    nom_ville: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    revenu_quotidien: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
    },
    niveau: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
            max: 3,
        },
    },
    capitale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: false,
});

module.exports = DeiVille;
