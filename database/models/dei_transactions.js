const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const DeiTransaction = sequelize.define('dei_transactions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    utilisateur_id: {
        type: DataTypes.BIGINT, // Changer INTEGER en BIGINT
        allowNull: false,
    },
    type_transaction: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    montant: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(255),
    },
    date_transaction: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: false,
});

module.exports = DeiTransaction;
