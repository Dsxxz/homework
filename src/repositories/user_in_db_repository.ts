import {UserModelClass} from "./db";
import {UserAccountDbType} from "../models/userType";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";

export const userRepository= {
    async createNewUser(newUser: UserAccountDbType): Promise<UserAccountDbType> {
        const userInstance = new UserModelClass(newUser);
        await userInstance.save();
        return userInstance;
    },
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserAccountDbType | null> {
        const filterEmail = {"accountData.email": {$regex: `${loginOrEmail}`, $options: 'i'}}
        const filterLogin = {"accountData.userName": {$regex: `${loginOrEmail}`, $options: 'i'}}
        return  UserModelClass.findOne({$or: [filterEmail, filterLogin]}).lean()
    },
    async findUserByConfirmationCode(emailConfirmationCode: string): Promise<UserAccountDbType | null> {
        const user:UserAccountDbType | null = await UserModelClass.findOne({"emailConfirmation.confirmationCode": emailConfirmationCode}).lean()
        console.log("findUserByConfirmationCode, userRepository" ,user )
        return user
    },
    async findUserById(id: ObjectId|string): Promise<UserAccountDbType | null> {
        return  UserModelClass.findOne({_id: new ObjectId((id))}).lean()
    },
    async deleteUser(id: string): Promise<boolean> {
        const userInstance = await UserModelClass.findOne({_id:id});
        if(!userInstance)return false;
        await userInstance.deleteOne();
        return true;
    },
    async updateConfirmationIsConfirmed(_id: ObjectId): Promise<boolean> {
        const userInstance = await UserModelClass.findOne({_id});
        if(!userInstance)return false;
        userInstance.emailConfirmation.isConfirmed=true;
        await userInstance.save();
        return true;
    },
    async updateConfirmationCode(user: UserAccountDbType): Promise<UserAccountDbType|null> {
        const code:string =  uuidv4();
        const filter =user._id
        await UserModelClass.updateOne({_id:filter}, {$set: { "emailConfirmation.confirmationCode": code}})
        return  UserModelClass.findOne({"emailConfirmation.confirmationCode": code}).lean()
},
    async passwordRecoveryUser(user: UserAccountDbType): Promise<UserAccountDbType|null> {
        const code:string =  uuidv4();
        console.log("const code:string =  uuidv4();", code)
        const filter =user._id
        await UserModelClass.updateOne({_id:filter}, {$set: {
                "emailConfirmation.confirmationCode": code,
                "emailConfirmation.isConfirmed":false
                }})
        console.log("userDBRepo_Pass_Recovery",user.emailConfirmation.confirmationCode, await UserModelClass.findOne({"emailConfirmation.confirmationCode": code}).lean())
        return  UserModelClass.findOne({"emailConfirmation.confirmationCode": code}).lean()
    },
    async updateAccountData(user: UserAccountDbType,passwordSalt:string,passwordHash:string):Promise<UserAccountDbType|null>{
        const filter =user._id
        await UserModelClass.updateOne({_id:filter}, {$set: {
                "emailConfirmation.isConfirmed":true,
                "accountData.userPasswordHash":passwordHash,
                "accountData.userPasswordSalt":passwordSalt
            }})
        console.log("userDBRepo_updateAccountData")
        return  UserModelClass.findOne({_id:filter}).lean()
    },
    async findUserByOldPassword(password: string):Promise<UserAccountDbType|null> {
        return  UserModelClass.findOne({"accountData.userPasswordHash":password}).lean()
    }
}
