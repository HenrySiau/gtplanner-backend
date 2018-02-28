var User = require('../../models/userModel').User;
var superSecret = require('../../config').superSecret;
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

exports.register = function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (req.body.email &&
        req.body.userName &&
        req.body.password &&
        req.body.passwordConf) {
        var userData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
        };
        //use schema.create to insert data into the db
        User.create(userData, function (err) {
            if (err) {
                console.error('Can not create User name: ' + req.body.username);
                res.send(err);
            } else {
                return res.send('added user');
            }
        });

    } else {
        // user registration form missing information
        res.redirect('/newuser');
    }
};

exports.signIn = function (req, res) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (err, user) {
            if (err || !user) {
                console.error('err:' + err);
                return res.status(401).json({
                    message: 'Authentication failed. Wrong password.'
                });
            } else {
                req.session.userId = user._id;
                req.session.userName = user.userName;
                res.json({
                    token: jwt.sign({
                        email: user.email,
                        fullName: user.fullName,
                        _id: user._id
                    }, 'RESTFULAPIs')
                });
            }
        });
    }
};

// for testing data base connection
exports.echoUser = function (req, res) {
    User.findOne().exec(function (err, user) {
        if (err) return console.err(err);
        res.send('User name: ' + user.userName);
    })

};

// for testing data base connection
exports.getUser = function (req, res) {
    User.findOne().exec(function (err, user) {
        if (err) return console.err(err);
        res.send('User name: ' + user.userName);
    })

};

exports.authenticate = function (req, res) {
    if (req.body.username == 'Henry') {
        const payload = {
            userId: '0001'
        };
        var token = jwt.sign(payload, superSecret);

        res.json({
            success: true,
            message: 'You are logged in',
            token: token
        });
    } else {
        res.json({
            success: false,
            message: 'Invalid username or password'
        });
    }


};

exports.loginRequired = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                console.log(decoded);
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }


    // if (req.user) {
    //     next();
    // } else {
    //     return res.status(401).json({
    //         message: 'Unauthorized user!'
    //     });
    // }
};