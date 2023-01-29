import {UserInDbType} from "../models/userType";
import {userRepository} from "../repositories/user_in_db_repository"
import {ObjectId} from "mongodb";
const bcrypt = require('bcrypt');

export const userService = {
    async createNewUser(password:string,login:string,email:string){
        const passwordSalt:string = await bcrypt.genSalt(10)
        const passwordHash:string = await this.generateHash(password,passwordSalt)
        const newUser:UserInDbType = {
            _id:new ObjectId(),
            userName:login,
            email:email,
            userPasswordHash:passwordHash,
            userPasswordSalt:passwordSalt,
            createdAt: new Date().toISOString()
        }
         return    await userRepository.createNewUser(newUser)
    },
    async checkLoginAndPassword(loginOrEmail:string,password:string):Promise<boolean>{
        const user:UserInDbType|null = await userRepository.findUserByLoginOrEmail(loginOrEmail)
        if(!user){
                return false
        }
        const passwordHash:string = await this.generateHash(password,user.userPasswordSalt)
        if(user.userPasswordHash!==passwordHash){
            return false
        }
        return true
    },
    async generateHash(password:string,salt:string){
        return  bcrypt.hash(password,salt);
    },
  /*  async findUsersById(id:string):Promise<UserViewModel|null>{
        return  await userRepository.findUserById(id);
    },*/
    async deleteUser(id:string):Promise<boolean>{
        return await userRepository.deleteUser(id);
    }
}