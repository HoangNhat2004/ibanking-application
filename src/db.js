// File: src/db.js
  // Kết nối tới MongoDB

  const { MongoClient } = require('mongodb');

  const uri = "mongodb://localhost:27017/iBanking?replicaSet=rs0";
  const client = new MongoClient(uri);

  async function connectDB() {
    try {
      await client.connect();
      console.log("Connected to MongoDB");
      return client.db("iBanking");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  module.exports = { connectDB, client };