import nodemailer from 'nodemailer'
export const emailAdapter = {
      sendConfirmCode(email:string, subject:string, message:string){
        let transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port: 465,
            secure:true,
            auth:{
                user:'dsxxz92@gmail.com',
                pass :process.env.email_password
            }
        });
        return transporter.sendMail({
            from: 'dsxxz92@gmail.com',
            to:email,
            subject:subject,
            html:message
        });
    },
    sendRecoveryCode(email:string, subject:string, message:string) {
        let transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port: 465,
            secure:true,
            auth:{
                user:'dsxxz92@gmail.com',
                pass :process.env.email_password
            }
        });
        return transporter.sendMail({
            from: 'dsxxz92@gmail.com',
            to:email,
            subject:subject,
            html:message
        });
    }
}