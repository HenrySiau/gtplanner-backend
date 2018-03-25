exports.createTrip = function (req, res) {
    console.log(req.decodedJWT);
    //TODO implement
    // This is only dummy resonse
 if (req.body){
    return res.status(200).json({
        success: true,
        inviteCode: '123abc'
    });
}else{
    return res.status(400).json({
        success: false,
    });
}
}

exports.verifyInvitationCode = function (req, res) {
    //TODO implement
    // This is only dummy resonse
    if(req.body.code === '123abc'){
    return res.status(200).json({
        success: true,
        tripName: 'LA Trip',
        tripOwner: req.decodedJWT.userId
    });
}
else{
    return res.status(400).json({
        success: false,
    });
}
}