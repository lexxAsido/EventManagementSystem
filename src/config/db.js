
const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

const url = process.env.MONGO_DB_URL;



const connectDB = async () => {
    try {
        await mongoose.connect(url);
        console.log('Connected to MongoDB successfully');
    } catch (e) {
        console.log(e);
        process.exit(1);
    }   
}

module.exports = connectDB;