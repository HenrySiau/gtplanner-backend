exports.createTrip = function (req, res) {
    console.log(req.decodedJWT);
    //TODO implement
    // This is only dummy resonse
    if (req.body) {
        return res.status(200).json({
            success: true,
            inviteCode: '123abc'
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
                    tripName: 'LA-Vegas 5 days summer trip',
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
                    tripName: 'LA-Vegas 5 days summer trip',
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
            return res.status(400).json({
                success: false,
            });
        }
    } else {
        return res.status(400).json({
            success: false,
        });
    }
}