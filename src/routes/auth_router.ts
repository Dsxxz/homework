import {Router,Request,Response} from "express";
import {authService} from "../service/auth-service";
import {LoginInputModel, UserAccountDbType} from "../models/userType";
import {jwtService} from "../application/jwt-service";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {userInputEmailValidation} from "../MiddleWares/input-user-validation";
import {inputAuthValidation, inputEmailValidation} from "../MiddleWares/validation-middleware";
import {userRepository} from "../repositories/user_in_db_repository";
import {
    authInputEmailValidation,
    authInputLoginValidation,
    authInputPasswordValidation
} from "../MiddleWares/auth-registration";

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
    authInputLoginValidation,
    authInputEmailValidation,
    authInputPasswordValidation,
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
      await authService.confirmEmail(req.body.code)
        res.sendStatus(204)
    }
    catch (e) {
        res.status(400).send(e)
    }
})
authRouter.post('/registration-email-resending',
    userInputEmailValidation,
    inputEmailValidation,
    async (req:Request,res:Response)=>{
        try{
            await authService.confirmEmail(req.body.code)
            res.sendStatus(204)
        }
        catch (e) {
            res.status(400).send(e)
        }
})