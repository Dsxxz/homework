import {emailAdapter} from "../adapters/email_adapter";
import {UserAccountDbType} from "../models/userType";
export const emailManager = {
     sendEmailConfirmationCode(user:UserAccountDbType){
          emailAdapter.sendConfirmCode(user.accountData.email,'password confirm',
            '<h1>Thank for your registration</h1>\n' +
            `<p>${user.emailConfirmation.confirmationCode} To finish registration please follow the link below:\n` +
            `<a href="https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}">complete registration</a>\n` +
            '</p>')
        return;
    },
    sendRecoveryCode(user:UserAccountDbType) {
        emailAdapter.sendConfirmCode(user.accountData.email, 'password recovery',
            `<h1>Password recovery</h1>` +
        `<p>${user.emailConfirmation.confirmationCode} To finish password recovery please follow the link below:\n` +
           `<a href='https://somesite.com/password-recovery?recoveryCode=${user.emailConfirmation.confirmationCode}'>recovery password</a>\n` +
        `</p>`)
}}