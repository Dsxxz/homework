import {AuthService} from "../service/auth-service";
import {DevicesService} from "../service/devices_service";
import {Request, Response} from "express";
import {jwtService} from "../application/jwt-service";
import {LoginInputModel, UserAccountDbType} from "../models/userType";
import {ObjectId} from "mongodb";
import {emailManager} from "../managers/email_manager";

export class AuthController {
    constructor(protected authService: AuthService, protected devicesService: DevicesService) {
    }

    async getMyData(req: Request, res: Response) {
        try {
            const token = req.headers.authorization!.split(' ')[1]
            const userId = await jwtService.verifyUserIdByAccessToken(token)
            const user = await this.authService.findUsersById(userId)
            if (user) {
                res.status(200).send({
                    "email": user.accountData.email,
                    "login": user.accountData.userName,
                    "userId": userId
                })
                return;
            } else {
                res.sendStatus(401)
                return;
            }
        } catch (e) {
            res.sendStatus(401)
            return;
        }
    }

    async loginUser(req: Request<{}, {}, LoginInputModel, {}>, res: Response) {
        try {
            const checkResult: UserAccountDbType | null = await this.authService.checkLoginAndPassword(req.body.loginOrEmail, req.body.password)

            if (checkResult) {
                const userId: ObjectId = checkResult._id
                const ip = req.ip || ''
                const title = req.headers['user-agent'] || 'custom UA'
                const newDeviceId = new ObjectId()

                const accessToken = await jwtService.createAccess(userId)
                const refreshToken = await jwtService.createRefresh(userId, newDeviceId)
                const timeTokenData = await jwtService.getLastActiveDateFromRefreshToken(refreshToken)

                const checkSessions = await this.devicesService.checkSessions(userId, ip, title)
                if (checkSessions) {
                    await this.devicesService.updateSession(timeTokenData, checkSessions.deviceId)
                } else {
                    await this.devicesService.createNewSession(userId, ip, title, timeTokenData, newDeviceId)
                }

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true
                })
                res.status(200).send({accessToken: accessToken})
                return;
            } else {
                res.sendStatus(401);
                return;
            }
        } catch (e) {
            console.log("authRouter.post('/login'", e)
            res.status(500).send(e)
        }
    }

    async registration(req: Request, res: Response) {
        try {
            await this.authService.createNewUser(req.body.password, req.body.login, req.body.email)
            res.sendStatus(204)
            return;
        } catch (e) {
            res.status(400).send(e);
            return;
        }
    }

    async emailRegistration(req: Request, res: Response) {
        const correctCode = await this.authService.checkExistCode(req.body.code)
        if (!correctCode) {
            res.status(400).send({errorsMessages: [{message: "Confirmation Code is not correct", field: "code"}]})
            return;
        }
        const confirmCode = await this.authService.checkIsConfirmCode(req.body.code)
        if (confirmCode) {
            res.status(400).send({errorsMessages: [{message: "Confirmation Code already confirm", field: "code"}]})
            return;
        } else {
            await this.authService.updateConfirmEmail(req.body.code);
            res.sendStatus(204);
            return;
        }
    }

    async emailConfirmation(req: Request, res: Response) {
        const user = await this.authService.findUserByLoginOrEmail(req.body.email)
        if (user!.emailConfirmation.isConfirmed) {
            res.status(400).send({
                errorsMessages: [{
                    message: "Confirmation Code already confirm",
                    field: "email"
                }]
            });
            return;
        }
        const updateUser: UserAccountDbType | null = await this.authService.updateUserConfirmCode(user!);
        if (updateUser) {

            await emailManager.sendEmailConfirmationCode(updateUser)
            res.sendStatus(204);
            return;
        } else {
            res.sendStatus(400);
            return;
        }
    }

    async userLogout(req: Request, res: Response) {
        try {
            const cookie = req.cookies.refreshToken;
            const refresh = await jwtService.verifyUserIdByRefreshToken(cookie)
            const dateRefresh = await jwtService.getLastActiveDateFromRefreshToken(cookie)
            const checkTimeFromRefresh = await this.devicesService.findLastActiveDate(dateRefresh)

            if (refresh && checkTimeFromRefresh) {
                await this.devicesService.deleteOneSessionById(refresh.deviceId)
                res.clearCookie('refreshToken').sendStatus(204)
                return;
            } else {
                res.sendStatus(401);
                return;
            }
        } catch (e) {
            res.send(e)
        }
    }

    async updatingJwt(req: Request, res: Response) {
        const cookie = req.cookies.refreshToken;
        const refresh = await jwtService.verifyUserIdByRefreshToken(cookie)
        const dateRefresh = await jwtService.getLastActiveDateFromRefreshToken(cookie)

        const checkTimeFromRefresh = await this.devicesService.findLastActiveDate(dateRefresh)

        if (refresh && checkTimeFromRefresh) {
            const accessToken = await jwtService.createAccess(refresh.userId)
            const refreshToken = await jwtService.createRefresh(refresh.userId, refresh.deviceId)
            const timeTokenData = await jwtService.getLastActiveDateFromRefreshToken(refreshToken)
            await this.devicesService.updateSession(timeTokenData, checkTimeFromRefresh.deviceId)

            res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
            res.status(200).send({accessToken})
            return;
        } else {
            res.sendStatus(401);
            return;
        }
    }

    async updatingEmailCode(req: Request, res: Response) {
        try {
            const user = await this.authService.findUserByLoginOrEmail(req.body.email)
            if (!user) {
                res.sendStatus(204);
                return;
            } else {
                const updateUser = await this.authService.passwordRecoveryUser(user);
                if (updateUser) {
                    emailManager.sendRecoveryCode(updateUser);
                    res.sendStatus(204);
                    return;
                }
            }
        } catch (e) {
            res.status(500).send(e);
            return;
        }
    }

    async updatingPassword(req: Request, res: Response) {
        try {
            const user = await this.authService.checkExistCode(req.body.recoveryCode)
            if (!user) {
                res.status(400).send({
                    errorsMessages: [{
                        message: "Recovery code is not correct",
                        field: "recoveryCode"
                    }]
                })
                return;
            } else {
                const checkNewPassword = await this.authService.findUserByOldPassword(user!, req.body.newPassword)
                if (checkNewPassword) {
                    res.sendStatus(401);
                    return;
                }
                await this.authService.updateAccountData(user!, req.body.newPassword)
                res.sendStatus(204);
                return;
            }
        } catch (e) {
            res.status(500).send(e);
            return;
        }
    }
}