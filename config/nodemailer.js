// config/nodemailer.js
import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';

export const accountEmail = 'kshitijalandge25@gmail.com';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: accountEmail,
        pass: EMAIL_PASSWORD,
    },
});

// (optional) if you ever want default import style:
// export default transporter;
