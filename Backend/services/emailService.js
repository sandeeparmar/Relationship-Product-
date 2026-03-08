import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: process.env.SEND_EMAIL_PORTNUMBER,
    secure: true, 
    auth: {
        user: process.env.SEND_EMAIL_USERNAME,
        pass: process.env.SEND_EMAIL_PASSWORD
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Notification from Telemedicine Platform" <${process.env.SEND_EMAIL_USERNAME}>`, 
            to, 
            subject, 
            text, 
            html 
        });
        
        return info;

    } catch (error) {
        console.error("Error sending email: ", error);
        return null;
    }
};
