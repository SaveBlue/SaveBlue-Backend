import mongoose from 'mongoose';
import fs from "fs";
import path from "path";

export default async () => {

    // close mongoose connection
    mongoose.connection.close(function(){
        process.exit(0);
    });

    fs.unlinkSync( 'test_ids.json');
};