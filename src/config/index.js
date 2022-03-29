require("dotenv").config();

module.exports = {
    app: {
        port: process.env.PORT || 3000
    },
    jwt: {
        secret: process.env.JWT_SECRET || "secret jwt string"
    },
    sg: {
        key: process.env.SG_API_KEY
    },
    pg: {
        uri: process.env.POSTGRES_URI
    }
};