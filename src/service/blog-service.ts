import {BlogsRepository} from "../repositories/blog_in_db_repository";
import {ObjectId} from "mongodb";
import {BlogDbType, BlogType} from "../models/blogs-types";

class BlogService{
    blogsRepository:BlogsRepository
    constructor() {
        this.blogsRepository=new BlogsRepository()
    }
    async createNewBlog(name: string, websiteUrl: string, description: string):Promise<BlogType>{
        const newBlog:BlogDbType= {
            createdAt: new Date().toISOString(),
            _id: new ObjectId(),
            name: name,
            websiteUrl: websiteUrl,
            description: description,
            isMembership: false
        }
        return await this.blogsRepository.createNewBlog(newBlog)
    }
    async findBlogById(blogId: string):Promise<BlogType | null>{
        return  await this.blogsRepository.findBlogById(blogId);
    }
    async updateBlog(id:string,name:string, websiteUrl:string, description:string): Promise<boolean>{
        return await this.blogsRepository.updateBlog(id,name,websiteUrl,description);
    }
    async deleteBlog(id:string): Promise<boolean>{
        return await this.blogsRepository.deleteBlog(id);
    }
}
export const blogService= new BlogService()