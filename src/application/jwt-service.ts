import {ObjectId} from "mongodb";
import jwt from  'jsonwebtoken';
import {UserAccountDbType} from "../models/userType";
import {userRepository} from "../repositories/user_in_db_repository";

export const jwtService={
    async createJWT(user:UserAccountDbType){
        const token = jwt.sign({userID:user._id}, "JWT_Secret",{expiresIn:'10 s'})
        return {
            resultCode:0,
            data:{
                token:token
            }
        }
        },
    async getUserIdByAccessToken(token:string){
        try {
            const result:any = jwt.verify(token,"JWT_Secret")
            return new  ObjectId(result.userID)
        }
        catch (error){
            return null;
        }
    },
    async  signToken (user: UserAccountDbType){
        return jwt.sign({userID:user._id}, 'refreshTokenPrivateKey', {expiresIn:'20s'});
    },
    async getUserByRefreshToken(token:string){
        try {
            const result:any = jwt.verify(token,"refreshTokenPrivateKey")
            const id = new  ObjectId(result.userID)
            return await userRepository.findUserById(id)
        }
        catch (error){
            return null;
        }
    }
}