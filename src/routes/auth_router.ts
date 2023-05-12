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
import {token_repository} from "../repositories/token_repository";
import {ObjectId} from "mongodb";


export const authRouter = Router({});
authRouter.post('/login',
    async (req:Request<{},{},LoginInputModel>,res:Response)=>{
   const checkResult:UserAccountDbType|null= await authService.checkLoginAndPassword(req.body.loginOrEmail!, req.body.password!)
    if(checkResult){
        const token = await jwtService.createAccess(checkResult._id)
        const refreshToken = await jwtService.createRefresh(checkResult._id)
        await token_repository.createList(checkResult._id,refreshToken,token.data.token)
        res.cookie('refreshToken', refreshToken,{ httpOnly:true,
            secure:true})
        res.status(200).send({accessToken: token.data.token})
        return;
    }
})
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

authRouter.post('/registration',
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
authRouter.post('/registration-confirmation',
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
authRouter.post('/registration-email-resending',
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
        if(!req.cookies.refreshToken) {
            res.sendStatus(401)
            return;
        }
        const verifyRefreshRepo:ObjectId|null  = await token_repository.verifyTokens(req.cookies.refreshToken)
        const verifyRefreshInJwt:ObjectId|null = await jwtService.verifyUserIdByRefreshToken(req.cookies.refreshToken)

        if (verifyRefreshRepo===verifyRefreshInJwt){
            await token_repository.destroyTokens(verifyRefreshRepo!)
            res.sendStatus(204)
            return;
        }
        else {
            res.sendStatus(401)
        }
        })
authRouter.post('/refresh-token',
    async (req,res)=> {
            if(!req.cookies.refreshToken) {
                res.sendStatus(401)
                return;
                 }
        const cookie:string = req.cookies.refreshToken
        const verifyRefreshInTokenRepo:ObjectId|null = await token_repository.verifyTokens(cookie)
        const verifyRefreshInJwt:ObjectId|null = await jwtService.verifyUserIdByRefreshToken(cookie)
        if(verifyRefreshInTokenRepo!==verifyRefreshInJwt){
            res.sendStatus(401)
            return;
        }
        console.log('cookie', req.cookies.refreshToken)

            const token = await jwtService.createAccess(verifyRefreshInJwt!)
            const refreshToken = await jwtService.createRefresh(verifyRefreshInJwt!)
            await token_repository.changeTokensList(verifyRefreshInJwt!,refreshToken,token.data.token)

            res.cookie('refreshToken', refreshToken,{ httpOnly:true,
                secure:true})
            res.status(200).send({accessToken: token.data.token})
            return;

    }
)