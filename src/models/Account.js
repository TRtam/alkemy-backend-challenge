// import packages
const {DataTypes} = require("sequelize");

// import database
const sqlite = require("../database/sqlite.js");

// define Account TABLE
module.exports = sqlite.define("Account", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username_lowered: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activated: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    activate_token: {
        type: DataTypes.STRING,
        allowNull: false
    }
});