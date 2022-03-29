// import packages
const {DataTypes} = require("sequelize");

// import database
const sqlite = require("../database/sqlite.js");

// define Character TABLE
module.exports = sqlite.define("Character", 
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        age: {
            type: DataTypes.STRING,
            allowNull: false
        },
        history: {
            type: DataTypes.STRING(1255),
            allowNull: false
        },
        associatedMovies: {
            type: DataTypes.JSONB,
            allowNull: false
        }
    },
    {
        scopes: {
            getAll: {
                attributes: {
                    exclude: [
                        "id",
                        "age",
                        "history",
                        "associatedMovies",
                        "createdAt",
                        "updatedAt"
                    ]
                }
            },
            clear: {
                attributes: {
                    exclude: [
                        "createdAt",
                        "updatedAt"
                    ]
                }
            }
        }
    }
);