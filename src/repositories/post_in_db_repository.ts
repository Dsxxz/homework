import {PostModel} from "./db";
import {ObjectId} from "mongodb";
import {PostDBType, PostType} from "../models/posts-types";
import {blogService} from "../service/blog-service";

class PostsInDbRepository{
    async createNewPost(creatingPost:PostDBType): Promise<PostType| null> {
        const existingBlog = await blogService.findBlogById(creatingPost.blogId)
        if(!existingBlog) {
            return null
        }
        const newPost={
            blogId: creatingPost.blogId,
            blogName: existingBlog.name,
            content: creatingPost.content,
            createdAt: creatingPost.createdAt,
            _id: creatingPost._id,
            shortDescription: creatingPost.shortDescription,
            title: creatingPost.title
        }
        await PostModel.create(newPost)
        return {
            blogId: newPost.blogId,
            blogName: existingBlog.name,
            content: newPost.content,
            createdAt: newPost.createdAt,
            id: newPost._id.toString(),
            shortDescription: newPost.shortDescription,
            title: newPost.title
        }
    }
    async findPostById(id:string) :Promise<PostType |null>{
        if(!ObjectId.isValid(id)){
            return null;
        }
        const post:PostDBType|null = await PostModel.findOne({_id: new ObjectId(id)})
        if(post){
            return {
                blogId: post.blogId,
                blogName: post.blogName,
                content: post.content,
                createdAt: post.createdAt,
                id: post._id.toString(),
                shortDescription: post.shortDescription,
                title: post.title
            }
        }
        return null;
    }
    async updatePost(id:string, title: string, shortDescription: string, content: string, blogId: string){
        if(!ObjectId.isValid(id)){
            return false;
        }
        return PostModel.findOneAndUpdate({_id: new ObjectId(id)},{$set:{title,shortDescription,content,blogId}})

    }
    async deletePost(id:string){
        if(!ObjectId.isValid(id)){
            return false;
        }
        return  PostModel.deleteOne({_id: new ObjectId(id)})
    }
}
export const postsInDbRepository = new PostsInDbRepository()