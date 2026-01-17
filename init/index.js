const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    try {
        await Listing.deleteMany({});//delete data if already present
        console.log('Cleared existing listings');
        initData.data=initData.data.map(obj=>({...obj,owner:'69623ad528e899fba4f48f11'}));
        await Listing.insertMany(initData.data);
        console.log('Database initialized with sample data');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDB();

