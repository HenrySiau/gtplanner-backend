exports.createTrip = function (req, res) {
    console.log(req.decodedJWT);
    //TODO implement
    // This is only dummy resonse
    return res.status(200).json({
        success: true,
        inviteCode: '123abc'
    });
}

exports.verifyInvitationCode = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    console.log(req.decodedJWT);
    return res.status(200).json({
        success: true,
        tripName: 'LA Trip',
        tripOwner: req.decodedJWT.userId
    });
}