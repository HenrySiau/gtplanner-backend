var config = require( './config');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var apiRouter = require('./api/routers').apiRouter;


const server = express();

// use body parser so we can get info from POST and/or URL parameters
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// use morgan to log requests to the console
server.use(morgan('dev'));

// Database Connection config
const mongooseOptions = {
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};

mongoose.connect('mongodb://localhost/test', mongooseOptions).then(
    () => {
        console.info('mongoose.connect ready to use');
    },
    err => {
        /** handle initial connection error */
        console.error('mongoose.connect failed', err);
    }
);
var db = mongoose.connection;
//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // connected to Mongo
});

server.use('/api', apiRouter);

server.listen(config.port, config.host, () => {
    console.info('Express listening on port', config.port);
});