require("dotenv").config();
const mongoose = require('mongoose');
const { data: sampleListings } = require("./data.js");
// const initData = require('./data.js');
const Listing = require('../models/listing.js');

const DB_URL = process.env.ATLASDB_URL;

async function initDB() {
  try {
    if (!DB_URL) {
      throw new Error("ATLASDB_URL is missing in .env");
    }

    // ✅ Connect once
    await mongoose.connect(DB_URL);
    console.log("✅ Connected to MongoDB");

    // ✅ Clear old data
    await Listing.deleteMany({});
    console.log("🗑️ Cleared existing listings");

    // ✅ Add REQUIRED fields
    const listings = sampleListings.map(listing => ({
      ...listing,
      owner: new mongoose.Types.ObjectId("69721c7dd2d3ad57778772ed"), // valid User ID
      geometry: {
        type: "Point",
        coordinates: [-122.6765, 45.5231] // required
      }
    }));

    // ✅ Insert data
    await Listing.insertMany(listings);
    console.log("🎉 Database initialized successfully");

    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error initializing database:", err.message);
  }
}

initDB();