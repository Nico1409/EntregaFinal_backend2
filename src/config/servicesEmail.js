
import nodemailer from 'nodemailer'


const transport = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: 'nicolas140902@gmail.com',
        pass: 'zubh zgfh rfyr rlvd'
    }
})

export default transport;
