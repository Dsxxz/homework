import {UserAccountDbType} from "../models/userType";
import {UserRepository} from "../repositories/user_in_db_repository"
import {ObjectId} from "mongodb";
const bcrypt = require('bcrypt');
import {v4 as uuidv4} from "uuid";
import add from 'date-fns/add'
import {emailManager} from "../managers/email_manager";


export class AuthService{
    protected userRepository:UserRepository
    constructor() {
        this.userRepository = new UserRepository()
    }
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
                        minutes:5,
                    }),
                isConfirmed:false
            }}
        const createResult:UserAccountDbType = await this.userRepository.createNewUser(newUser)
        try {
            await emailManager.sendEmailConfirmationCode(newUser)
        }catch (e) {
            await this.userRepository.deleteUser(newUser._id.toString())
            return null;
        }
        return createResult;
    }
    async checkLoginAndPassword(loginOrEmail:string,password:string):Promise<UserAccountDbType|null>{
        const user:UserAccountDbType|null = await this.userRepository.findUserByLoginOrEmail(loginOrEmail)
        if(user){const passwordHash:string = await this.generateHash(password,user.accountData.userPasswordSalt)
            if (passwordHash!==user.accountData.userPasswordHash)return null;}
        return user
    }
    async findUsersById(userID:ObjectId):Promise<UserAccountDbType|null>{
        return this.userRepository.findUserById(userID)
    }
    async findUserLogin(userId:ObjectId):Promise<string | null>{
        return this.userRepository.findUserLogin(userId)
    }
    async generateHash(password:string,salt:string){
        return  bcrypt.hash(password,salt);
    }
    async deleteUser(id:string){
        return await this.userRepository.deleteUser(id);
    }
    async checkExistCode(code:string):Promise<UserAccountDbType|null>{
        return await this.userRepository.findUserByConfirmationCode(code);
    }
    async checkIsConfirmCode(code:string):Promise<boolean>{
        const user =await this.userRepository.findUserByConfirmationCode(code);
        return !!user?.emailConfirmation.isConfirmed;
    }
    async updateConfirmEmail(code:string):Promise<boolean>{
        let user = await this.userRepository.findUserByConfirmationCode(code)
        if (!user) {return false;}
        if (user.emailConfirmation.isConfirmed){return false;}
        if(user.emailConfirmation.expirationDate < new Date()) {return false;}

        return await this.userRepository.updateConfirmationIsConfirmed(user!._id);
    }
    async updateUserConfirmCode(user:UserAccountDbType):Promise<UserAccountDbType|null>{
        return await this.userRepository.updateConfirmationCode(user)
    }
    async passwordRecoveryUser(user: UserAccountDbType) {
        return await this.userRepository.passwordRecoveryUser(user);
    }
    async updateAccountData(user:UserAccountDbType,password:string) {
        const passwordSalt:string = await bcrypt.genSalt(10)
        const passwordHash:string = await this.generateHash(password,passwordSalt)
        return await this.userRepository.updateAccountData(user,passwordSalt,passwordHash)
    }
    async findUserByOldPassword(user:UserAccountDbType, password: string) :Promise<UserAccountDbType|null>{
        const passwordHash:string = await this.generateHash(password,user.accountData.userPasswordSalt)
        return await this.userRepository.findUserByOldPassword(passwordHash);
    }

    async findUserByLoginOrEmail(email:string) {
       return await this.userRepository.findUserByLoginOrEmail(email);
    }
}
