import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Assuming Gmail based on port 465 and common usage
    port: process.env.SEND_EMAIL_PORTNUMBER,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SEND_EMAIL_USERNAME,
        pass: process.env.SEND_EMAIL_PASSWORD
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Hospital Tracker" <${process.env.SEND_EMAIL_USERNAME}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        // Don't throw to prevent blocking the main flow, just log it
        return null;
    }
};
