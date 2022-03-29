// import packages
const {DataTypes} = require("sequelize");

// import database
const sqlite = require("../database/sqlite.js");

// define Movie TABLE
module.exports = sqlite.define("Movie",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        image: DataTypes.STRING,
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        rate: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        associatedGenres: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        associatedCharacters: {
            type: DataTypes.JSONB,
            allowNull: false
        }
    },
    {
        scopes: {
            getAll: {
                attributes: {
                    exclude: [
                        "rate",
                        "associatedGenres",
                        "associatedCharacters"
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