const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const DeiVille = require('./dei_villes');

const DeiEmplacement = sequelize.define('dei_emplacements', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ville_id: {
        type: DataTypes.INTEGER,
        references: {
            model: DeiVille,
            key: 'id',
        },
        allowNull: false,
    },
    nom_emplacement: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type_batiment: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    niveau: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: false,
});

module.exports = DeiEmplacement;
