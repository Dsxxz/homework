import {IPRestrictCollectionDb} from "./db"

export const controlRequests={
    async addRequest(ip:string, url:string, date:Date){
        await IPRestrictCollectionDb.insertOne({ip,url,date})
    },
    async checkRequest(ip:string, url:string, date:Date){
        return await IPRestrictCollectionDb.count({ip,url,date:{$gte:date}})
    }
}