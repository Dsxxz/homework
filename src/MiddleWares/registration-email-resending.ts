import {userRepository} from "../repositories/user_in_db_repository";
import {UserAccountDbType} from "../models/userType";

const {body} = require('express-validator');


export const inputEmailValidationForResending = body('email').trim()
    .custom(async (value:string)=>{
        const existingEmail:UserAccountDbType|null = await userRepository.findUserByLoginOrEmail(value)
        if(!existingEmail){
            throw new Error('Email do not exist')
        }
        else{
            return true;
        }
    })

