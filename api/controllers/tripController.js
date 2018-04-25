var Trip = require('../../models/tripModel').Trip;
var User = require('../../models/userModel').User;
var mongoose = require('mongoose');
var config = require('../../config');
var instanceConfig = require('../../instanceConfig');
const nodemailer = require('nodemailer');
var superSecret = require('../../config').superSecret;
var jwt = require('jsonwebtoken');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: instanceConfig.gmailAddress,
        pass: instanceConfig.gmailPassword
    }
});

const strip = (str) => {
    if (str) {
        return str.replace(/^\s+|\s+$/g, '');
    } else {
        return '';
    }
}

// generate random string
const generateRandomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// re-generate invitation code if it's been used
const generateInvitationCode = (resolve) => {
    console.log('generateInvitationCode');
    let code = generateRandomString(8);
    console.log('generateInvitationCode: ' + code);
    var query = Trip.findOne({ invitationCode: code });
    query.then((trip) => {
        if (trip) return generateInvitationCode(resolve);
        else {
            console.log('return code: ' + code);
            resolve(code)
        }

    });
}

exports.createTrip = function (req, res) {
    if (req.body) {
        if (req.body.tripName &&
            req.body.startDate &&
            req.body.endDate) {

            // create invitation code then save the data
            function getInvitationCode() {
                return new Promise(resolve => {
                    generateInvitationCode(resolve);
                })
            }

            async function asyncCall() {
                let invitationCode = await getInvitationCode();
                console.log('inside req, code: ' + invitationCode);
                const tripData = {
                    title: strip(req.body.tripName),
                    description: strip(req.body.description),
                    owner: req.decodedJWT.userId,
                    invitationCode: invitationCode,
                    members: [req.decodedJWT.userId],
                    startDate: new Date(req.body.startDate).setHours(0, 0, 0, 0), // set to first second of the date
                    endDate: new Date(req.body.endDate).setHours(23,59,59,999), // set to last second of the date
                };
                Trip.create(tripData, function (err, newTrip) {
                    if (err || !newTrip) {
                        console.error(err);
                        return res.status(200).json({
                            success: false,
                            error: err
                        });
                    } else {
                        User.findById(req.decodedJWT.userId, (err, user) => {

                            if (err || !user) {
                                console.log(err)
                                if (!user) { console.log('can not find User') }
                                return res.status(200).json({
                                    success: false,
                                    message: 'something went wrong' + err
                                });
                            } else {
                                console.log(user);
                                // const newTripsList = user.trips? user.trips.push(newTrip._id) : [newTrip._id];
                                user.trips.push(newTrip._id);
                                console.log('newTrip._id: ' + newTrip._id);
                                console.log('user.trips: ' + user.trips);
                                // console.log('newTripsList: ' + newTripsList);
                                // user.trips = newTripsList;
                                user.save((err) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(200).json({
                                            success: false,
                                            message: 'something went wrong' + err
                                        });
                                    } else {

                                        console.log(user);
                                        return res.status(200).json({
                                            success: true,
                                            tripInfo: {
                                                tripId: newTrip._id,
                                                title: newTrip.title,
                                                description: newTrip.description,
                                                owner: newTrip.owner,
                                                members: newTrip.members,
                                                startDate: newTrip.startDate,
                                                endDate: newTrip.endDate,
                                                invitationCode: newTrip.invitationCode
                                            }
                                        });
                                    }
                                })
                            }
                        })
                    }
                });
            }
            asyncCall();
        }
    }
}

exports.verifyInvitationCode = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    if (req.body.invitationCode) {
        console.log('invitationCode: ' + req.body.invitationCode);
        Trip.findOne({ invitationCode: req.body.invitationCode }).exec((err, trip) => {
            if (err) {
                console.error(err);
                return res.status(200).json({
                    success: false,
                    error: err
                });
            }
            if (trip) {
                if (req.body.token) {
                    jwt.verify(req.body.token, superSecret, function (err, decoded) {
                        if (err) {
                            return res.json({
                                success: false,
                                message: 'Failed to authenticate token.'
                            });
                        } else {    //successfully decoded the token
                            // if everything is good, save to request for use in other routes
                            if (!decoded.iat) {
                                return res.status(403).send({
                                    success: false,
                                    message: 'No token provided.'
                                });
                                //iat is short for is available till
                            } else if (decoded.iat < Date.now()) {
                                return res.status(498).send({
                                    success: false,
                                    message: 'Token expired.'
                                });
                            } else {
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
                                                tripInfo: {
                                                    tripId: trip._id,
                                                    title: trip.title,
                                                    description: trip.description,
                                                    owner: trip.owner,
                                                    members: trip.members,
                                                    startDate: trip.startDate,
                                                    endDate: trip.endDate,
                                                    invitationCode: trip.invitationCode
                                                },
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

                } else {    // if no token in request body
                    console.log('found the trip');
                    return res.status(200).json({
                        success: true,
                        tripInfo: {
                            tripId: trip._id,
                            title: trip.title,
                            description: trip.description,
                            owner: trip.owner,
                            members: trip.members,
                            startDate: trip.startDate,
                            endDate: trip.endDate,
                            invitationCode: trip.invitationCode
                        }
                    });
                }

            } else {    // if no trip match the invitation code
                console.log('can not find the trip with invitationCode')
                return res.status(200).json({
                    success: false,
                    error: 'can not find a trip with this invitation code'
                });
            }
        });
    }
    else { // no invitation code in request body
        return res.status(200).json({
            success: false,
            message: 'No invitation code received'
        });
    }
}

exports.getTripInfo = function (req, res) {
    const tripId = req.query.tripId ? req.query.tripId : '';
    if (tripId) {
        Trip.findById(tripId).exec((err, trip) => {
            if (err) {
                console.error(err);
                return res.status(200).json({
                    success: false,
                    error: err
                });
            }
            if (trip) {
                return res.status(200).json({
                    success: true,
                    tripInfo: {
                        tripId: trip._id,
                        title: trip.title,
                        description: trip.description,
                        owner: trip.owner,
                        members: trip.members,
                        startDate: trip.startDate,
                        endDate: trip.endDate,
                        invitationCode: trip.invitationCode
                    }
                });
            } else {
                return res.status(200).json({
                    success: false,
                    error: 'can not find a trip with tripId provided'
                });
            }
        });
    } else {
        // return the trip has the shortest ending time
        User.findById(req.decodedJWT.userId).select('trips').
            populate({
                path: 'trips',
                match: { endDate: { $gte: Date.now() }}, // filter the past trips
                options: { limit: 1, sort: { endDate: 1 } }
            }).
            exec((err, user) => {
                if (err) {
                    console.error(err);
                    return res.status(200).json({
                        success: false,
                        error: err
                    });
                } if (user) {
                    const trip = user.trips[0];
                    console.log(trip);
                    return res.status(200).json({
                        success: true,
                        tripInfo: {
                            tripId: trip._id,
                            title: trip.title,
                            description: trip.description,
                            owner: trip.owner,
                            members: trip.members,
                            startDate: trip.startDate,
                            endDate: trip.endDate,
                            invitationCode: trip.invitationCode
                        }
                    })
                } else {
                    return res.status(200).json({
                        success: false,
                        error: 'can not find user with token provided'
                    });
                }
            })
    }
}

exports.inviteMembers = function (req, res) {
    // TODO: add email server
    if (req.body.invitationCode && req.body.emailList && req.body.tripId) {
        const message = req.body.message ? req.body.message.replace(/\n/g, '<br />') : '';
        let subject = req.body.subject;
        const link = `<p>Click <a href="https://www.gtplanner.com/trip/join?code=${req.body.invitationCode}">here </a>to join the group</p>`;
        const mailOptions = {
            from: 'gtplanner.com@gmail.com', // sender address
            to: req.body.emailList, // list of receivers
            subject: subject, // Subject line
            html: `<p>${message}</p><br />${link}`// body
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
            return res.status(200).json({
                success: true,
                numberOfEmails: req.body.emailList.length
            });
        });

    } else {
        return res.status(200).json({
            success: false
        });
    }
}

exports.getRecentTrips = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    console.log('getRecentTrips');
    console.log(req.decodedJWT.userId);
    User.findById(req.decodedJWT.userId, ).
    populate('trips').
    exec((err, user) => {
        if (err || !user) {
            return res.status(200).json({
                success: false,
                message: ' something went wrong'
            });
        } else {
            return res.status(200).json({
                success: true,
                trips: user.trips
            });
        }
    });
}

exports.addUserToTrip = function (req, res) {
    // TODO: add user to trip member list
    if (req.body.invitationCode && req.body.token) {
        console.log(req.body);
        jwt.verify(req.body.token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                if (!(decoded.iat && decoded.userId)) {
                    return res.status(403).send({
                        success: false,
                        message: 'No token provided.'
                    });
                    //iat is short for is available till
                } else if (decoded.iat < Date.now()) {
                    return res.status(498).send({
                        success: false,
                        message: 'Token expired.'
                    });
                } else {
                    // add user to the trip
                    Trip.findOne({ invitationCode: req.body.invitationCode }).exec((err, trip) => {
                        if (err) {
                            console.error(err);
                            return res.status(200).json({
                                success: false,
                                message: 'something went wrong'
                            });
                        }
                        if (trip) {

                            if (
                                trip.members.find((element) => { return element == decoded.userId; })
                            ) {
                                console.log('You are already in this trip');
                                return res.status(200).json({
                                    success: true,
                                });
                            } else {
                                let newMembers = trip.members.push(decoded.userId);
                                trip.members = newMembers;
                                trip.save((error) => {
                                    if (err) {
                                        return res.status(200).json({
                                            success: false,
                                            message: 'can not add this user to the trip'
                                        });
                                    } else {
                                        User.findById(decoded.userId, (error, user) => {
                                            if (err || !user) {
                                                return res.status(200).json({
                                                    success: false,
                                                    message: 'can not add this user to the trip'
                                                });
                                            } else {
                                                user.trips.push(trip._id);
                                                user.save((error) => {
                                                    if (error) {
                                                        return res.status(200).json({
                                                            success: false,
                                                            message: 'can not add this user to the trip'
                                                        });
                                                    } else {
                                                        return res.status(200).json({
                                                            success: true,
                                                        });
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        } else {    // if no trip match the invitation code
                            console.log('can not find the trip with invitationCode')
                            return res.status(200).json({
                                success: false,
                                message: 'can not find a trip with this invitation code'
                            });
                        }
                    });
                }
            }
        });

    } else {
        return res.status(200).json({
            success: false
        });
    }
}