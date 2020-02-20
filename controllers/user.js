const User = require('../models/user');
const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        req.profile = user;
        next();
    });
};

exports.read = (req, res) => {
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile)

}
exports.update = (req, res) => {
    User.findOneAndUpdate({ _id: req.profile._id }, { $set: req.body }, { new: true, useFindAndModify: false }, (err, user) => {
        if (err) {
            return res.status(400).json({
                error: 'Nu esti autorizat pentru a face aceste operatiuni'
            })
        }
        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
    })
}
