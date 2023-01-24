import {UserInDbType, UserViewModel} from "../models/userType";
import {userRepository} from "../repositories/user_in_db_repository"
import {ObjectId} from "mongodb";
const bcrypt = require('bcrypt');

export const userService = {
    async createNewUser(password:string,login:string,email:string){
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this.generateHash(password,passwordSalt)
        const newUser:UserInDbType = {
            _id:new ObjectId(),
            userName:login,
            email:email,
            passwordHash:passwordHash,
            passwordSalt:passwordSalt,
            createdAt: new Date().toString()
        }
         return    await userRepository.createNewUser(newUser)
    },
    async checkLoginAndPassword(loginOrEmail:string,password:string):Promise<boolean>{
        const user:UserInDbType|null = await userRepository.findUserByLoginOrEmail(loginOrEmail)
        if(!user){
                return false
        }
        const passwordHash = await this.generateHash(password,user.passwordSalt)
        if(user.passwordHash!==passwordHash){
            return false
        }
        return true
    },
    async generateHash(password:string,salt:string){
        const hash = bcrypt.hash(password,salt);
        return hash;
    },
    async findUsersById(id:string):Promise<UserViewModel|null>{
        return  await userRepository.findUserById(id);
    },
    async deleteUser(id:string):Promise<boolean>{
        return await userRepository.deleteUser(id);
    }
}