var express = require('express');
var router = express.Router();
var userHandlers = require('./controllers/userController');

router.get('/hello', (req, res)=>{
    res.send('hello');
})

// for testing database connection
router.get('/echouser', userHandlers.echoUser);
// for testing middleware
router.get('/getuser', userHandlers.loginRequired, userHandlers.getUser);

router.post('/authenticate', userHandlers.authenticate);


exports.apiRouter = router;
