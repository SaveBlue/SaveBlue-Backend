const { start } = require('./src/server'); // Your Express app
const mongoose = require('mongoose');

module.exports = async () => {
    global.__SERVER__ = await start();

    const dbURI = 'mongodb://127.0.0.1/SaveBlue_test';
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Clear the database
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }

    await mongoose.disconnect();

};