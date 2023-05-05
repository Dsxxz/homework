import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';
import {UserAccountDbType} from "../models/userType";

export const jwtService={
    async createJWT(user:UserAccountDbType){
        const token = jwt.sign({userID:user._id}, "JWT_Secret",{expiresIn:'1h'})
        return {
            resultCode:0,
            data:{
                token:token
            }
        }
        },
    async getUserIdByToken(token:string){
        try {
            const result:any = jwt.verify(token,"JWT_Secret")
            return new  ObjectId(result.userID)
        }
        catch (error){
            return null;
        }
    },
    async  signToken (user: UserAccountDbType){
        const access_token = jwt.sign({userID:user._id}, 'accessTokenPrivateKey',{expiresIn:'40m'})
        const refresh_token = jwt.sign({ sub: user._id }, 'refreshTokenPrivateKey', {expiresIn:'10m'});
        return { access_token, refresh_token };
    }
}