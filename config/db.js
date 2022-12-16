const mongoose = require('mongoose');

const devEnv = process.env.NODE_ENV !== 'production';
const { DATABASE, DATABASE_LOCAL, DATABASE_PASSWORD } = process.env;

// db local
const dbLocal = DATABASE_LOCAL;

// atlas mongo uri
const mongoURI = DATABASE.replace('<PASSWORD>', DATABASE_PASSWORD);

const db = devEnv ? dbLocal : mongoURI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db);
    console.log(`Connected to MongoDB → ${conn.connection.port}`.gray.bold);
  } catch (err) {
    throw err;
  }
};

module.exports = connectDB;
