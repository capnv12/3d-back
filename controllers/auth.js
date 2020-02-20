const User = require('../models/user');
// const Blog = require('../models/blog');
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
// const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash')

// const sgMail = require('@sendgrid/mail')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.preSignup = (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Adresa de email a fost deja folosita'
            })
        }
        const token = jwt.sign({ email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Activare cont`,
            html: `
            <p>Click pe link pentru a activa contul</p>
            <p>${process.env.CLIENT_URL}/autentificare/activare/${token}</p>
            <hr />
            <p>Accest email poate contine infromatii senzitive</p>
            <p>https://store.dronshop.ro</p>
        `
        };
        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `Email has been sent to ${email}. Follow the instruction to activate your account`
            })
        })
    })
};

exports.signup = (req, res) => {
    // console.log(req.body);
    User.findOne({ email: req.body.email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Adresa de email a fost deja folosita'
            });
        }

        const { email, password } = req.body;
        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profil/${username}`;

        let newUser = new User({ email, password, profile, username });
        newUser.save((err, success) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            // res.json({
            //     user: success
            // });
            res.json({
                message: 'Inregistrare reusita! Autentifica-te.'
            });
        });
    });
};
// exports.signup = (req, res) => {
//     const token = req.body.token;
//     if (token) {
//         jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
//             if (err) {
//                 return res.status(401).json({
//                     error: 'Link expirat. Inregistreaza-te din nou'
//                 });
//             }

//             const { email, password } = jwt.decode(token);
//             console.log(token)
//             let username = shortId.generate();
//             let profile = `${process.env.CLIENT_URL}/profil/${username}`;

//             const user = new User({ email, password, profile, username });
//             user.save((err, user) => {
//                 if (err) {
//                     return res.status(401).json({
//                         error: errorHandler(err)
//                     });
//                 }
//                 return res.json({
//                     message: 'Te-ai inregistrat cu succes. Acum te poti autentifica in noul tau cont'
//                 });
//             });
//         });
//     } else {
//         return res.json({
//             message: 'Ceva nu a mers bine. Incearca din nou'
//         });
//     }
// };

exports.signin = (req, res) => {
    const { email, password } = req.body;
    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Nu exista utilizator cu aceasta adresa de email. Te rugam inregistreaza-te.'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Adresa de email si parola nu corespund.'
            });
        }
        // generate a token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { expiresIn: '1d' });
        const { _id, username, email, role } = user;
        return res.json({
            token,
            user: { _id, username, email, role }
        });
    });
};

exports.signout = (req, res) => {
    res.clearCookie('token');
    res.json({
        message: 'Dezautentificare cu success'
    });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET // req.user
});

exports.authMiddleware = (req, res, next) => {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Utilizatorul nu a putut fi gasit'
            });
        }
        req.profile = user;
        next();
    });
};

exports.adminMiddleware = (req, res, next) => {
    const adminUserId = req.user._id;
    User.findById({ _id: adminUserId }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Utilizatorul nu a putut fi gasit'
            });
        }

        if (user.role !== 1) {
            return res.status(400).json({
                error: 'Resurse admin. Acces interzis.'
            });
        }

        req.profile = user;
        next();
    });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({
                error: 'Utilizatorul nu a putut fi gasit'
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        // email
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Resetare Parola`,
            html: `
            <p>Click pe link pentru a reseta parola:</p>
            <p>${process.env.CLIENT_URL}/autentificare/parola/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://seoblog.com</p>
        `
        };
        // populating the db > user > resetPasswordLink
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ error: err });
            } else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: `Un email a fost trimis la adresa ${email}. Urmeaza instructiunile din email pentru a reseta parola.`
                    });
                });
            }
        });
    });
};

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    error: 'Link expirat. Incearca din nou'
                });
            }
            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(401).json({
                        error: 'Ceva nu a mers bine. Incearca din nou'
                    });
                }
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: err
                        });
                    }
                    res.json({
                        message: `Parola schimbata cu succes! Acum te poti loga cu noua parola`
                    });
                });
            });
        });
    }
};