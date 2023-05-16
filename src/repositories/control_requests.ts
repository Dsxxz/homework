import {IPRestrictCollectionDb} from "./db"
import {IPCheckerType} from "../models/devices_types";

export const controlRequests={
    async checkRequestForIP(IP:string):Promise<number>{
        const list:IPCheckerType|null = await IPRestrictCollectionDb.findOne({IP})
        if(list){
            await IPRestrictCollectionDb.updateOne({IP},{$inc : { requestCounter : 1}})
            return list.requestCounter;
        }
        else{
            await IPRestrictCollectionDb.insertOne({IP,requestCounter:1})
            return 1;
        }
    },
    async deleteRequestForIP(IP:string):Promise<number>{
        const result = await IPRestrictCollectionDb.deleteOne({IP})
        return result.deletedCount;
    }
}