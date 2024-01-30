import { Router,Request,Response} from "express";
import {blogInputNameValidation, blogInputWebsiteUrlValidation} from '../MiddleWares/input-blog-validation';
import {basicAuth} from "../MiddleWares/admin_basic_autorization";
import {inputBlogsAndPostsValidation} from "../MiddleWares/validation-middleware"
import {blogService} from "../service/blog-service";
import {PostsService} from "../service/post-service";
import {postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation} from "../MiddleWares/input-post-validation";
import {BlogQueryService, PostQueryService} from "../service/query-service";
import {BlogType} from "../models/blogs-types";
import {PostType} from "../models/posts-types";
import {paginationType, QueryInputBlogAndPostType} from "../models/query_input_models";
import {LikedType} from "../models/LikesInfoType";
import {likesService} from "../service/likes-service";
import {ObjectId} from "mongodb";
import {AuthService} from "../service/auth-service";
import {jwtService} from "../application/jwt-service";
export const blogsRouter = Router({});

class BlogController{
    private blogQueryService: BlogQueryService;
    private postQueryService: PostQueryService;
    private postsService: PostsService;
    constructor() {
        this.blogQueryService=new BlogQueryService;
        this.postQueryService=new PostQueryService;
        this.postsService=new PostsService;
    }
    async getAllBlogs(req:Request<{},{},{},QueryInputBlogAndPostType>,res:Response){
        try{
            const { pageNumber=1, pageSize=10, sortBy, sortDirection, searchNameTerm} = req.query;

            const blogs: Array<BlogType> = await this.blogQueryService.findBlogsByQuerySort( sortBy?.toString(),
                sortDirection?.toString(),searchNameTerm?.toString(),+pageNumber?.toString(),+pageSize?.toString())
            const paginator:paginationType = await this.blogQueryService.paginationPage(searchNameTerm,+pageNumber,+pageSize)

            res.status(200).send({
                "pagesCount": paginator.pagesCount,
                "page": +pageNumber,
                "pageSize": +pageSize,
                "totalCount": paginator.totalCount,
                "items": blogs
            })
        }
        catch (e){
            res.sendStatus(404)
        }}
    async getOneBlog(req:Request,res:Response){
        let foundBlogById = await blogService.findBlogById(req.params.id)
        if(foundBlogById){
            res.status(200).send(foundBlogById)
        }
        else{
            res.sendStatus(404)
        }
    }
    async createBlog(req:Request, res:Response){
        try{
            let newBlog = await blogService.createNewBlog(req.body.name, req.body.websiteUrl, req.body.description)
            res.status(201).send(newBlog)
        }
        catch (e) {
            res.sendStatus(404)
        }
    }
    async updateBlog(req:Request, res:Response){
        let findBlogById = await blogService.updateBlog(req.params.id, req.body.name, req.body.websiteUrl,req.body.description)
        if (findBlogById) {
            res.sendStatus(204)
        }
        else{
            res.sendStatus(404)
        }
    }
    async deleteBlog(req:Request,res:Response){
        let foundBlogById = await blogService.deleteBlog(req.params.id)
        if(foundBlogById){
            res.sendStatus(204)
        }
        else{
            res.sendStatus(404)
        }
    }
    async createPostForBlog(req:Request, res:Response){
        let newPost = await this.postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.params.blogId)
        if (newPost) {
            res.status(201).send( {
                id: newPost.id,
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt,
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: "None",
                    newestLikes: []
                }
            });
        } else {
            res.sendStatus(404);
        }
    }
    async getPostsForBlog(req:Request<{blogId:string},{},{},QueryInputBlogAndPostType>,res:Response){
        let foundBlogById:BlogType | null = await blogService.findBlogById(req.params.blogId)
        if(!foundBlogById){
            res.sendStatus(404)
        }
        else{
            try{
                const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;
                const posts: Array<PostType> = await this.postQueryService.findPostsByQuerySort( sortBy?.toString(),
                    sortDirection?.toString(),+pageNumber?.toString(),+pageSize?.toString(),req.params.blogId!)
                const paginator:paginationType = await this.postQueryService.paginationPage(+pageNumber,+pageSize,req.params.blogId!)

                const token: string | undefined = req.headers.authorization?.toString().split(' ')[1]
                let userId:ObjectId|null
                if (token) {
                    userId = await jwtService.verifyUserIdByAccessToken(token)
                } else {
                    userId = null
                    console.log("user token and user id dont found in method getAllPosts in getPostsForBlog, str 128")
                }

                const resultPostArr = await Promise.all(posts.map(async post => {
                    let likes = []
                    let dislikes = []
                    let status: string = "None"
                    let statusArr: LikedType | undefined
                    const postLikes: LikedType[] | null = await likesService.findLikes(new ObjectId(post.id))
                    if (postLikes && postLikes.length > 0) {
                        likes = postLikes.filter(l => l.status === "Like")
                        dislikes = postLikes.filter(l => l.status === "Dislike")
                        if (userId) {
                            statusArr = postLikes.find(l => l.userId!.toString() === userId!.toString())
                            if (statusArr) {
                                status = statusArr.status
                            }
                        }
                    }
                    const authService = new AuthService()
                    const latestLikes: any[] = await likesService.findLatestLikes(new ObjectId(post.id))
                    console.log(latestLikes)
                    let newestLikes: any[] = []
                    if (latestLikes) {
                        for (const el of latestLikes) {
                            const login = await authService.findUserLogin(el.userId);
                            newestLikes.push({
                                addedAt: el.createdAt,
                                userId: el.userId,
                                login: login
                            });
                        }
                    }

                return {
                    id: post.id,
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: post.blogId,
                    blogName: post.blogName,
                    createdAt: post.createdAt,
                    extendedLikesInfo: {
                        likesCount: likes.length,
                        dislikesCount: dislikes.length,
                        myStatus: status,
                        newestLikes: newestLikes
                    }
                }
            }))


                res.status(200).send({
                    "pagesCount": paginator.pagesCount,
                    "page": +pageNumber,
                    "pageSize": +pageSize,
                    "totalCount": paginator.totalCount,
                    "items": resultPostArr
                })
            }
            catch (e){
                res.sendStatus(404)
            }
}}}
const blogController = new BlogController()

blogsRouter.get('/',blogController.getAllBlogs.bind(blogController))
blogsRouter.get('/:id', blogController.getOneBlog.bind(blogController))
blogsRouter.post('/',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogsAndPostsValidation,blogController.createBlog.bind(blogController))
blogsRouter.put('/:id',basicAuth,blogInputNameValidation,blogInputWebsiteUrlValidation,inputBlogsAndPostsValidation,blogController.updateBlog.bind(blogController))
blogsRouter.delete('/:id',basicAuth, blogController.deleteBlog.bind(blogController))
blogsRouter.post('/:blogId/posts',basicAuth,postTitleValidation, postShortDescriptionValidation,
    postContentValidation, inputBlogsAndPostsValidation,blogController.createPostForBlog.bind(blogController))
blogsRouter.get('/:blogId/posts',blogController.getPostsForBlog.bind(blogController))