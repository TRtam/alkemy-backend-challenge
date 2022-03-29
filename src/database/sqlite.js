// import packages
const {Sequelize} = require("sequelize");
const pg = require("pg");

// import config
const config = require("../config/index.js");

module.exports = new Sequelize(config.pg.uri, {
    dialect: "postgres",
    dialectModule: pg,
    logging: true
});