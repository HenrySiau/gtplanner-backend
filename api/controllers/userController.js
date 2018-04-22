var User = require('../../models/userModel').User;
var superSecret = require('../../config').superSecret;
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../../config');

strip = (str) => {
    return str.replace(/^\s+|\s+$/g, '');
}

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
            email: strip(req.body.email),
            userName: strip(req.body.userName),
            password: strip(req.body.password),
            phoneNumber: req.body.phoneNumber && strip(req.body.phoneNumber)
        };
        // console.log('userData: ' + userData.email);
        //use schema.create to insert data into the db
        //TODO: more specific error handlings required
        // TODO: user name validation required
        // TODO: consider using express passport
        User.create(userData, function (err, newUser) {
            if (err) {
                // console.log(err);
                console.error('Can not create User name: ' + req.body.username);
                return res.status(500).json({
                    success: false,
                    errors: err.errors
                });
            } else {
                if (req.body.inviteCode) {
                    // todo: join 
                    console.log(req.body.inviteCode);
                }
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

// TODO required server side verification 
exports.LoginWithFacebook = function (req, res) {
    if (req.body.email && req.body.userName && req.body.accessToken) {
        User.findOne({ email: req.body.email }).exec(function (err, user) {
            if (err) {
                console.error('err:' + err);
                return res.status(401).json({
                    // TODO: verify the code and add user to the trip/group
                    message: 'Invalid username or password.'
                });
            }
            if (req.body.inviteCode) {
                // todo: join 
                console.log(req.body.inviteCode);
            }
            if (!user) {
                // Create a new user
                var userData = {
                    email: req.body.email,
                    userName: req.body.userName,
                    isSocialAuth: true,
                    facebookProfilePictureURL: req.body.facebookProfilePictureURL

                };
                User.create(userData, function (err, newUser) {
                    if (err) {
                        console.log(err);
                        console.error('Can not create User name: ' + req.body.userName);
                        return res.status(200).json({
                            success: false,
                            errors: err.errors
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
                            userInfo: {
                                userId: newUser._id,
                                userName: newUser.userName,
                                email: newUser.email,
                                phoneNumber: newUser.phoneNumber,
                                profilePicture: newUser.profilePicture || '',
                            },
                        });
                    }
                });
            }
            if (user) {
                const payload = {
                    userId: user._id,
                    // iat is short for is available till
                    iat: Date.now() + config.JWTDurationMS
                };
                var token = jwt.sign(payload, superSecret);
                res.status(200).json({
                    success: true,
                    token: token,
                    userInfo: {
                        userId: user._id,
                        userName: user.userName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        profilePicture: user.profilePicture,
                        facebookProfilePictureURL: user.facebookProfilePictureURL
                    },
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
exports.LoginWithToken = function (req, res) {
    if (req.body.token) {
        jwt.verify(req.body.token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                if (!(decoded.iat && decoded.userId)) {
                    return res.status(200).send({
                        success: false,
                        message: 'Invalid token.'
                    });
                    //iat is short for is available till
                } else if (decoded.iat < Date.now()) {
                    return res.status(200).send({
                        success: false,
                        message: 'Token expired.'
                    });
                } else {
                    // fetch userInfo from database
                    User.findById(decoded.userId).exec(
                        (error, user) => {
                            if (error) {
                                console.error(error);
                                res.status(200).json({
                                    success: false,
                                    message: 'can not find this User in database'
                                });
                            } else {
                                // update token
                                const payload = {
                                    userId: user._id,
                                    // iat is short for is available till
                                    iat: Date.now() + config.JWTDurationMS
                                };
                                const token = jwt.sign(payload, superSecret);
                                res.status(200).json({
                                    success: true,
                                    token: token,
                                    userInfo: {
                                        userId: user._id,
                                        userName: user.userName,
                                        email: user.email,
                                        phoneNumber: user.phoneNumber,
                                        profilePicture: user.profilePicture,
                                        facebookProfilePictureURL: user.facebookProfilePictureURL
                                    }
                                });
                            }
                        }
                    )
                }
            }
        });
    } else {
        res.status(200).json({
            success: false,
            message: 'Invalid token'
        });
    }

}

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
exports.echoUsers = (req, res) => {
    User.find().
        limit(1000).
        exec((err, users) => {
            if (err) res.send(err);
            res.send(users);
        })
};

// for testing data base connection
exports.getUser = function (req, res) {
    User.findOne().exec(function (err, user) {
        if (err) return console.err(err);
        res.send('User name: ' + user.userName);
    })

};
