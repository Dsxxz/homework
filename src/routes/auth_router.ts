import {Router} from "express";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {
    existingEmailValidation,
    inputAuthValidation,
    inputNewPasswordValidation
} from "../MiddleWares/validation-middleware";
import {
    authInputEmailValidation,
    authInputLoginValidation,
    authInputNewPasswordValidation,
    authInputPasswordValidation
} from "../MiddleWares/auth-registration";
import {inputEmailValidationForResending} from "../MiddleWares/registration-email-resending";
import {ConnectionsCountChecker} from "../MiddleWares/connectionsCountChecker";
import {userInputEmailValidation} from "../MiddleWares/input-user-validation";
import {authController} from "../composition_root";
export const authRouter = Router({});

authRouter.get('/me', authMiddleWare, authController.getMyData.bind(authController))
authRouter.post('/login', ConnectionsCountChecker,authController.loginUser.bind(authController))
authRouter.post('/registration', ConnectionsCountChecker,
    authInputEmailValidation,
    authInputPasswordValidation,
    authInputLoginValidation,
    inputAuthValidation,authController.registration.bind(authController))
authRouter.post('/registration-confirmation', ConnectionsCountChecker, authController.emailRegistration.bind(authController))
authRouter.post('/registration-email-resending', ConnectionsCountChecker,
    inputEmailValidationForResending,
    existingEmailValidation,authController.updatingEmailCode.bind(authController))
authRouter.post('/logout',authController.userLogout.bind(authController))

authRouter.post('/refresh-token', authController.updatingJwt.bind(authController))

authRouter.post('/password-recovery', ConnectionsCountChecker,
    userInputEmailValidation,
    inputNewPasswordValidation,authController.updatingEmailCode.bind(authController))

authRouter.post('/new-password', ConnectionsCountChecker,
    authInputNewPasswordValidation,
    inputNewPasswordValidation,authController.updatingPassword.bind(authController))