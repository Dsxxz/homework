import {ObjectId} from "mongodb";

export type DeviceType = {
    userId:ObjectId,
    IP:	string,  //IP address of device during signing in
    title:	string,   //Device name: for example Chrome 105 (received by parsing http header "user-agent")
    lastActiveDate:Date,   //Date of the last generating of refresh/access tokens
    deviceId:string   // ID of connected device session
}
export type IPCheckerType = {
    IP:string;
    requestCounter:number
}