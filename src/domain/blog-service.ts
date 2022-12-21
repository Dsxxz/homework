import {blogsRepository} from "../repositories/blogs-in-db-repository";
import {BlogDbType, BlogsType} from "../repositories/db";
import {ObjectId} from "mongodb";

export const blogService={
    async createNewBlog(name: string, youtubeUrl: string):Promise<BlogsType>{
        const newBlog:BlogDbType= {
            createdAt: new Date().toISOString(),
            _id: new ObjectId(),
            name: name,
            youtubeUrl: youtubeUrl
        }
        return await blogsRepository.createNewBlog(newBlog)

    },
    async findBlogs(title?:string):Promise<Array<BlogsType>>{
        return await blogsRepository.findBlogs(title)
    },

    async findBlogById(id: string):Promise<BlogsType | null>{
        return  await blogsRepository.findBlogById(id);
    },

    async updateBlog(id:string,name:string, youtubeUrl:string): Promise<boolean>{
        return await blogsRepository.updateBlog(id,name,youtubeUrl);
    },

    async deleteBlog(id:string): Promise<boolean>{
        return await blogsRepository.deleteBlog(id);
    }
}