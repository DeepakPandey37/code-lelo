const nodeMailer = require("nodemailer");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

const mailSender = async (email, title, otp) => {
    try {
        // Create transport configuration
        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        // Use the OTP template to generate the email body
        const body = otpTemplate(otp); // The OTP will be dynamically inserted into the template

        // Send the email
        let info = await transporter.sendMail({
            from: 'StudyNotion || Code Help - by Deepak',
            to: `${email}`,
            subject: `${title}`,
            html: body, // Use the generated body from the OTP template
        });

        console.log("Email sent successfully:", info);

        return info;
    } catch (error) {
        console.log("Error at nodeMailer:", error); // Handle errors
    }
}

module.exports = mailSender;

