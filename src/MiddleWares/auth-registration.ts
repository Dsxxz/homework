import {userRepository} from "../repositories/user_in_db_repository";
import {UserAccountDbType} from "../models/userType";

const {body} = require('express-validator');


export const authInputLoginValidation = body('login').trim()
    .isLength({min:3, max:10})
    .withMessage('Login should be from 3 to 10 symbols')
    .matches(new RegExp("^[a-zA-Z0-9_-]*$")).withMessage('Login incorrect')
    .custom(async (value:string)=>{
        const existingLogin:UserAccountDbType|null = await userRepository.findUserByLoginOrEmail(value)
        if(existingLogin){
            throw new Error('Login already exist')
        }
        else{
            return true;
        }
    })

export const authInputEmailValidation = body('email').trim()
    .matches(new RegExp("^[\\w-\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")).withMessage('email incorrect')
    .custom(async (value:string)=>{
        const existingEmail:UserAccountDbType|null = await userRepository.findUserByLoginOrEmail(value)
        if(existingEmail){
            throw new Error('Email already exist')
        }
        else{
            return true;
        }
    })

export const authInputPasswordValidation = body('password').trim()
    .isLength({min:6, max:20}).withMessage('Password should be from 6 to 20 symbols')

