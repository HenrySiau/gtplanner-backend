var express = require('express');
var router = express.Router();
var userHandlers = require('./controllers/userController');

router.get('/hello', (req, res)=>{
    res.send('hello');
})

module.exports.apiRouter = router;