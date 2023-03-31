import {Router,Request,Response} from "express";
import {authService} from "../service/auth-service";
import {LoginInputModel, UserAccountDbType} from "../models/userType";
import {jwtService} from "../application/jwt-service";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {
    userInputEmailValidation,
    userInputLoginValidation,
    userInputPasswordValidation
} from "../MiddleWares/input-user-validation";
import {inputEmailValidation} from "../MiddleWares/validation-middleware";
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
authRouter.get('/me',authMiddleWare,async (req,res)=>{
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
authRouter.post('/registration',userInputEmailValidation,userInputLoginValidation,userInputPasswordValidation,inputEmailValidation, async (req:Request,res:Response)=>{
    try{
        const existLogin = await userRepository.findUserByLoginOrEmail(req.body.login)
        const existEmail = await userRepository.findUserByLoginOrEmail(req.body.email)
        if(existLogin){
            res.status(400).send({"errorsMessages":[{"message":"already exist","field":"login"}]})
        }
        if(existEmail){
            res.status(400).send({"errorsMessages":[{"message":"already exist","field":"email"}]})
        }

    const user = await authService.createNewUser(req.body.login,req.body.email,req.body.password)
        res.status(204).send(user)
    }
    catch (e)
    {res.send(e)}
})
authRouter.post('/registration-confirmation', userInputEmailValidation,inputEmailValidation, async (req:Request,res:Response)=>{
    const result = await authService.confirmEmail(req.body.code)
    if (result) {
        res.status(204).send()
    }else {
        res.sendStatus(400)
    }
})
authRouter.post('/registration-email-resending',userInputEmailValidation,inputEmailValidation, async (req:Request,res:Response)=>{
    const result = await authService.confirmEmail(req.body.code)
    if (result) {
        res.sendStatus(204)
    }else {
        res.status(400).send({"errorsMessages":[{"message":"string","field":"string"}]})
    }
})