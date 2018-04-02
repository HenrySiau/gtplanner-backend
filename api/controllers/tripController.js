var Trip = require('../../models/tripModel').Trip;
var mongoose = require('mongoose');
var config = require('../../config');

const strip = (str) => {
    if (str) {
        return str.replace(/^\s+|\s+$/g, '');
    } else {
        return '';
    }
}

// generate random string
const randomString = function (length) {
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
    let code = randomString(8);
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
                    startDate: req.body.startDate,
                    endDate: req.body.endDate
                };
                Trip.create(tripData, function (err, newTrip) {
                    if (err) {
                        console.log(err);
                        return res.status(200).json({
                            success: false,
                            errors: err.errors
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            newTrip: newTrip
                        });
                    }
                })
        }

        asyncCall();

        // let generateInvitationCodePromise = new Promise(
        //     (resolve, reject) => {
        //         resolve(generateInvitationCode());
        //             // console.log('generateInvitationCode');
        //             // let code = randomString(8);
        //             // console.log('generateInvitationCode: ' + code);
        //             // Trip.findOne({ invitationCode: code }).exec(
        //             //     (err, trip) => {
        //             //         if (err) console.error(err);
        //             //         if (trip) {
        //             //             return generateInvitationCode();
        //             //         } else {
        //             //             resolve(code)
        //             //         }
        //             //     }
        //             // )
        //     }
        // );
        // generateInvitationCodePromise.then(
        //     (invitationCode) => {
        //         console.log('invitationCode: ' + invitationCode)
        //         const tripData = {
        //             title: strip(req.body.tripName),
        //             description: strip(req.body.description),
        //             owner: req.decodedJWT.userId,
        //             invitationCode: invitationCode,
        //             members: [req.decodedJWT.userId],
        //             startDate: req.body.startDate,
        //             endDate: req.body.endDate
        //         };

        //         Trip.create(tripData, function (err, newTrip) {
        //             if (err) {
        //                 console.log(err);
        //                 return res.status(200).json({
        //                     success: false,
        //                     errors: err.errors
        //                 });
        //             } else {
        //                 return res.status(200).json({
        //                     success: true,
        //                     newTrip: newTrip
        //                 });
        //             }
        //         })
        //     }
        // ).catch(
        //     (reason) => {
        //         console.error(reason);
        //     }
        // )

        // Promise.resolve()
        // .then(
        //     function generateInvitationCode(){
        //         console.log('generateInvitationCode');
        //         let code = randomString(1);
        //         console.log('code: ' + code);
        //         Trip.findOne({invitationCode: code}).exec(
        //             (err, trip) => {
        //                 if(err) console.error(err);
        //                 if(trip){
        //                     var promise = Promise.resolve().then(
        //                         function(){
        //                             return(generateInvitationCode());
        //                         }
        //                     )
        //                     return promise;
        //                 }else{
        //                     console.log('return code: ' + code);
        //                     return code 
        //                 }
        //             }
        //         ).then(
        //             (code) => {
        //                 console.log('then after exec, code: :' + code);
        //             }
        //         )
        //     }
        // ).then(
        //     (code) =>{
        //         console.log('then: code=' + code);
        //     }
        // )
        // var tripData = {
        //     title: strip(req.body.tripName),
        //     description: strip(req.body.description),
        //     owner: req.decodedJWT.userId,
        //     invitationCode: generateInvitationCode(),
        //     members: [req.decodedJWT.userId],
        //     startDate: req.body.startDate,
        //     endDate: req.body.endDate
        // };
        // Trip.create(tripData, function (err, newTrip) {
        //     if (err) {
        //         console.log(err);
        //         return res.status(200).json({
        //             success: false,
        //             errors: err.errors
        //         });
        //     } else {
        //         return res.status(200).json({
        //             success: true,
        //             newTrip: newTrip
        //         });
        //     }
        // })
    }
}
}

exports.verifyInvitationCode = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    if (req.body.inviteCode === '123abc') {
        return res.status(200).json({
            success: true,
            tripName: 'LA Trip'
        });
    }
    else {
        return res.status(200).json({
            success: false,
        });
    }
}

exports.tripInfo = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    if (req.body) {
        if (req.query.tripId) {
            return res.status(200).json({
                success: true,
                tripInfo: {
                    tripId: '12345',
                    inviteCode: '123abc',
                    tripName: req.query.tripId + ' LA-Vegas 5 days summer trip',
                    members: [
                        {
                            userId: 'a123',
                            userName: 'Henry',
                            imgUrl: '/img/henry.jpg'
                        },
                        {
                            userId: 'a124',
                            userName: 'Sophia',
                            imgUrl: '/img/sophia.jpg'
                        },
                        {
                            userId: 'a125',
                            userName: 'Kelvin ',
                            imgUrl: '/img/kelvin.jpg'
                        },
                    ]
                }
            });
        } else {
            // TODO fetch data base for defaultTrip
            // then return last visited active trip
            return res.status(200).json({
                success: true,
                tripInfo: {
                    tripId: '12345',
                    inviteCode: '123abc',
                    tripName: 'Default LA-Vegas 5 days summer trip',
                    members: [
                        {
                            userId: 'a123',
                            userName: 'Henry',
                            imgUrl: '/img/henry.jpg'
                        },
                        {
                            userId: 'a124',
                            userName: 'Sophia',
                            imgUrl: '/img/sophia.jpg'
                        },
                        {
                            userId: 'a125',
                            userName: 'Kelvin ',
                            imgUrl: '/img/kelvin.jpg'
                        },
                    ]
                }
            });
        }

    } else {
        return res.status(400).json({
            success: false,
        });
    }
}

exports.getInviteCode = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    if (req.body) {
        if (req.query.tripId) {
            // TODO verify if user belong to this trip
            console.log(req.decodedJWT);
            return res.status(200).json({
                success: true,
                inviteCode: '123abc'
            });
        } else {
            return res.status(200).json({
                success: false,
            });
        }
    } else {
        return res.status(400).json({
            success: false,
        });
    }
}

exports.inviteMembers = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    if (req.body) {
        if (req.body.inviteCode && req.body.emailList) {
            // TODO: sent email with inviteCode
            return res.status(200).json({
                success: true
            });
        } else {
            return res.status(200).json({
                success: false
            });
        }

    } else {
        return res.status(400).json({
            success: false,
        });
    }
}

exports.getRecentTrips = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    console.log('getRecentTrips');
    return res.status(200).json({
        success: true,
        trips: [
            {
                tripName: 'Trip One',
                tripId: '123'
            },
            {
                tripName: 'Trip two',
                tripId: '124'
            },
            {
                tripName: 'Trip three',
                tripId: '125'
            },
        ]
    });
}