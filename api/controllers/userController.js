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
                const payload = {
                    userId: '0001'
                };
                var token = jwt.sign(payload, superSecret);
                res.json({
                    success: true,
                    token: token,
                    userId: user._id
                });
            }
        });
    }else{
        res.json({
            success: false,
            message: 'Invalid username or password'
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

