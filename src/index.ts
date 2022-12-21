import express  from 'express';
import {blogsRouter} from "./routes/blogsRouters";
import {postsRouter} from "./routes/postsRouters";
import {blogsCollectionDb, postsCollectionDb, runDb} from "./repositories/db";
import bodyParser from "body-parser" ;
const app = express();
const port = process.env.PORT || 3000


app.use(bodyParser.json());
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)

app.delete('/testing/all-data', async (req, res)=>{
    try {
        await blogsCollectionDb.deleteMany({})
        await postsCollectionDb.deleteMany({})
        res.sendStatus(204)
    }
    catch{
        throw new Error("Failed to deleting")
    }
})


const startApp = async ()=>{
    await runDb();
}
startApp();
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})