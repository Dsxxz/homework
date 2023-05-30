import {ObjectId} from "mongodb";
import jwt from 'jsonwebtoken';


export const jwtService = {
    async createAccess(userId: ObjectId) {
        return jwt.sign({userId}, "JWT_Secret", {expiresIn: '10s'})
    },

    async createRefresh(userId: ObjectId, deviceId: ObjectId,) {
        return jwt.sign({userId, deviceId}, 'refreshTokenPrivateKey', {expiresIn: '50s'});
    },

    async getLastActiveDateFromRefreshToken(refreshToken: string): Promise<string> {
        const result: any = jwt.decode(refreshToken)
        return new Date(result.iat * 1000).toISOString()
    },

    async verifyUserIdByRefreshToken(token: string) {
        try {
            const result: any = jwt.verify(token, "refreshTokenPrivateKey")
            return {deviceId:result.deviceId,
                userId:result.userId,
            }
        } catch (error) {
            console.log('async verifyUserIdByRefreshToken',error)
            return null;
        }
    },
    async verifyUserIdByAccessToken(token: string){
        try {
            const result: any = jwt.verify(token, "JWT_Secret")
            return result.userId;
        } catch (error) {
            console.log('async verifyUserIdByAccessToken',error)

            return null;
}
    },

}