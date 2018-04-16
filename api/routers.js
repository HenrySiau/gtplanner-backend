var express = require('express');
var router = express.Router();
var userControllers = require('./controllers/userController');
var tripControllers = require('./controllers/tripController');
var loginRequired = require('../helper').loginRequired;

// for testing middleware
router.get('/getuser', loginRequired, userControllers.getUser);
router.get('/users', userControllers.echoUsers);
router.get('/get/trip', loginRequired, tripControllers.getTripInfo);
router.get('/get/recenttrips', loginRequired, tripControllers.getRecentTrips);
router.post('/post/trip/new', loginRequired, tripControllers.createTrip);
router.post('/post/invitation/code/verify', tripControllers.verifyInvitationCode);
router.post('/post/members/invite', loginRequired, tripControllers.inviteMembers);

router.post('/post/signin', userControllers.signIn);
router.post('/post/register', userControllers.register);
router.post('/post/email/exist', userControllers.validateEmailExist);


exports.apiRouter = router;
