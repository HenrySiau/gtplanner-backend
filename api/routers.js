var express = require('express');
var router = express.Router();
var userControllers = require('./controllers/userController');
var tripControllers = require('./controllers/tripController');
var loginRequired = require('../helper').loginRequired;

// for testing database connection
router.get('/echouser', userControllers.echoUser);
// for testing middleware
router.get('/getuser', loginRequired, userControllers.getUser);
router.post('/post/trip/new', loginRequired, tripControllers.createTrip);
router.post('/post/invite/code/verify', loginRequired, tripControllers.verifyInvitationCode);

router.post('/post/signin', userControllers.signIn);
router.post('/post/register', userControllers.register);


exports.apiRouter = router;
