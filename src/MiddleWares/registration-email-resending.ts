import {UserAccountDbType} from "../models/userType";
import {AuthService} from "../service/auth-service";

const {body} = require('express-validator');
const authService= new AuthService()

export const inputEmailValidationForResending = body('email').trim()
    .custom(async (value:string)=>{
        const existingEmail:UserAccountDbType|null = await authService.findUserByLoginOrEmail(value)
        if(!existingEmail){
            throw new Error('Email do not exist')
        }
        else{
            return true;
        }
    })

