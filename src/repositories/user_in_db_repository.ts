import {usersCollectionDb} from "./db";
import {UserAccountDbType} from "../models/userType";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";

export const userRepository= {
    async createNewUser(newUser: UserAccountDbType): Promise<UserAccountDbType> {
        await usersCollectionDb.insertOne(newUser);
        return newUser
    },
    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserAccountDbType | null> {

        const filterEmail = {"accountData.email": {$regex: `${loginOrEmail}`, $options: 'i'}}
        const filterLogin = {"accountData.userName": {$regex: `${loginOrEmail}`, $options: 'i'}}
        return await usersCollectionDb.findOne({$or: [filterEmail, filterLogin]})

    },
    async findUserByConfirmationCode(emailConfirmationCode: string): Promise<UserAccountDbType | null> {
        return await usersCollectionDb.findOne({"emailConfirmation.confirmationCode": emailConfirmationCode})
    },
    async findUserById(id: ObjectId|string): Promise<UserAccountDbType | null> {
        return await usersCollectionDb.findOne({_id: new ObjectId((id))})
    },
    async deleteUser(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            return false;
        }
        const result = await usersCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount === 1
    },
    async updateConfirmationIsConfirmed(_id: ObjectId): Promise<boolean> {
        let result = await usersCollectionDb.updateOne({_id}, {$set: {"emailConfirmation.isConfirmed": true}})
        return result.modifiedCount === 1;
    },
    async updateConfirmationCode(user: UserAccountDbType): Promise<UserAccountDbType|null> {
        const code:string =  uuidv4();
        const filter =user._id
        await usersCollectionDb.updateOne({_id:filter}, {$set: { "emailConfirmation.confirmationCode": code}})

        return await usersCollectionDb.findOne({"emailConfirmation.confirmationCode": code})
}
}
