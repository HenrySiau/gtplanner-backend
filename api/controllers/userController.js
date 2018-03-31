var User = require('../../models/userModel').User;
var superSecret = require('../../config').superSecret;
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../../config');

exports.register = function (req, res) {
    if (req.body.email &&
        req.body.userName &&
        req.body.password &&
        req.body.passwordConfirm) {
        if (req.body.password != req.body.passwordConfirm) return res.status(400).json({
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
        User.create(userData, function (err, newUser) {
            if (err) {
                console.error('Can not create User name: ' + req.body.username);
                return res.status(500).json({
                    success: false,
                    message: 'can not create user'
                });
            } else {
                const payload = {
                    userId: newUser._id,
                    // iat is short for is available till
                    iat: Date.now() + config.JWTDurationMS
                };
                var token = jwt.sign(payload, superSecret);
                return res.status(200).json({
                    success: true,
                    message: 'new user created',
                    token: token,
                    userId: newUser._id
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
                    // TODO: verify the code and add user to the trip/group
                    message: 'Invalid username or password.'
                });
            } else {
                if (req.body.inviteCode) {
                    console.log(req.body.inviteCode);
                }
                const payload = {
                    userId: user._id,
                    // iat is short for is available till
                    iat: Date.now() + config.JWTDurationMS
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

exports.validateEmailExist = function (req, res) {
    if (req.body.email) {
        console.log(req.body.email);
        User.doesEmailExist(req.body.email, function (err, result) {
            if (err) {
                console.error('err:' + err);
                return res.status(500).json({
                    message: 'Server Side error'
                });
            }
            if (result === true) {
                return res.status(200).json({
                    success: false,
                    exist: true,
                    message: 'Email already exist please'
                });
            }
            return res.status(200).json({
                success: true,
                exist: false,
                message: 'Email ok to be used'
            });
        })
    }
}
// for testing data base connection
exports.echoUser =  (req, res) => {
    User.findOne().exec( (err, user) => {
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

// exports.echoUser =  (req, res) => {
//     res.send('User name: Henry');
// };