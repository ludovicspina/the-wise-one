const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeiUtilisateur = sequelize.define('dei_utilisateurs', {
    id: {
        type: DataTypes.BIGINT,  // Changer INTEGER en BIGINT
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
    ressource_1: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    ressource_2: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: false,
});

module.exports = DeiUtilisateur;
