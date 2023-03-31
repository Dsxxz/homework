import nodemailer from 'nodemailer'
export const emailAdapter = {
    async sendEmail(email:string, subject:string,message:string){
        let transporter = nodemailer.createTransport({
            host:"smtp.gmail.com",
            port: 465,
            secure:true,
            auth:{
                user:'dsxxz92@gmail.com',
                pass :process.env.email_password
            }
        });
        return await transporter.sendMail({
            from: 'dsxxz92@gmail.com',
            to:email,
            subject:subject,
            html:message
        });
    }
}