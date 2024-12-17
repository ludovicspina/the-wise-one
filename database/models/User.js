// models/User.js
const {DataTypes} = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
}, {
    timestamps: false, // Désactive createdAt et updatedAt
});

module.exports = User;
