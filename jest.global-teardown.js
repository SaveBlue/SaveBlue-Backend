import mongoose from 'mongoose';

export default async () => {

    // close mongoose connection
    mongoose.connection.close(function(){
        process.exit(0);
    });
};