import express  from 'express';
import {blogsRouter} from "./routes/blogs_router";
import {postsRouter} from "./routes/posts_router";
import {blogsCollectionDb, postsCollectionDb, runDb, usersCollectionDb} from "./repositories/db";
import bodyParser from "body-parser" ;
import {userRouter} from "./routes/user_router";
import {authRouter} from "./routes/auth_router";
const app = express();
const port = process.env.PORT || 3000


app.use(bodyParser.json());
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.delete('/testing/all-data', async (req, res)=>{
    try {
        await blogsCollectionDb.deleteMany({})
        await postsCollectionDb.deleteMany({})
        await usersCollectionDb.deleteMany({})
        res.sendStatus(204)
    }
    catch{
        throw new Error("Failed to deleting")
    }
})


const startApp = async ():Promise<void>=>{
    await runDb();
}
startApp();
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})