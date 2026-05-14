const express = require('express');
const dotenv = require('dotenv');
const app = require('../src/app');
const connectDB = require('../src/config/db');

dotenv.config();

const server = express();
let connectionPromise;

server.use(async (_req, _res, next) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB();
    }

    await connectionPromise;
    next();
  } catch (error) {
    next(error);
  }
});

server.use(app);

module.exports = server;

