import {BlogDbType, blogsCollectionDb, BlogType} from "./db"
import {ObjectId} from "mongodb";

export const blogsRepository={
    async createNewBlog(newBlog:BlogDbType):Promise<BlogType>{
        await blogsCollectionDb.insertOne(newBlog)

        return {
            createdAt: newBlog.createdAt,
            name: newBlog.name,
            websiteUrl: newBlog.websiteUrl,
            id: newBlog._id.toString(),
            description: newBlog.description
        }
    },
    async findBlogById(id: string):Promise<BlogType | null>{
        if(!ObjectId.isValid(id)) {
            return null
        }

        const blog = await blogsCollectionDb.findOne({_id: new ObjectId(id)})
        if (blog) {
            return {
                name: blog.name,
                createdAt: blog.createdAt,
                websiteUrl: blog.websiteUrl,
                id: blog._id.toString(),
                description: blog.description
            }
        }

        return null
    },

    async updateBlog(id:string,name:string, websiteUrl:string,description:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const resultBlog= await blogsCollectionDb.updateOne({_id: new ObjectId(id)},{$set:{name,websiteUrl,description}})
        return resultBlog.matchedCount===1 ;
    },

    async deleteBlog(id:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const result = await blogsCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    },

}