import {IPRestrictCollectionDb} from "./db"

export const controlRequests={
    async addRequest(ip:string, url:string, date:Date){
        await IPRestrictCollectionDb.insertOne({ip,url,date})
    },
    async checkRequest(ip:string, url:string, date:Date){
        await IPRestrictCollectionDb.deleteMany({date:{$lt:date}})
        return await IPRestrictCollectionDb.countDocuments({ip,url,date:{$gte:date}})
    }
}