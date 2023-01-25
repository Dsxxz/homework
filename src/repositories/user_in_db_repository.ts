import {usersCollectionDb} from "./db";
import {UserInDbType, UserViewModel} from "../models/userType";
import {ObjectId} from "mongodb";

export const userRepository={
    async createNewUser(newUser:UserInDbType):Promise<UserViewModel>{
        await usersCollectionDb.insertOne(newUser);
        return {
            id:newUser._id.toString(),
            login:newUser.userName,
            email:newUser.email,
            createdAt:newUser.createdAt
        }
    },
    async findUserByLoginOrEmail(loginOrEmail:string):Promise<UserInDbType|null>{
        return   await usersCollectionDb.findOne({$or:[{email:[loginOrEmail]},{userName:[loginOrEmail]}]})

    },
    async findUserById(id:string):Promise<UserViewModel|null>{
        if(!ObjectId.isValid(id)) {
            return null
        }
        const user = await usersCollectionDb.findOne({_id: new ObjectId(id)})
        if (user) {
            return {
                id:user._id.toString(),
                login:user.userName,
                email:user.email,
                createdAt:user.createdAt
            }
        }
        return null
    },
    async deleteUser(id:string):Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const result = await usersCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}

