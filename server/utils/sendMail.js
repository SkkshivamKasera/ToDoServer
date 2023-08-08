import { createTransport } from 'nodemailer'

export const sendMail = async (email, subject, text) => {
    const transport = createTransport({
        host: process.env.SMPT_HOST,
        port: 465,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.MAIL_SERVICE,
            pass: process.env.MAIL_PASSWORD
        }
    })

    await transport.sendMail({
        from: process.env.MAIL_SERVICE,
        to: email,
        subject,
        text
    })
}