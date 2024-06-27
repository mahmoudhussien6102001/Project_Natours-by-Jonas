const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'skyla.williamson30@ethereal.email',
            pass: 'GmV8jc4g5EjJAadFfK'
        }
    });

    // 2) Define email options
    const emailOptions = {
        from: 'Mahmoud Awad <awadppp389@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Actually send the email
    await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
