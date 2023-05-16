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
import {DevisesChecker} from "../MiddleWares/devisesChecker";
import {sessionRepository} from "../repositories/devises_in_repository";


export const authRouter = Router({});
authRouter.post('/login',DevisesChecker,
    async (req:Request<{},{},LoginInputModel>,res:Response)=>{
   const checkResult:UserAccountDbType|null= await authService.checkLoginAndPassword(req.body.loginOrEmail, req.body.password)
    if(checkResult){
        const userId = checkResult._id
        const ip = req.ip
        const title = req.headers['user-agent']
        const deviceId = req.headers['user-agent']
        const timeNow:Date = new Date(Date.now())
        const token = await jwtService.createAccess(userId,ip.toString(),title!.toString(),deviceId!.toString(),timeNow)
        const refreshToken = await jwtService.createRefresh(userId,ip.toString(),title!.toString(),deviceId!.toString(),timeNow)
        await sessionRepository.createNewSession(userId,ip.toString(),title!.toString(),timeNow,deviceId!.toString())

        res.cookie('refreshToken', refreshToken,{ httpOnly:true,
            secure:true})
        res.status(200).send({accessToken: token.data.token})
        return;
    }}
)
authRouter.get('/me', authMiddleWare, async (req,res)=>{
    try{
        const email = req.user?.accountData.email
        const login = req.user?.accountData.userName
        const userID = req.user?._id
        res.status(200).send({
            "email": email,
            "login": login,
            "userId": userID})
        return;
    }
    catch (e) {
        res.status(401).send('not found')
        return;
    }
})

authRouter.post('/registration',DevisesChecker,
    authInputEmailValidation,
    authInputPasswordValidation,
    authInputLoginValidation,
    inputAuthValidation,
    async (req:Request,res:Response)=>{
    try{
        const user = await authService.createNewUser(req.body.password,req.body.login,req.body.email)
        res.status(204).send(user?.emailConfirmation.isConfirmed);
        return;
    }
    catch (e)
    {res.status(400).send(e);
    return;}
})
authRouter.post('/registration-confirmation',DevisesChecker,
    async (req:Request,res:Response)=>{
    const correctCode = await authService.checkExistCode(req.body.code)
        if(!correctCode)
        {
            res.status(400).send({ errorsMessages: [{ message: "Confirmation Code is not correct", field: "code" }] })
        return;
        }
        const confirmCode = await authService.checkIsConfirmCode(req.body.code)
        if(confirmCode)
        {
            res.status(400).send({ errorsMessages: [{ message: "Confirmation Code already confirm", field: "code" }] })
            return;
        }
        else{
           try {
                await authService.updateConfirmEmail(req.body.code);
               res.sendStatus(204)
            }
            catch (e){
               return e;
            }
        }
})
authRouter.post('/registration-email-resending',DevisesChecker,
    inputEmailValidationForResending,
    existingEmailValidation,
    async (req:Request,res:Response)=>{
    const user = await userRepository.findUserByLoginOrEmail(req.body.email)
            try {
                if(user) {
                    console.log(1,user.emailConfirmation.confirmationCode)
                    if(user.emailConfirmation.isConfirmed){
                        res.status(400).send({ errorsMessages: [{ message: "Confirmation Code already confirm", field: "email" }] });
                        return;
                    }
                        const updateUser:UserAccountDbType|null = await authService.updateUserConfirmCode(user);
                    console.log(2,updateUser?.emailConfirmation.confirmationCode)
                    if(!updateUser){
                        res.sendStatus(404)
                    }
                       else {
                        await emailManager.sendEmailConfirmationCode(updateUser)
                        res.sendStatus(204);
                        return;
                    }
            }
    else{
                    res.sendStatus(400);
                    return;
                }
    } catch (e) {
                return e;
            }
})
authRouter.post('/logout',
    async (req,res)=>{
        const cookie:string = req.cookies.refreshToken

        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const ip=checkToken?.ip
        const id=checkToken?.id
        const title=checkToken?.title
        const deviceId=checkToken?.deviceId
        const lastTokenCreatedAt=checkToken?.time
        if(checkToken)
        {
            const checkSession = await sessionRepository.findSessions(id,ip,title,lastTokenCreatedAt,deviceId)
            if(!checkSession){
                res.sendStatus(401);
                return;
            }
            else {
                await sessionRepository.deleteSession(id,ip, title, lastTokenCreatedAt, deviceId)
                res.clearCookie('refreshToken').sendStatus(204)
                return;
            }}
        })

authRouter.post('/refresh-token',
    async (req,res)=> {
        const cookie:string = req.cookies.refreshToken
        const timeNow:Date = new Date(Date.now())

        const checkToken = await jwtService.verifyUserIdByRefreshToken(cookie)
        const id = checkToken?.id
        const ip=checkToken?.ip
        const title=checkToken?.title
        const deviceId=checkToken?.deviceId
        const lastTokenCreatedAt=checkToken?.time
        if(checkToken)
        {
            const checkSession = await sessionRepository.findSessions(id,ip,title,lastTokenCreatedAt,deviceId)
            if(!checkSession){
                res.sendStatus(401);
                return;
            }
            const newToken = await jwtService.createAccess(id,ip.toString(),title.toString(),deviceId.toString(),timeNow)
            const refreshToken = await jwtService.createRefresh(id,ip.toString(),title.toString(),deviceId.toString(),timeNow)

            res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true
                })
                res.status(200).send({accessToken: newToken.data.token})
                return;
        }}
)