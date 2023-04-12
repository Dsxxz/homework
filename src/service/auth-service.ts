import {UserAccountDbType} from "../models/userType";
import {userRepository} from "../repositories/user_in_db_repository"
import {ObjectId} from "mongodb";
const bcrypt = require('bcrypt');
import {v4 as uuidv4} from "uuid";
import add from 'date-fns/add'
import {emailManager} from "../managers/email_manager";

export const authService = {
    async createNewUser(password:string,login:string,email:string):Promise<UserAccountDbType | null>{
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
                            hours:1,
                            minutes:1,
                        }),
                    isConfirmed:false
        }}
        const createResult:UserAccountDbType = await userRepository.createNewUser(newUser)
        try {
            await emailManager.sendEmailConfirmationCode(newUser)
        }catch (e) {
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
    async checkExistCode(code:string):Promise<boolean>{
        const user =await userRepository.findUserByConfirmationCode(code);
        if(!user){
            return false
        }
        else{
            return true;
        }
    },
    async checkIsConfirmCode(code:string):Promise<boolean>{
        const user =await userRepository.findUserByConfirmationCode(code);
        if(user?.emailConfirmation.isConfirmed){
            return true;
        }
            return false;
    },
    async updateConfirmEmail(code:string):Promise<boolean>{
        let user = await userRepository.findUserByConfirmationCode(code)
       if (!user) {return false;}
        if (user.emailConfirmation.isConfirmed){return false;}
       if(user.emailConfirmation.expirationDate < new Date()) {return false;}

       return await userRepository.updateConfirmation(user!._id);
}}