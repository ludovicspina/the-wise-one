const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const DeiVille = require('./dei_villes');
const DeiBatiment = require('./dei_batiments');

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
    batiment_id: {
        type: DataTypes.INTEGER,
        references: {
            model: DeiBatiment,
            key: 'id',
        },
        allowNull: true,
    },
    niveau: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: false,
});

// Association avec DeiBatiment
DeiEmplacement.belongsTo(DeiBatiment, { foreignKey: 'batiment_id' });
DeiBatiment.hasMany(DeiEmplacement, { foreignKey: 'batiment_id' });

module.exports = DeiEmplacement;
