const mongoose = require('mongoose');

let dbURI = 'mongodb://localhost/SaveBlue';
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGODB_CLOUD_URI;
}


// Connect to the database
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


// Database state debug messages
mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}.`);
});

mongoose.connection.on('error', error => {
    console.log('Mongoose connection error: ', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose not connected.');
});


// Close connection to the database
const safeExit = (message, callback) => {
    mongoose.connection.close(() => {
        console.log(`Mongoose closed the connection via '${message}'.`);
        callback();
    });
};


// Nodemon restart
process.once('SIGUSR2', () => {
    safeExit('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});


// Exit application
process.on('SIGINT', () => {
    safeExit('Exit application', () => {
        process.exit(0);
    });
});


// Exit application Heroku
process.on('SIGTERM', () => {
    safeExit('Exit application Heroku', () => {
        process.exit(0);
    });
});


require('./tokens');
require('./users');
require('./incomes');
require('./expenses');
