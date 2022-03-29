// import packages
const {DataTypes} = require("sequelize");

// import database
const sqlite = require("../database/sqlite.js");

// define Genre TABLE
module.exports = sqlite.define("Genre", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    image: DataTypes.STRING,
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    associatedMovies: {
        type: DataTypes.JSONB,
        allowNull: false
    }
});