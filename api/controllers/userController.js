var User = require('../../models/userModel').User;
var Trip = require('../../models/tripModel').Trip;
var superSecret = require('../../config').superSecret;
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../../config');

strip = (str) => {
    return str.replace(/^\s+|\s+$/g, '');
}

exports.register = function (req, res) {
    console.log(req.body);
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
        // create user
        User.create(userData, function (err, newUser) {
            if (err) {
                // console.log(err);
                console.error('Can not create User name: ' + req.body.username);
                return res.status(500).json({
                    success: false,
                    errors: err.errors
                });
            }
            if (newUser) {
                let tripInfo = '';
                let userInfo = {
                    userId: newUser._id,
                    userName: newUser.userName,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    profilePicture: newUser.profilePicture || '',
                };
                let updatedUserInfo = '';
                if (req.body.invitationCode) {
                    console.log('Invitation Code: ' + req.body.invitationCode);
                    Trip.findOne({ invitationCode: req.body.invitationCode }).
                        select('members').
                        exec((err, trip) => {
                            if (err) {
                                console.err(err);
                            }
                            if (trip) {
                                console.log('found the trip')
                                newUser.trips.push(trip._id);
                                // add trip id to user.trips
                                newUser.save((error, updatedUser) => {
                                    if (error) {
                                        console.error(error);
                                    }
                                    if (updatedUser) {
                                        console.log('update User');
                                        updatedUserInfo = {
                                            userId: updatedUser._id,
                                            userName: updatedUser.userName,
                                            email: updatedUser.email,
                                            trips: updatedUser.trips,
                                            phoneNumber: updatedUser.phoneNumber,
                                            profilePicture: updatedUser.profilePicture || '',
                                        };
                                        trip.members.push(newUser._id);
                                        trip.save((error, updatedTrip) => {
                                            if (error) {
                                                console.error(error);
                                            }
                                            if (updatedTrip) {
                                                console.log('update Trip');
                                                tripInfo = {
                                                    tripId: updatedTrip._id,
                                                    title: updatedTrip.title,
                                                    description: updatedTrip.description,
                                                    owner: updatedTrip.owner,
                                                    members: updatedTrip.members,
                                                    startDate: updatedTrip.startDate,
                                                    endDate: updatedTrip.endDate,
                                                    invitationCode: updatedTrip.invitationCode
                                                }
                                                const payload = {
                                                    userId: newUser._id,
                                                    // iat is short for is available till
                                                    iat: Date.now() + config.JWTDurationMS
                                                };
                                                var token = jwt.sign(payload, superSecret);
                                                console.log('updatedUserInfo: ' + updatedUserInfo);
                                                console.log('tripIfo: ' + tripInfo)
                                                return res.status(200).json({
                                                    success: true,
                                                    message: 'new user created',
                                                    token: token,
                                                    tripInfo: tripInfo,
                                                    userInfo: updatedUserInfo || userInfo,
                                                });
                                            }
                                        })
                                    }
                                });
                            } else {
                                console.log('can not find the trip');
                            }
                        });
                } else { // no invitation code
                    const payload = {
                        userId: newUser._id,
                        // iat is short for is available till
                        iat: Date.now() + config.JWTDurationMS
                    };
                    var token = jwt.sign(payload, superSecret);
                    console.log('updatedUserInfo: ' + updatedUserInfo);
                    console.log('tripIfo: ' + tripInfo)
                    return res.status(200).json({
                        success: true,
                        message: 'new user created',
                        token: token,
                        tripInfo: tripInfo,
                        userInfo: updatedUserInfo || userInfo,
                    });
                }
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
                if (req.body.invitationCode) {
                    console.log(req.body.invitationCode);
                }
                const payload = {
                    userId: user._id,
                    // iat is short for is available till
                    iat: Date.now() + config.JWTDurationMS
                };
                let token = jwt.sign(payload, superSecret);
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
                    }
                    if (newUser) {
                        let tripInfo = '';
                        if (req.body.invitationCode) {
                            Trip.findOne({ invitationCode: req.body.invitationCode }).
                                select('members').
                                exec((err, trip) => {
                                    if (err) {

                                    }
                                    if (trip) {
                                        newUser.trips.push(trip._id);
                                        newUser.save((err, updatedUser) => {

                                        });

                                    }

                                });

                            // todo: join 
                            console.log(req.body.invitationCode);
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
                            userInfo: {
                                userId: newUser._id,
                                userName: newUser.userName,
                                email: newUser.email,
                                phoneNumber: newUser.phoneNumber,
                                profilePicture: newUser.profilePicture || '',
                            },
                            tripInfo: tripInfo,
                        });
                    }
                });
            }
            if (user) {
                if (req.body.invitationCode) {
                    // todo: join 
                    console.log(req.body.invitationCode);
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
                            } if (user) {
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
                            else {
                                res.status(200).json({
                                    success: false,
                                    message: 'Invalid token'
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
