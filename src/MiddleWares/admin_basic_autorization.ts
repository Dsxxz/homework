const auth = require('basic-auth')


export const basicAuth = async (req:any,res:any, next:any)=>{
    const user = await auth(req)
    const username: string = 'admin'
    const password: string = 'qwerty'
    if(user && user.name.toLowerCase() === username.toLowerCase() && user.pass === password){
        next();
    }
    else{
        return res.sendStatus(401);
    }
}