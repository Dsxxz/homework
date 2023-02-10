import {UserInDbType, UserViewModel} from "../models/userType";
import {userRepository} from "../repositories/user_in_db_repository"
import {ObjectId} from "mongodb";
const bcrypt = require('bcrypt');

export const userService = {
    async createNewUser(password:string,login:string,email:string){
        const passwordSalt:string = await bcrypt.genSalt(10)
        const passwordHash:string = await this.generateHash(password,passwordSalt)
        const newUser:UserInDbType = {
            _id:new ObjectId(),
            login:login,
            email:email,
            userPasswordHash:passwordHash,
            userPasswordSalt:passwordSalt,
            createdAt: new Date().toISOString()
        }
         return    await userRepository.createNewUser(newUser)
    },
    async checkLoginAndPassword(loginOrEmail:string,password:string):Promise<UserInDbType|null>{
        const user:UserInDbType|null = await userRepository.findUserByLoginOrEmail(loginOrEmail)
        console.log('user ',user)
        if(user){const passwordHash:string = await this.generateHash(password,user.userPasswordSalt)
        if (passwordHash!==user.userPasswordHash)return null;}
        return user
    },
    async findUsersById(userID:ObjectId):Promise<UserInDbType|null>{
        return await userRepository.findUserById(userID)
    },
    async generateHash(password:string,salt:string){
        return  bcrypt.hash(password,salt);
    },
    async deleteUser(id:string):Promise<boolean>{
        return await userRepository.deleteUser(id);
    }
}