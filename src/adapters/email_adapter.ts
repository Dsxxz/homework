import nodemailer from 'nodemailer'
export const emailAdapter = {
    async sendEmail(email:string, subject:string,message:string){
        let transporter = nodemailer.createTransport({
            host:'smtp.mail.ru',
            port: 465,
            secure:true,
            auth:{
                user:'dsxxz78@mail.ru',
                pass:process.env.email_password
            }
        });
        return await transporter.sendMail({
            from: 'dsxxz78@mail.ru',
            to:email,
            subject:subject,
            html:message
        });
    }
}