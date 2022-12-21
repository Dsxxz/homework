import {BlogDbType, blogsCollectionDb, BlogsType} from "./db"
import {ObjectId} from "mongodb";

export const blogsRepository={
    async createNewBlog(newBlog:BlogDbType):Promise<BlogsType >{
        await blogsCollectionDb.insertOne(newBlog)

        return {
            createdAt: newBlog.createdAt,
            name: newBlog.name,
            youtubeUrl: newBlog.youtubeUrl,
            id: newBlog._id.toString()
        }
    },
    async findBlogs(title?:string):Promise<Array<BlogsType>>{
        const filter: any = {}
        if(title){
            filter.title={$regex: title}
        }
        const blogs = await blogsCollectionDb.find(filter).toArray()

        return blogs.map((blog) => ({
            id: blog._id.toString(),
            name: blog.name,
            youtubeUrl: blog.youtubeUrl,
            createdAt: blog.createdAt
        }))
    },

    async findBlogById(id: string):Promise<BlogsType | null>{
        if(!ObjectId.isValid(id)) {
            return null
        }

        const blog = await blogsCollectionDb.findOne({_id: new ObjectId(id)})
        if (blog) {
            return {
                name: blog.name,
                createdAt: blog.createdAt,
                youtubeUrl: blog.youtubeUrl,
                id: blog._id.toString()
            }
        }

        return null
    },

    async updateBlog(id:string,name:string, youtubeUrl:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const resultBlog= await blogsCollectionDb.updateOne({_id: new ObjectId(id)},{$set:{name,youtubeUrl}})
        return resultBlog.matchedCount===1 ;
    },

    async deleteBlog(id:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const result = await blogsCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}