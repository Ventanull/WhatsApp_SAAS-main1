require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        console.log('Testing SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection successful!');

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // send to self
            subject: 'SMTP Test',
            text: 'Test message from server',
        });

        console.log('Message sent:', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    }
};

testEmail();
