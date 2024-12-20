const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeiBatiment = sequelize.define('dei_batiments', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nom_batiment: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    bonus_revenu: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    cout_construction: {
        type: DataTypes.JSONB,
    },
    statistiques: {
        type: DataTypes.JSONB,
    },
    niveau_max: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
}, {
    timestamps: false,
});

module.exports = DeiBatiment;