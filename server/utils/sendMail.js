import { createTransport } from 'nodemailer'

export const sendMail = async (email, subject, text) => {
    const transport = createTransport({
        host: process.env.SMPT_HOST,
        port: 465,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: "shivamkasera2003@gmail.com",
            pass: "yculdafxqxautbca"
        }
    })

    await transport.sendMail({
        from: "shivamkasera2003@gmail.com",
        to: email,
        subject,
        text
    })
}