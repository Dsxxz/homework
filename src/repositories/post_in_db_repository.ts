import {blogsRepository} from "./blogs-in-db-repository";
import {postsCollectionDb, PostDBType, PostType} from "./db";
import {ObjectId} from "mongodb";

export const postsInDbRepository={
    async createNewPost(creatingPost:PostDBType): Promise<PostType| null> {
        const existingBlog = await blogsRepository.findBlogById(creatingPost.blogId)
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
        await postsCollectionDb.insertOne(newPost)
        return {
            blogId: newPost.blogId,
            blogName: existingBlog.name,
            content: newPost.content,
            createdAt: newPost.createdAt,
            id: newPost._id.toString(),
            shortDescription: newPost.shortDescription,
            title: newPost.title
        }
    },

    async findPosts(title?:string) :Promise<Array<PostType>> {
        const filter: any = {}
        if(title){
            filter.title={$regex: title}
        }
        const posts = await postsCollectionDb.find(filter).toArray()
        return posts.map((post:PostDBType) => ({
            blogId: post.blogId,
            blogName: post.blogName,
            content: post.content,
            createdAt: post.createdAt,
            id: post._id.toString(),
            shortDescription: post.shortDescription,
            title: post.title
        }))
    },
    async findPostById(id:string) :Promise<PostType |null>{
        if(!ObjectId.isValid(id)){
            return null;
        }
        const post = await postsCollectionDb.findOne({_id: new ObjectId(id)})
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
    },

    async updatePost(id:string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const resultPost = await postsCollectionDb.updateOne({_id: new ObjectId(id)},{$set:{title,shortDescription,content,blogId}})
        return resultPost.matchedCount===1

    },

    async deletePost(id:string): Promise<boolean>{
        if(!ObjectId.isValid(id)){
            return false;
        }
        const result = await postsCollectionDb.deleteOne({_id: new ObjectId(id)})
        return result.deletedCount===1
    }
}