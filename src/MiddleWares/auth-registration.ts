import {userRepository} from "../repositories/user_in_db_repository";

const {body} = require('express-validator');


const regexLogin = new RegExp("^[a-zA-Z0-9_-]*$")
export const authInputLoginValidation = body('login').trim().isLength({min:3, max:10})
    .withMessage('Login should be from 3 to 10 symbols').bail()
    .matches(regexLogin).withMessage('Login incorrect').bail()
    .custom(async (value:string)=>{
        const existingLogin = await userRepository.findUserByLoginOrEmail(value)
        if(existingLogin){
            throw new Error('User already exist')
        }
        else{
            return true;
        }
    })

const regexEmail= new RegExp("^[\\w-\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");

export const authInputEmailValidation = body('email').trim()
    .matches(regexEmail).withMessage('email incorrect').bail()
    .custom(async (value:string)=>{
        const existingEmail = await userRepository.findUserByLoginOrEmail(value)
        if(existingEmail){
            throw new Error('User already exist')
        }
        else{
            return true;
        }
    })

export const authInputPasswordValidation = body('password').trim()
    .isLength({min:6, max:20}).withMessage('Password should be from 6 to 20 symbols')

