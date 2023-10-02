import {BlogModel, CommentModel, PostModel, UserModelClass} from "../repositories/db";
import {UserAccountDbType, UserViewModel} from "../models/userType";
import {BlogDbType, BlogType} from "../models/blogs-types";
import {PostDBType, PostType} from "../models/posts-types";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {paginationType} from "../models/query_input_models";
import {ObjectId} from "mongodb";
import {userRepository} from "../repositories/user_in_db_repository";
import {commentsRepository} from "../repositories/comments_in_db_repository";


export const blogQueryService={
    async paginationPage(searchNameTerm?:string,pageNumber:number=1,pageSize:number=10):Promise<paginationType>{
        const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}}:{}
        const   totalCount = await BlogModel.countDocuments(filter)
        const   pagesCount = Math.ceil(totalCount / pageSize)

        return {totalCount,pagesCount};
    }
    ,

    async findBlogsByQuerySort(sortBy:string='createdAt',sortDirection:string,searchNameTerm?:string,
                               pageNumber:number=1,pageSize:number=10):Promise<Array<BlogType>> {

        const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}} : {}
        const sortDirectionNumber: -1 | 1 = sortDirection === 'desc' ? -1 : 1
        const blogs: BlogDbType[] = await BlogModel.find(filter)
            .sort({[sortBy]: sortDirectionNumber})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();
        return blogs.map((blog: BlogDbType) => ({
            createdAt: blog.createdAt,
            name: blog.name,
            websiteUrl: blog.websiteUrl,
            id: blog._id.toString(),
            description: blog.description,
            isMembership: blog.isMembership
        }))}}
export const postQueryService={
    async paginationPage(pageNumber:number=1,pageSize:number=10,blogId?:string):Promise<paginationType>{
        const filter = blogId ? {blogId:blogId} :{}
        const   totalCount = await PostModel.countDocuments(filter)
        const   pagesCount = Math.ceil(totalCount / pageSize)

        return {totalCount,pagesCount};
    }
    ,
    async findPostsByQuerySort(sortBy:string='createdAt',sortDirection:string,
         pageNumber:number=1,pageSize:number=10,blogId?:string)
            :Promise<Array<PostType>>
        {
            const sortDirectionNumber:-1|1 = sortDirection==='desc'? -1 : 1
            const filter = blogId ? {blogId:blogId} :{}
                const posts: PostDBType[] = await PostModel.find(filter)
                    .sort({[sortBy]: sortDirectionNumber})
                    .skip((pageNumber-1)*pageSize)
                    .limit(pageSize)
                    .lean();
                return posts.map((post:PostDBType) => ({
                    blogId: post.blogId,
                    blogName: post.blogName,
                    content: post.content,
                    createdAt: post.createdAt,
                    id: post._id.toString(),
                    shortDescription: post.shortDescription,
                    title: post.title
                }))
        }}

export const userQueryService= {
    async paginationPage(searchLoginTerm: string, searchEmailTerm: string,
                         pageNumber: number, pageSize: number): Promise<paginationType> {
        const filterEmail = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} : {}
        const filterLogin = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} : {}
        const totalCount = await UserModelClass.countDocuments({$or: [filterEmail, filterLogin]})
        const pagesCount = Math.ceil(totalCount / pageSize)
        return {totalCount, pagesCount};
    }
    ,
    async findUsersByQuerySort(sortBy: string = 'createdAt', searchLoginTerm: string, searchEmailTerm: string,
                               pageNumber: number, pageSize: number, sortDirection: string)
        : Promise<Array<UserViewModel>> {
        const filterEmail = searchEmailTerm ? {email: {$regex: searchEmailTerm, $options: 'i'}} : {}
        const filterLogin = searchLoginTerm ? {login: {$regex: searchLoginTerm, $options: 'i'}} : {}
        const sortDirectionNumber:-1|1 = sortDirection==='desc'? -1 : 1
        const users:UserAccountDbType [] = await UserModelClass.find({$or: [filterEmail, filterLogin]})
            .sort({[sortBy]: sortDirectionNumber})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .lean();
        return users.map((user: UserAccountDbType) => ({
            id: user._id.toString(),
            login: user.accountData.userName,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }))
    }}
    export const commentsQueryService = {
        async paginationPage(pageNumber: number = 1, pageSize: number = 10, postId: string): Promise<paginationType> {

            const totalCount = await CommentModel.countDocuments({postId: postId})
            const pagesCount = Math.ceil(totalCount / pageSize)
            return {totalCount, pagesCount};
        },
        async getCommentsForPost(sortBy: string = 'createdAt', sortDirection: string = 'desc', postId: string,
                                 pageNumber: number = 1, pageSize: number = 10,userId?:ObjectId|null):Promise<Array<CommentsViewType>> {
            const sortDirectionNumber: -1 | 1 = sortDirection === 'desc' ? -1 : 1
            const comments: Array<CommentsInDbType> = await CommentModel.find({postId: postId})
                .sort({[sortBy]: sortDirectionNumber})
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize)
                .lean();
            const res:any = comments.map(async (comment: CommentsInDbType) => (
                    {
                        id: comment._id.toString(),
                        content: comment.content,
                        commentatorInfo: comment.commentatorInfo,
                        createdAt: comment.createdAt,
                        likesInfo: {
                            likesCount: comment.likesInfo.likesCount.length,
                            dislikesCount: comment.likesInfo.dislikesCount.length,
                            myStatus: userId ? await commentsRepository.getLikeStatus(comment._id.toString(), userId) : "None"
                }
            }))
            let user: UserAccountDbType | null | undefined;
            if(userId) {
                 user = await userRepository.findUserById(userId)
            }
            return res.map((comment: CommentsInDbType) => (
                {
                   id: comment._id.toString(),
                    content: comment.content,
                    commentatorInfo: comment.commentatorInfo,
                 createdAt: comment.createdAt,
                   likesInfo: {
                      likesCount: comment.likesInfo.likesCount.length,
                      dislikesCount: comment.likesInfo.dislikesCount.length,
                  }
        }))
}}