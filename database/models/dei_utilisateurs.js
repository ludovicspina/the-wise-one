const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeiUtilisateur = sequelize.define('dei_utilisateurs', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
    },
    nom_rp: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    pieces_or: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    bois: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    nourriture: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    pierre: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: false,
});

module.exports = DeiUtilisateur;
