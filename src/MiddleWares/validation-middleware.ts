import {NextFunction,Request, Response} from "express";
const {validationResult} = require('express-validator');


export const myValidationResult = validationResult.withDefaults({
    formatter: (error:any) => {
        return { message: error.msg, field: error.param };
    }
})
export const myValidationResultLike = validationResult.withDefaults({
    formatter: (error:any) => {
        return { message: error.msg, field: "likeStatus" };
    }
})
export const inputBlogsAndPostsValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return next();
})
export const inputUserValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return next();
})
export const inputCommentsValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return next();
})

export const inputAuthValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return next();
})

export const existingEmailValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return next();
})
export const inputNewPasswordValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResult(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return next();
})
export const inputLikesValidation = ((req:Request, res:Response, next: NextFunction)=> {
    const errorsMessages = myValidationResultLike(req)
    if (!errorsMessages.isEmpty()) {
        return res.status(400).json({ errorsMessages: errorsMessages.array({onlyFirstError: true}) });
    }
    else return  next();
})