var config = require( './config');
var express = require('express');
var mongoose = require('mongoose');

const server = express();
server.get('/hello', (req, res) => {res.send('Hello');});

server.listen(config.port, config.host, () => {
    console.info('Express listening on port', config.port);
});