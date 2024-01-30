import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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
server.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
server.use(express.urlencoded({ extended: true }));

//----------------------------------------------------------------------------------------------------------------------

import './models/db.js';
import authenticationRouter from './routes/authentication.js';
import usersRouter from './routes/users.js';
import accountsRouter from './routes/accounts.js';
import incomesRouter from './routes/incomes.js';
import expensesRouter from './routes/expenses.js';
import goalsRouter from './routes/goals.js';
import './config/passport.js';

server.use(authenticationRouter);
server.use(usersRouter);
server.use(accountsRouter);
server.use(incomesRouter);
server.use(expensesRouter);
server.use(goalsRouter);

// To handle paths correctly when using ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the Vue frontend app
server.use(express.static(path.join(__dirname, '/dist')));

server.use(passport.initialize({}));

server.get("/", (req, res) => {
    res.json({ message: "Test server running!" });
});

/**
 * Start server
 */

const start = () => {
    return server.listen(port, () => {
        console.log(`Server running on port ${port}!`);
    });
}

if (process.env.NODE_ENV !== 'test')
    await start();

export {
    server, start
};