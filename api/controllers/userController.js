var User = require('../../models/userModel').User;
var superSecret = require('../../config').superSecret;
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

exports.register = function (req, res) {
    if (req.body.email &&
        req.body.userName &&
        req.body.password &&
        req.body.passwordConfirm) {
        if (req.body.password != req.body.passwordConf) return res.json({
            success: false,
            message: 'password and confirm password not match'
        });
        var userData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber
        };
        //use schema.create to insert data into the db
        //TODO: more specific error handlings required
        // TODO: user name validation required
        // TODO: consider using express passport
        User.create(userData, function (err) {
            if (err) {
                console.error('Can not create User name: ' + req.body.username);
                return res.status(500).json({
                    success: false,
                    message: 'can not create user'
                });
            } else {
                return res.status(200).json({
                    success: true,
                    message: 'new user created'
                });
            }
        });

    } else {
        // user registration form missing information
        res.status(400).json({
            success: false,
            message: 'please complete the form'
        });
    }
};

exports.signIn = function (req, res) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (err, user) {
            if (err || !user) {
                console.error('err:' + err);
                return res.status(401).json({
                    message: 'Invalid username or password.'
                });
            } else {
                const payload = {
                    userId: '0001'
                };
                var token = jwt.sign(payload, superSecret);
                res.status(200).json({
                    success: true,
                    token: token,
                    userId: user._id
                });
            }
        });
    } else {
        res.status(401).json({
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