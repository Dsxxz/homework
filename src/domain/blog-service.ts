import {blogsRepository} from "../repositories/blog_in_db_repository";
import {BlogDbType, BlogType} from "../repositories/db";
import {ObjectId} from "mongodb";

export const blogService={
    async createNewBlog(name: string, websiteUrl: string, description: string):Promise<BlogType>{
        const newBlog:BlogDbType= {
            createdAt: new Date().toISOString(),
            _id: new ObjectId(),
            name: name,
            websiteUrl: websiteUrl,
            description: description
        }
        return await blogsRepository.createNewBlog(newBlog)

    },
    async findBlogById(blogId: string):Promise<BlogType | null>{
        return  await blogsRepository.findBlogById(blogId);
    },

    async updateBlog(id:string,name:string, websiteUrl:string, description:string): Promise<boolean>{
        return await blogsRepository.updateBlog(id,name,websiteUrl,description);
    },

    async deleteBlog(id:string): Promise<boolean>{
        return await blogsRepository.deleteBlog(id);
    }
}