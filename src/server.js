const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require('passport');
const server = express();
const port = process.env.PORT || 5000;
const url = process.env.URL || "http://localhost";
//----------------------------------------------------------------------------------------------------------------------


// cors settings
let corsOptions = {
    //origin: url + ":" + 8080
    origin: "*"
};
server.use(cors(corsOptions));

// parse requests of content-type - application/json
server.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: true }));
//----------------------------------------------------------------------------------------------------------------------


require("./models/db");
require("./routes/authentication")(server);
require("./routes/users")(server);
require("./routes/accounts")(server);
require("./routes/incomes")(server);
require("./routes/expenses")(server);
require("./routes/goals")(server);
require("./config/passport.js");


const path = require('path');
// Server static files from the Vue frontend app
server.use(express.static(path.join(__dirname, '/dist')));

server.use(passport.initialize());

server.get("/", (req, res) => {
    res.json({ message: "Test server running!" });
});


/**
 * Start server
 */
server.listen(port, () => {
    console.log(`Server running on port ${port}!`);
});

module.exports = server;
