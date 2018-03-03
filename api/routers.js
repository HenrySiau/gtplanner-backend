var express = require('express');
var router = express.Router();
var userHandlers = require('./controllers/userController');
var loginRequired = require('../helper').loginRequired;

// for testing database connection
router.get('/echouser', userHandlers.echoUser);
// for testing middleware
router.get('/getuser', loginRequired, userHandlers.getUser);

router.post('/signin', userHandlers.signIn);
router.post('/register', userHandlers.register);


exports.apiRouter = router;
