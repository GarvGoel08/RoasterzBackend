const mongoose = require('mongoose');
// require("dotenv").config();

async function connectToDatabase() {
    try {
        const Mongo_URI = process.env.MONGO_URI;
        await mongoose.connect(Mongo_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to the database');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

module.exports = {connectToDatabase};
