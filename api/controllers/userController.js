var User = require('../../models/userModel').User;
var mongoose = require('mongoose'),
    jwt = require('jsonwebtoken');
    // User = mongoose.model('User');

exports.register = function (req, res) {
    if (!req.body) return res.sendStatus(400);
    if (req.body.email &&
        req.body.userName &&
        req.body.password &&
        req.body.passwordConf) {
        var userData = {
            email: req.body.email,
            userName: req.body.userName,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
        };
        //use schema.create to insert data into the db
        User.create(userData, function (err) {
            if (err) {
                console.error('Can not create User name: ' + req.body.username);
                res.send(err);
            } else {
                return res.send('added user');
            }
        });

    } else {
        // user registration form missing information
        res.redirect('/newuser');
    }
};

exports.signIn = function (req, res) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (err, user) {
            if (err || !user) {
                console.error('err:' + err);
                return res.status(401).json({ message: 'Authentication failed. Wrong password.' });
            } else {
                req.session.userId = user._id;
                req.session.userName = user.userName;
                res.json({token: jwt.sign({ email: user.email, fullName: user.fullName, _id: user._id}, 'RESTFULAPIs')});
            }
        });
    }
};

exports.loginRequired = function (req, res, nex) {
    if (req.user) {
        next();
      } else {
        return res.status(401).json({ message: 'Unauthorized user!' });
      }
};