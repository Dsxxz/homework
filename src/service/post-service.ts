import {ObjectId} from "mongodb";
import {postsInDbRepository} from "../repositories/post_in_db_repository";
import {PostType} from "../models/posts-types";

export const postsService={
    async createNewPost(title: string, shortDescription: string, content: string, blogId: string): Promise<PostType| null> {
        const newPost={
            blogId: blogId,
            blogName: "",
            content: content,
            createdAt: new Date().toISOString(),
            _id: new ObjectId(),
            shortDescription: shortDescription,
            title: title
        }
        return await postsInDbRepository.createNewPost(newPost);
    },

    async findPostById(id:string) :Promise<PostType |null>{
        return await postsInDbRepository.findPostById(id);
    },

    async updatePost(id:string, title: string, shortDescription: string, content: string, blogId: string){
        return await postsInDbRepository.updatePost(id,title,shortDescription,content,blogId);
    },

    async deletePost(id:string){
        return  await postsInDbRepository.deletePost(id);
    }
}