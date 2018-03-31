exports.createTrip = function (req, res) {
    console.log(req.decodedJWT);
    //TODO implement
    // This is only dummy resonse
    if (req.body) {
        return res.status(200).json({
            success: true,
            tripInfo: {
                tripId: 'new12345',
                inviteCode: '123abc',
                tripName: 'New LA-Vegas 5 days summer trip',
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
        return res.status(400).json({
            success: false,
        });
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