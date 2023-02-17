import {usersCollectionDb} from "./db";
import {UserInDbType, UserViewModel} from "../models/userType";
import {ObjectId} from "mongodb";

export const userRepository={
    async createNewUser(newUser:UserInDbType):Promise<UserViewModel>{
        await usersCollectionDb.insertOne(newUser);
        return {
            id:newUser._id.toString(),
            login:newUser.login,
            email:newUser.email,
            createdAt:newUser.createdAt
        }
    },
    async findUserByLoginOrEmail(loginOrEmail:string):Promise<UserInDbType|null>{
        const filterEmail = {email: {$regex: loginOrEmail, $options: 'i'}}
        const filterLogin = {login: {$regex: loginOrEmail, $options: 'i'}}
        return   await usersCollectionDb.findOne({$or:[filterEmail,filterLogin]})

    },
    async findUserById(id:ObjectId):Promise<UserInDbType|null>{
        if(!ObjectId.isValid(id)) {
            return null
        }
        return  await usersCollectionDb.findOne({_id: id})
    },
    async deleteUser(id:string):Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const result = await usersCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}

