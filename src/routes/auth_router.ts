import {Request, Response, Router} from "express";
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
import {ConnectionsCountChecker} from "../MiddleWares/connectionsCountChecker";
import {ObjectId} from "mongodb";
import {devicesService} from "../service/devices_service";


export const authRouter = Router({});

authRouter.post('/login', ConnectionsCountChecker,
    async (req: Request<{}, {}, LoginInputModel, {}>, res: Response) => {
        const checkResult: UserAccountDbType | null = await authService.checkLoginAndPassword(req.body.loginOrEmail, req.body.password)

        if (checkResult) {
            const userId: ObjectId = checkResult._id
            const ip = req.ip
            const title = req.headers['user-agent'] || 'custom UA'
            const newDeviceId = new ObjectId()

            const accessToken = await jwtService.createAccess(userId)
            const refreshToken = await jwtService.createRefresh(userId, newDeviceId)
            const timeTokenData = await jwtService.getLastActiveDateFromRefreshToken(refreshToken)

            const checkSessions = await devicesService.checkSessions(userId,ip,title)
            if(checkSessions){
                await devicesService.updateSession(timeTokenData,checkSessions.deviceId )
            }
            else{
                await devicesService.createNewSession(userId,ip,title,timeTokenData,newDeviceId)
            }

            res.cookie('refreshToken', refreshToken, {
               httpOnly: true,
                 secure: true
             })
             res.status(200).send({accessToken: accessToken})
            return;
        }
        else {
            res.sendStatus(401);
            return;
        }}
)
authRouter.get('/me', authMiddleWare, async (req, res) => {
    try {
        const token = req.headers.authorization!.split(' ')[1]
        const userID = await jwtService.verifyUserIdByAccessToken(token)
        const user = await authService.findUsersById(userID)
        if(user){
            res.status(200).send({
                "email": user.accountData.email,
                "login": user.accountData.userName,
                "userId": userID
            })
            return;
        }
        else{
            res.status(401).send('not found')
            return;
        }
    } catch (e) {
        res.status(401).send('not found')
        return;
    }
})

authRouter.post('/registration', ConnectionsCountChecker,
    authInputEmailValidation,
    authInputPasswordValidation,
    authInputLoginValidation,
    inputAuthValidation,
    async (req: Request, res: Response) => {
        try {
            const user = await authService.createNewUser(req.body.password, req.body.login, req.body.email)
            res.status(204).send(user?.emailConfirmation.isConfirmed);
            return;
        } catch (e) {
            res.status(400).send(e);
            return;
        }
    })

authRouter.post('/registration-confirmation', ConnectionsCountChecker,
    async (req: Request, res: Response) => {
        const correctCode = await authService.checkExistCode(req.body.code)
        if (!correctCode) {
            res.status(400).send({errorsMessages: [{message: "Confirmation Code is not correct", field: "code"}]})
            return;
        }
        const confirmCode = await authService.checkIsConfirmCode(req.body.code)
        if (confirmCode) {
            res.status(400).send({errorsMessages: [{message: "Confirmation Code already confirm", field: "code"}]})
            return;
        } else {
            try {
                await authService.updateConfirmEmail(req.body.code);
                res.sendStatus(204)
            } catch (e) {
                return e;
            }
        }
    })

authRouter.post('/registration-email-resending', ConnectionsCountChecker,
    inputEmailValidationForResending,
    existingEmailValidation,
    async (req: Request, res: Response) => {
        const user = await userRepository.findUserByLoginOrEmail(req.body.email)
        try {
            if (user) {
                console.log(1, user.emailConfirmation.confirmationCode)
                if (user.emailConfirmation.isConfirmed) {
                    res.status(400).send({
                        errorsMessages: [{
                            message: "Confirmation Code already confirm",
                            field: "email"
                        }]
                    });
                    return;
                }
                const updateUser: UserAccountDbType | null = await authService.updateUserConfirmCode(user);
                console.log(2, updateUser?.emailConfirmation.confirmationCode)
                if (!updateUser) {
                    res.sendStatus(404)
                } else {
                    await emailManager.sendEmailConfirmationCode(updateUser)
                    res.sendStatus(204);
                    return;
                }
            } else {
                res.sendStatus(400);
                return;
            }
        } catch (e) {
            return e;
        }
    })

authRouter.post('/logout',
    async (req, res) => {
        try{
            const cookie= req.cookies.refreshToken;
            const refresh = await jwtService.verifyUserIdByRefreshToken(cookie)
            const dateRefresh = await jwtService.getLastActiveDateFromRefreshToken(cookie)
            const checkTimeFromRefresh = await devicesService.findLastActiveDate(dateRefresh)

        if (refresh && checkTimeFromRefresh) {
            await devicesService.deleteOneSessionById(checkTimeFromRefresh!.deviceId)
            res.clearCookie('refreshToken').sendStatus(204)
            return;
        }
        else {
                res.sendStatus(401);
                return;
            }
        }
        catch (e) {
            res.send(e)
        }
    })

authRouter.post('/refresh-token', async (req, res) => {
    const cookie= req.cookies.refreshToken;
    const refresh = await jwtService.verifyUserIdByRefreshToken(cookie)
    const dateRefresh = await jwtService.getLastActiveDateFromRefreshToken(cookie)

    const checkTimeFromRefresh = await devicesService.findLastActiveDate(dateRefresh)

    if(refresh && checkTimeFromRefresh) {
            const accessToken = await jwtService.createAccess(refresh.userId)
            const refreshToken = await jwtService.createRefresh(refresh.userId,refresh.deviceId)
            const timeTokenData = await jwtService.getLastActiveDateFromRefreshToken(refreshToken)
            await devicesService.updateSession(timeTokenData,checkTimeFromRefresh.deviceId)

        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
            res.status(200).send({accessToken})
            return;
                                      }
    else {
        res.sendStatus(401);
        return;
    }
})