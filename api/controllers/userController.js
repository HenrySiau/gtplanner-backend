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
        const invitationCode = req.body.invitationCode;
        if (invitationCode) {
            console.log('Invitation Code: ' + invitationCode);
            Trip.findOne({ invitationCode: invitationCode }).
                exec((err, trip) => {
                    if (err) {
                        console.err(err);
                    }
                    if (trip) {
                        console.log('found the trip :' + trip.title);
                        const userData = {
                            email: strip(req.body.email),
                            userName: strip(req.body.userName),
                            password: strip(req.body.password),
                            phoneNumber: req.body.phoneNumber && strip(req.body.phoneNumber),
                            trips: [trip._id],
                        };
                        User.create(userData, function (err, newUser) {
                            if (err) {
                                console.error(err);
                            }
                            if (newUser) {
                                console.log('new user had created: ' + newUser.userName);
                                trip.members.push(newUser._id);
                                trip.save((err, updatedTrip) => {
                                    if (err) {
                                        console.err(err);
                                    }
                                    if (updatedTrip) {
                                        console.log(`trip: ${updatedTrip.title}, had been updated`);
                                        const payload = {
                                            userId: newUser._id,
                                            // iat is short for is available till
                                            iat: Date.now() + config.JWTDurationMS
                                        };
                                        const token = jwt.sign(payload, superSecret);
                                        return res.status(200).json({
                                            success: true,
                                            message: 'new user created and joined a trip',
                                            token: token,
                                            userInfo: {
                                                userId: newUser._id,
                                                userName: newUser.userName,
                                                email: newUser.email,
                                                phoneNumber: newUser.phoneNumber,
                                                profilePicture: newUser.profilePicture || '',
                                                trips: newUser.trips,
                                            },
                                            tripInfo: {
                                                tripId: updatedTrip._id,
                                                title: updatedTrip.title,
                                                description: updatedTrip.description,
                                                owner: updatedTrip.owner,
                                                members: updatedTrip.members,
                                                startDate: updatedTrip.startDate,
                                                endDate: updatedTrip.endDate,
                                                invitationCode: updatedTrip.invitationCode
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    }
                })
        }
        else {   // no invitation code
            const userData = {
                email: strip(req.body.email),
                userName: strip(req.body.userName),
                password: strip(req.body.password),
                phoneNumber: req.body.phoneNumber && strip(req.body.phoneNumber),
            };
            User.create(userData, function (err, newUser) {
                if (err) {
                    console.err(err);
                }
                if (newUser) {
                    const payload = {
                        userId: newUser._id,
                        // iat is short for is available till
                        iat: Date.now() + config.JWTDurationMS
                    };
                    const token = jwt.sign(payload, superSecret);
                    return res.status(200).json({
                        success: true,
                        message: 'new user created and joined a trip',
                        token: token,
                        userInfo: {
                            userId: newUser._id,
                            userName: newUser.userName,
                            email: newUser.email,
                            phoneNumber: newUser.phoneNumber,
                            profilePicture: newUser.profilePicture || '',
                            trips: newUser.trips,
                        },
                    });
                }
            })
        }
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
        console.log('LoginWithFacebook');
        console.log(req.body);
        const invitationCode = req.body.invitationCode;
        if (invitationCode) {
            console.log('with invitationCode: ' + invitationCode);
            Trip.findOne({ invitationCode: invitationCode }).exec((err, trip) => {
                console.log('found  the trip')
                if (err) {
                    console.err(err);
                }
                if (trip) {
                    User.findOne({ email: req.body.email }).exec(function (err, user) {
                        if (err) {
                            console.error('err:' + err);
                            return res.status(401).json({
                                // TODO: verify the code and add user to the trip/group
                                message: 'Invalid username or password.'
                            });
                        }
                        if (!user) {
                            console.log('found the user');
                            // Create a new user
                            const userData = {
                                email: req.body.email,
                                userName: req.body.userName,
                                isSocialAuth: true,
                                facebookProfilePictureURL: req.body.facebookProfilePictureURL,
                                trips: [trip._id]
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
                                    console.log('new user created');
                                    trip.members.push(newUser._id);
                                    trip.save((err, updatedTrip) => {
                                        if (err) {
                                            console.error(err);
                                        }
                                        if (updatedTrip) {
                                            const payload = {
                                                userId: newUser._id,
                                                // iat is short for is available till
                                                iat: Date.now() + config.JWTDurationMS
                                            };
                                            const token = jwt.sign(payload, superSecret);
                                            return res.status(200).json({
                                                success: true,
                                                message: 'new user created and joined a trip',
                                                token: token,
                                                userInfo: {
                                                    userId: newUser._id,
                                                    userName: newUser.userName,
                                                    email: newUser.email,
                                                    phoneNumber: newUser.phoneNumber,
                                                    profilePicture: newUser.profilePicture || '',
                                                    trips: newUser.trips,
                                                },
                                                tripInfo: {
                                                    tripId: updatedTrip._id,
                                                    title: updatedTrip.title,
                                                    description: updatedTrip.description,
                                                    owner: updatedTrip.owner,
                                                    members: updatedTrip.members,
                                                    startDate: updatedTrip.startDate,
                                                    endDate: updatedTrip.endDate,
                                                    invitationCode: updatedTrip.invitationCode
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        }
                        if (user) {
                            user.trips.push(trip._id);
                            user.save((err, updatedUser) => {
                                if (err) {
                                    console.err(err);
                                }
                                if (updatedUser) {
                                    trip.push(updatedUser._id);
                                    trip.save((err, updatedTrip) => {
                                        const payload = {
                                            userId: user._id,
                                            // iat is short for is available till
                                            iat: Date.now() + config.JWTDurationMS
                                        };
                                        const token = jwt.sign(payload, superSecret);
                                        return res.status(200).json({
                                            success: true,
                                            message: 'new user created and joined a trip',
                                            token: token,
                                            userInfo: {
                                                userId: newUser._id,
                                                userName: newUser.userName,
                                                email: newUser.email,
                                                phoneNumber: newUser.phoneNumber,
                                                profilePicture: newUser.profilePicture || '',
                                                trips: newUser.trips,
                                            },
                                            tripInfo: {
                                                tripId: updatedTrip._id,
                                                title: updatedTrip.title,
                                                description: updatedTrip.description,
                                                owner: updatedTrip.owner,
                                                members: updatedTrip.members,
                                                startDate: updatedTrip.startDate,
                                                endDate: updatedTrip.endDate,
                                                invitationCode: updatedTrip.invitationCode
                                            }
                                        });
                                    })
                                }
                            })
                        }
                    });
                }
            })
        } else {// no invitationCode
            console.log('no invitationCode');
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
                    console.log('creating a new user')
                    const userData = {
                        email: req.body.email,
                        userName: req.body.userName,
                        isSocialAuth: true,
                        facebookProfilePictureURL: req.body.facebookProfilePictureURL,
                    };
                    User.create(userData, function (err, newUser) {
                        if (err) {
                            console.error(err);
                            console.error('Can not create User name: ' + req.body.userName);
                            return res.status(200).json({
                                success: false,
                                errors: err.errors
                            });
                        }
                        if (newUser) {
                            console.log('new user created');
                            const payload = {
                                userId: newUser._id,
                                // iat is short for is available till
                                iat: Date.now() + config.JWTDurationMS
                            };
                            const token = jwt.sign(payload, superSecret);
                            return res.status(200).json({
                                success: true,
                                message: 'new user created and joined a trip',
                                token: token,
                                userInfo: {
                                    userId: newUser._id,
                                    userName: newUser.userName,
                                    email: newUser.email,
                                    phoneNumber: newUser.phoneNumber,
                                    profilePicture: newUser.profilePicture || '',
                                    trips: newUser.trips,
                                },
                            });
                        } else {
                            console.log('fail creating new user');
                        }
                    });
                }
                if (user) {
                    console.log('user exist');
                    // find default trip
                    const payload = {
                        userId: user._id,
                        // iat is short for is available till
                        iat: Date.now() + config.JWTDurationMS
                    };
                    const token = jwt.sign(payload, superSecret);
                    Trip.findOne({ endDate: { $gte: Date.now() } }).
                        sort({ endDate: 1 }).
                        exec((err, defaultTrip) => {
                            if (err) {
                                console.err(err);
                            }
                            if (defaultTrip) {
                                console.log('found a active trip');
                                return res.status(200).json({
                                    success: true,
                                    message: 'new user created and joined a trip',
                                    token: token,
                                    userInfo: {
                                        userId: user._id,
                                        userName: user.userName,
                                        email: user.email,
                                        phoneNumber: user.phoneNumber,
                                        profilePicture: user.profilePicture || '',
                                        trips: user.trips,
                                    },
                                    tripInfo: {
                                        tripId: defaultTrip._id,
                                        title: defaultTrip.title,
                                        description: defaultTrip.description,
                                        owner: defaultTrip.owner,
                                        members: defaultTrip.members,
                                        startDate: defaultTrip.startDate,
                                        endDate: defaultTrip.endDate,
                                        invitationCode: defaultTrip.invitationCode
                                    }
                                });
                            } else {  // no active trip
                                // find most recent trip
                                Trip.findOne().
                                    sort({ endDate: -1 }).
                                    exec((err, mostRecentTrip) => {
                                        if (err) {
                                            console.err(err);
                                        }
                                        if (mostRecentTrip) {
                                            console.log('found a most recent trip');
                                            return res.status(200).json({
                                                success: true,
                                                message: 'new user created and joined a trip',
                                                token: token,
                                                userInfo: {
                                                    userId: user._id,
                                                    userName: user.userName,
                                                    email: user.email,
                                                    phoneNumber: user.phoneNumber,
                                                    profilePicture: user.profilePicture || '',
                                                    trips: user.trips,
                                                },
                                                tripInfo: {
                                                    tripId: mostRecentTrip._id,
                                                    title: mostRecentTrip.title,
                                                    description: mostRecentTrip.description,
                                                    owner: mostRecentTrip.owner,
                                                    members: mostRecentTrip.members,
                                                    startDate: mostRecentTrip.startDate,
                                                    endDate: mostRecentTrip.endDate,
                                                    invitationCode: mostRecentTrip.invitationCode
                                                }
                                            })
                                        } else {
                                            console.log('no trip found');
                                            return res.status(200).json({
                                                success: true,
                                                message: 'new user created',
                                                token: token,
                                                userInfo: {
                                                    userId: user._id,
                                                    userName: user.userName,
                                                    email: user.email,
                                                    phoneNumber: user.phoneNumber,
                                                    profilePicture: user.profilePicture || '',
                                                    trips: user.trips,
                                                },
                                            })
                                        }
                                    })
                                //
                            }

                        })
                }
            });
        }
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
};
exports.LoginWithToken = (req, res) => {
    if (req.body.token) {
        jwt.verify(req.body.token, superSecret, (err, decoded) => {
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
