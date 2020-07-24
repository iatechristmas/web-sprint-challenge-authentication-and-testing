const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const authenticate = require('../auth/authenticate-middleware.js');
const authRouter = require('../auth/auth-router.js');
const jokesRouter = require('../jokes/jokes-router.js');
const dbConnection = require("../database/dbConfig");

const server = express();

const sessionConfiguration = {
  name: "cookie",
  secret: process.env.SESSION_SECRET || "keep it secret, keep it safe",
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: process.env.USE_SECURE_COOKIES || false,
    htttpOnly: true,
    userId: 3,
  },
  resave: false,
  saveUninitialized: true,
  store: new KnexSessionStore({
    knex: dbConnection,
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 1000 * 60 * 30,
  }),
};

server.use(session(sessionConfiguration))
server.use(helmet());
server.use(cors());
server.use(express.json());

server.use('/api/auth', authRouter);
server.use('/api/jokes', authenticate, jokesRouter);

module.exports = server;
