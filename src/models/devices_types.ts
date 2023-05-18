import {ObjectId} from "mongodb";

export type DeviceType = {
    ip:	string,  //IP address of device during signing in
    title:	string,   //Device name: for example Chrome 105 (received by parsing http header "user-agent")
    lastActiveDate:string,   //Date of the last generating of refresh/access tokens
    deviceId:ObjectId,  // ID of connected device session
    userId:ObjectId
}
export type DeviceViewType = {
    deviceId:ObjectId,   // ID of connected device session
    ip:	string,  //IP address of device during signing in
    lastActiveDate:string,   //Date of the last generating of refresh/access tokens
    title:	string   //Device name: for example Chrome 105 (received by parsing http header "user-agent")
}

export type IPCheckerType = {
    IP:string;
    requestCounter:number
}