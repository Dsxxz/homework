import {BlogModel} from "./db"
import {ObjectId} from "mongodb";
import {BlogDbType, BlogType} from "../models/blogs-types";
import {HydratedDocument} from "mongoose";

export const blogsRepository={
    async createNewBlog(newBlog:BlogDbType):Promise<BlogType>{
        const blogInstance = new BlogModel(newBlog)
        blogInstance.save()
        return {
            createdAt: blogInstance.createdAt,
            name: blogInstance.name,
            websiteUrl: blogInstance.websiteUrl,
            id: blogInstance._id.toString(),
            description: blogInstance.description,
            isMembership:blogInstance.isMembership
        }
    },
    async findBlogById(id: string):Promise<BlogType | null>{

        const blog:HydratedDocument<BlogType>|null = await BlogModel.findOne({_id: new ObjectId(id)})
        if (blog) {
            return {
                name: blog.name,
                createdAt: blog.createdAt,
                websiteUrl: blog.websiteUrl,
                id: blog._id.toString(),
                description: blog.description,
                isMembership:blog.isMembership
            }
        }

        return null
    },

    async updateBlog(id:string,name:string, websiteUrl:string,description:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const blogInstance:HydratedDocument<BlogType>|null = await BlogModel.findOne({_id: new ObjectId(id)});
        if (!blogInstance)return false;
        blogInstance.name=name;
        blogInstance.websiteUrl=websiteUrl;
        blogInstance.description=description;
        return true;
    },

    async deleteBlog(id:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const blogInstance = await BlogModel.findOne({_id: new ObjectId(id)});
        if (!blogInstance)return false;
        blogInstance.deleteOne();
        return true;
    }
}