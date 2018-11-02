const nodemailer = require('nodemailer');

let account = {
	user: "passreset.shopmore@gmail.com",
	pass: "boguspassword"
}

exports.sendPassResetEmail = function(link, email_id) {
	let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: account.user, 
            pass: account.pass
        }
    });

    let mailOptions = {
        from: 'no-reply@shopmore.com', 
        to: email_id, 
        subject: 'Reset your password', 
        text: 'Use this link to reset password: ' + link, 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
};

exports.sendActivationEmail = function(link, email_id) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: account.user, 
            pass: account.pass
        }
    });

    let mailOptions = {
        from: 'no-reply@shopmore.com', 
        to: email_id, 
        subject: 'Reset your password', 
        text: 'Use this link to activate account: ' + link, 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
}