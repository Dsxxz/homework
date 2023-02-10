const {body} = require('express-validator');


const regexLogin = new RegExp("^[a-zA-Z0-9_-]*$")
export const userInputLoginValidation = body('login').trim().isLength({min:3, max:10})
    .withMessage('Login should be from 3 to 10 symbols')
    .matches(regexLogin).withMessage('Login incorrect')

const regexEmail= new RegExp("^[\\w-\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");

export const userInputEmailValidation = body('email').trim()
    .matches(regexEmail).withMessage('email incorrect');

export const userInputPasswordValidation = body('password').trim()
    .isLength({min:6, max:20}).withMessage('Password should be from 6 to 20 symbols')
