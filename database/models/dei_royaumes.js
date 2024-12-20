const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const DeiUtilisateur = require('./dei_utilisateurs');

const DeiRoyaume = sequelize.define('dei_royaumes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.BIGINT, // Changer INTEGER en BIGINT
        references: {
            model: DeiUtilisateur,
            key: 'id',
        },
        allowNull: false,
    },
    nom_royaume: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
}, {
    timestamps: false,
});

module.exports = DeiRoyaume;
