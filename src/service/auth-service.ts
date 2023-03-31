import {UserAccountDbType} from "../models/userType";
import {userRepository} from "../repositories/user_in_db_repository"
import {ObjectId} from "mongodb";
const bcrypt = require('bcrypt');
import {v4 as uuidv4} from "uuid";
import add from 'date-fns/add'
import {emailManager} from "../managers/email_manager";

export const authService = {
    async createNewUser(login:string,email:string,password:string):Promise<UserAccountDbType | null>{
        const passwordSalt:string = await bcrypt.genSalt(10)
        const passwordHash:string = await this.generateHash(password,passwordSalt)
        const newUser:UserAccountDbType = {
                _id:new ObjectId(),
                accountData: {
                    userName:login,
                    email,
                    userPasswordHash:passwordHash,
                    userPasswordSalt:passwordSalt,
                    createdAt: new Date().toISOString()
                },
                emailConfirmation: {
                    confirmationCode: uuidv4(),
                    expirationDate:add(new Date(),
                        {
                            minutes:3,
                        }),
                    isConfirmed:false
        }}
        const createResult:UserAccountDbType = await userRepository.createNewUser(newUser)
        console.log("auth-service, method: createNewUser", createResult)
        try {
            await emailManager.sendEmailRecovery(newUser)
        }catch (e) {
            console.log("auth-service, error: " ,e)
            await userRepository.deleteUser(newUser._id.toString())
            return null;
        }
        return createResult;
    },
    async checkLoginAndPassword(loginOrEmail:string,password:string):Promise<UserAccountDbType|null>{
        const user:UserAccountDbType|null = await userRepository.findUserByLoginOrEmail(loginOrEmail)
        if(user){const passwordHash:string = await this.generateHash(password,user.accountData.userPasswordSalt)
        if (passwordHash!==user.accountData.userPasswordHash)return null;}
        return user
    },
    async findUsersById(userID:ObjectId):Promise<UserAccountDbType|null>{
        return userRepository.findUserById(userID)
    },
    async generateHash(password:string,salt:string){
        return  bcrypt.hash(password,salt);
    },
    async deleteUser(id:string){
        return await userRepository.deleteUser(id);
    },
    async confirmEmail(code:string):Promise<boolean>{
        let user = await userRepository.findUserByConfirmationCode(code)
        if (!user) {return false;}
        if (user.emailConfirmation.isConfirmed) {return false;}
        if (user.emailConfirmation.confirmationCode !== code) {return false;}
        if(user.emailConfirmation.expirationDate < new Date()){return false;}

            return await userRepository.updateConfirmation(user._id);
}}