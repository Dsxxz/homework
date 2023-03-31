import {emailAdapter} from "../adapters/email_adapter";
import {UserAccountDbType} from "../models/userType";
export const emailManager = {
    async sendEmailRecovery(user:UserAccountDbType){
        await emailAdapter.sendEmail(user.accountData.email,'password recovery',
            '<h1>Thank for your registration</h1>\n' +
            `<p>${user.emailConfirmation.confirmationCode} To finish registration please follow the link below:\n` +
            `<a href=\"https://somesite.com/confirm-email?code=${user.emailConfirmation.confirmationCode}\">complete registration</a>\n` +
            '</p>')

    }
}