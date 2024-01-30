import {RestrictModel} from "./db"

class ControlRequests{
    async addRequest(ip:string, url:string, date:Date){
       return  RestrictModel.create({ip,url,date});
    }
    async checkRequest(ip:string, url:string, date:Date){
        await RestrictModel.deleteMany({date:{$lt:date}})
        return  RestrictModel.countDocuments({ip,url,date:{$gte:date}})
    }
}
export const controlRequests = new ControlRequests()