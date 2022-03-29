// import packages
const express = require("express");
const cors = require("cors");

// import config
const config = require("./config/index.js");

// import database
const sqlite = require("./database/sqlite.js");

// create our app
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/", require("./routes/index.js"));

// initialize app
(async() => {
    try {
        await sqlite.authenticate();
        await sqlite.sync();
        console.info("sqlite connection has been established successfully");

        app.listen(config.app.port, () => 
            console.log(`app listening on port ${config.app.port}`)
        );
    } catch(error) {
        console.error("app initialization error", error);
    }
})();