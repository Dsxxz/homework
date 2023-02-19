import {blogsCollectionDb, commentsCollectionDb, postsCollectionDb, usersCollectionDb} from "../repositories/db";
import {UserInDbType, UserViewModel} from "../models/userType";
import {BlogDbType, BlogType} from "../models/blogs-types";
import {PostDBType, PostType} from "../models/posts-types";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {paginationType} from "../models/query_input_models";

export const blogQueryService={
    async paginationPage(searchNameTerm?:string,pageNumber:number=1,pageSize:number=10):Promise<paginationType>{
        const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}}:{}
        const   totalCount = await blogsCollectionDb.countDocuments(filter)
        const   pagesCount = Math.ceil(totalCount / pageSize)

        return {totalCount,pagesCount};
    }
    ,

    async findBlogsByQuerySort(sortBy:string='createdAt',sortDirection:string,searchNameTerm?:string,
                               pageNumber:number=1,pageSize:number=10):Promise<Array<BlogType>>
    {
        const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}}:{}
        if(sortDirection==="asc")  {
            const blogs: BlogDbType[] = await blogsCollectionDb.find(filter)
                .sort({[sortBy]: 1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return blogs.map((blog: BlogDbType) => ({
                createdAt: blog.createdAt,
                name: blog.name,
                websiteUrl: blog.websiteUrl,
                id: blog._id.toString(),
                description: blog.description,
                isMembership:blog.isMembership
            }))
        }

        else{
            const blogs: BlogDbType[] = await blogsCollectionDb.find(filter)
                .sort({[sortBy]: -1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return blogs.map((blog: BlogDbType) => ({
                createdAt: blog.createdAt,
                name: blog.name,
                websiteUrl: blog.websiteUrl,
                id: blog._id.toString(),
                description: blog.description,
                isMembership:blog.isMembership
            }))
        }
    }}

export const postQueryService={
    async paginationPage(pageNumber:number=1,pageSize:number=10,blogId?:string):Promise<paginationType>{
        const filter = blogId ? {blogId:blogId} :{}
        const   totalCount = await postsCollectionDb.countDocuments(filter)
        const   pagesCount = Math.ceil(totalCount / pageSize)

        return {totalCount,pagesCount};
    }
    ,
    async findPostsByQuerySort(sortBy:string='createdAt',sortDirection:string,
         pageNumber:number=1,pageSize:number=10,blogId?:string)
            :Promise<Array<PostType>>
        {
            const filter = blogId ? {blogId:blogId} :{}
            if(sortDirection==="asc") {
                const posts: PostDBType[] = await postsCollectionDb.find(filter)
                    .sort({[sortBy]: 1})
                    .skip((pageNumber-1)*pageSize)
                    .limit(pageSize)
                    .toArray();
                return posts.map((post:PostDBType) => ({
                    blogId: post.blogId,
                    blogName: post.blogName,
                    content: post.content,
                    createdAt: post.createdAt,
                    id: post._id.toString(),
                    shortDescription: post.shortDescription,
                    title: post.title
                }))}
        else{
            const posts: PostDBType[] = await postsCollectionDb.find(filter)
                .sort({[sortBy]: -1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
                return posts.map((post:PostDBType) => ({
                    blogId: post.blogId,
                    blogName: post.blogName,
                    content: post.content,
                    createdAt: post.createdAt,
                    id: post._id.toString(),
                    shortDescription: post.shortDescription,
                    title: post.title
                }))
        }}}

export const userQueryService={
    async paginationPage(searchLoginTerm:string,searchEmailTerm:string,
                         pageNumber:number,pageSize:number):Promise<paginationType>{
        const filterEmail = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} :{}
        const filterLogin = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} :{}
        const   totalCount = await usersCollectionDb.countDocuments({$or:[filterEmail, filterLogin]})
        const   pagesCount = Math.ceil(totalCount / pageSize)
        return {totalCount,pagesCount};
    }
    ,
    async findUsersByQuerySort(sortBy:string='createdAt',searchLoginTerm:string,searchEmailTerm:string,
                               pageNumber:number,pageSize:number,sortDirection:string)
        :Promise<Array<UserViewModel>>
    {
        const filterEmail = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} :{}
       const filterLogin = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} :{}
        if(sortDirection==='asc') {
            const users: UserInDbType[] = await usersCollectionDb.find({$or:[filterEmail, filterLogin]})
                .sort({[sortBy]: 1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return users.map((user:UserInDbType) => ({
                id:user._id.toString(),
                login:user.login,
                email:user.email,
                createdAt:user.createdAt
            }))}
        else{
            const users: UserInDbType[] = await usersCollectionDb.find({$or:[filterEmail, filterLogin]})
                .sort({[sortBy]: -1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return users.map((user:UserInDbType) => ({
                id:user._id.toString(),
                login:user.login,
                email:user.email,
                createdAt:user.createdAt
            }))}}}
export const commentsQueryService={
    async paginationPage(pageNumber: number = 1, pageSize: number = 10, postId: string): Promise<paginationType> {

        const totalCount = await commentsCollectionDb.countDocuments({postId: postId})
        const pagesCount = Math.ceil(totalCount / pageSize)
        return {totalCount, pagesCount};
    },
    async getCommentsForPost(sortBy:string='createdAt',sortDirection:string='desc',postId:string,
                             pageNumber:number=1,pageSize:number=10):Promise<Array<CommentsViewType>>

    {
        if(sortDirection==="asc")  {
            const comments: Array<CommentsInDbType> = await commentsCollectionDb.find({postId: postId})
                .sort({[sortBy]: 1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return comments.map((comment: CommentsInDbType) => ({
                commentatorInfo:comment.commentatorInfo,
                content:comment.content,
                createdAt:comment.createdAt,
                _id:comment._id.toString()
            }))
        }

        else{
            const comments: CommentsInDbType[] = await commentsCollectionDb.find({postId: postId})
                .sort({[sortBy]: -1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return comments.map((comment: CommentsInDbType) => ({
                commentatorInfo:comment.commentatorInfo,
                content:comment.content,
                createdAt:comment.createdAt,
                _id:comment._id.toString()
            }))
        }
    }
}