import {userRepository} from "../repositories/user_in_db_repository";
import {jwtService} from "../application/jwt-service";

export const auth_adapter={
    async sendTokensToCookie(email:string) {
        try {
            const user = await userRepository.findUserByLoginOrEmail(email);
            if (user) {
                const {access_token, refresh_token} = await jwtService.signToken(user)
                return {access_token, refresh_token}
            }
        } catch (err) {
            return (err);
        }}
}
