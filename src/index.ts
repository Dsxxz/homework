import express  from 'express';
import {blogsRouter} from "./routes/blogs_router";
import {postsRouter} from "./routes/posts_router";
import {devicesRouter} from "./routes/devises_router";
import {
    blogsCollectionDb,
    commentsCollectionDb, deviceTypeCollection, IPRestrictCollectionDb,
    postsCollectionDb,
    runDb,
    usersCollectionDb
} from "./repositories/db";
import {userRouter} from "./routes/user_router";
import {authRouter} from "./routes/auth_router";
import {commentsRouter} from "./routes/comments_router";
export  const app = express();
const port = process.env.PORT || 3000
import  cookieParser = require('cookie-parser')
const cors = require('cors')

app.set('trust proxy', true)

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/blogs', blogsRouter)
app.use('/security/devices', devicesRouter)
app.use('/posts', postsRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.delete('/testing/all-data', async (req, res)=>{
    try {
        await blogsCollectionDb.deleteMany({})
        await postsCollectionDb.deleteMany({})
        await usersCollectionDb.deleteMany({})
        await commentsCollectionDb.deleteMany({})
        await deviceTypeCollection.deleteMany({})
        await IPRestrictCollectionDb.deleteMany({})
        return res.sendStatus(204)
    }
    catch{
        throw new Error("Failed to deleting")
    }
})


const startApp = async ()=>{
        await runDb()
        app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)})
    return;
}

 startApp();
