import {Router,Request,Response} from "express";
import {authService} from "../service/auth-service";
import {LoginInputModel, UserAccountDbType} from "../models/userType";
import {jwtService} from "../application/jwt-service";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {existingEmailValidation, inputAuthValidation} from "../MiddleWares/validation-middleware";
import {
    authInputEmailValidation,
    authInputLoginValidation,
    authInputPasswordValidation
} from "../MiddleWares/auth-registration";
import {inputEmailValidationForResending} from "../MiddleWares/registration-email-resending";
import {emailManager} from "../managers/email_manager";
import {userRepository} from "../repositories/user_in_db_repository";

export const authRouter = Router({});
authRouter.post('/login',
    async (req:Request<{},{},LoginInputModel>,res:Response)=>{
   const checkResult:UserAccountDbType|null= await authService.checkLoginAndPassword(req.body.loginOrEmail!, req.body.password!)
    if(checkResult){
        const token = await jwtService.createJWT(checkResult)
        res.status(200).send({accessToken: token.data.token})
    }
    else{
        res.sendStatus(401)
    }
})
authRouter.get('/me',
    authMiddleWare,
    async (req,res)=>{
    try{
        const email = req.user?.accountData.email
        const login = req.user?.accountData.userName
        const userID = req.user?._id
        res.status(200).send({
            "email": email,
            "login": login,
            "userID": userID})
    }
    catch (e) {
        res.status(401).send('not found')
    }
})

authRouter.post('/registration',
    authInputEmailValidation,
    authInputPasswordValidation,
    authInputLoginValidation,
    inputAuthValidation,
    async (req:Request,res:Response)=>{
    try{
        await authService.createNewUser(req.body.password,req.body.login,req.body.email)
        res.sendStatus(204);
        return;
    }
    catch (e)
    {res.status(400).send(e);
    return;}
})
authRouter.post('/registration-confirmation',
    async (req:Request,res:Response)=>{
    try{
        if (await authService.checkConfirmCode(req.body.code)){
            res.status(404).send({ errorsMessages: [{ message: "Confirmation Code is not correct", field: "code" }] })
        }
        const confirmCode = await authService.confirmEmail(req.body.code)
        if(confirmCode) {
            res.sendStatus(204)
        }
        else {res.sendStatus(400)}
    }
    catch (e) {
        res.status(400).send(e)
    }
})
authRouter.post('/registration-email-resending',
    inputEmailValidationForResending,
    existingEmailValidation,
    async (req:Request,res:Response)=>{
    const user = await userRepository.findUserByLoginOrEmail(req.body.email)

        if(user) {
            if(user.emailConfirmation.isConfirmed){
                res.status(404).send({ errorsMessages: [{ message: "Confirmation Code already exist", field: "code" }] })
            }
            try {
                await emailManager.sendEmailConfirmationCode(user)
                res.sendStatus(204)
            } catch (e) {
                return e;
            }
        }
        else{
            res.sendStatus(404)
        }
})