import {Request, Response, Router} from "express";
import {
    inputCommentsValidation,
    inputBlogsAndPostsValidation,
    inputLikesValidation
} from "../MiddleWares/validation-middleware"
import {
    postBlogIDValidation, postBlogIDValidator,
    postContentValidation,
    postShortDescriptionValidation,
    postTitleValidation
} from "../MiddleWares/input-post-validation"
import {basicAuth} from "../MiddleWares/admin_basic_autorization";
import {PostsService} from "../service/post-service";
import {CommentsQueryService, PostQueryService} from "../service/query-service";
import {PostType} from "../models/posts-types";
import {CommentsRepository} from "../repositories/comments_in_db_repository";
import {paginationType, QueryInputBlogAndPostType, QueryInputCommentsType} from "../models/query_input_models";
import {CommentsViewType} from "../models/comments-types";
import {CommentInputContentValidation} from "../MiddleWares/input-comment-validation";
import {authMiddleWare} from "../MiddleWares/auth-middleWare";
import {ObjectId} from "mongodb";
import {jwtService} from "../application/jwt-service";
import {likeStatusValidation} from "../MiddleWares/likeStatus_check";
import {likesService} from "../service/likes-service";
import {LikedType} from "../models/LikesInfoType";
import {AuthService} from "../service/auth-service";
export const postsRouter=Router({});


class PostController{
    private commentsQueryService: CommentsQueryService;
    private postsService:PostsService
    private postQueryService: PostQueryService;
    private commentsRepository: CommentsRepository;
    constructor() {
        this.postsService = new PostsService();
        this.commentsQueryService=new CommentsQueryService();
        this.postQueryService=new PostQueryService();
        this.commentsRepository=new CommentsRepository();
    }
    async getAllPosts(req:Request<{},{},{},QueryInputBlogAndPostType>,res:Response){
        try{
            const token: string | undefined = req.headers.authorization?.toString().split(' ')[1]
            let userId:ObjectId|null
            if (token) {
                userId = await jwtService.verifyUserIdByAccessToken(token)
            } else {
                userId = null
                console.log("user token and user id dont found in method getAllPosts in post_router, str 50")
            }
            const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;
            let direction = sortDirection || 'desc'
            const posts: Array<PostType> = await this.postQueryService.findPostsByQuerySort( sortBy?.toString(),
                direction,+pageNumber?.toString(),+pageSize?.toString())
            const paginator:paginationType = await this.postQueryService.paginationPage(+pageNumber,+pageSize)
            const resultPostArr = await Promise.all(posts.map(async post =>{
                let likes=[]
                let dislikes=[]
                let status: string = "None"
                let statusArr:LikedType|undefined
                const postLikes: LikedType[] | null = await likesService.findLikes(new ObjectId(post.id))
                if(postLikes && postLikes.length > 0){
                    likes = postLikes.filter(l => l.status === "Like")
                    dislikes = postLikes.filter(l => l.status === "Dislike")
                    if(userId) {
                        statusArr = postLikes.find(l => l.userId!.toString() === userId!.toString())
                        if(statusArr){
                            status=statusArr.status
                        }
                    }
                }
                const authService = new AuthService()
                const latestLikes:any[]= await likesService.findLatestLikes(new ObjectId(post.id))
                console.log(latestLikes)
                let newestLikes:any[]=[]
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
                "items":resultPostArr})
        }
        catch (e){
            res.sendStatus(404)
        }
    }
    async getOnePost(req:Request,res:Response){
        let foundPostById =await this.postsService.findPostById(req.params.id)
        if(!foundPostById){
            res.sendStatus(404)
        }
        const token: string | undefined = req.headers.authorization?.toString().split(' ')[1]
        let userId:ObjectId|null
        if (token) {
            userId = await jwtService.verifyUserIdByAccessToken(token)
        } else {
            userId = null
            console.log("user token and user id dont found in method getOnePost in post_router, str 126")
        }
            let likes=[]
            let dislikes=[]
            let status: string = "None"
            let statusArr:LikedType|undefined
            const postLikes: LikedType[] | null = await likesService.findLikes(new ObjectId(foundPostById!.id))
            if(postLikes && postLikes.length > 0){
                likes = postLikes.filter(l => l.status === "Like")
                dislikes = postLikes.filter(l => l.status === "Dislike")
                if(userId) {
                    statusArr = postLikes.find(l => l.userId!.toString() === userId!.toString())
                    if (statusArr) {
                        status = statusArr.status
                    }
                }}
        const authService = new AuthService()
        const latestLikes:any[]= await likesService.findLatestLikes(new ObjectId(foundPostById!.id))
        let newestLikes:any[]=[]
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
         res.status(200).send({
                id: foundPostById!.id,
                title: foundPostById!.title,
                shortDescription: foundPostById!.shortDescription,
                content: foundPostById!.content,
                blogId: foundPostById!.blogId,
                blogName: foundPostById!.blogName,
                createdAt: foundPostById!.createdAt,
                extendedLikesInfo: {
                    likesCount: likes.length,
                    dislikesCount: dislikes.length,
                    myStatus: status,
                    newestLikes: newestLikes
                }
            })
        }
    async createPost(req:Request, res:Response){
        let newPost = await  this.postsService.createNewPost(req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)

        if(newPost) {
            res.status(201).send({
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
        }
        else{
            res.sendStatus(400);
        }
    }
    async createCommentForPost(req:Request<{id: string}, {}, {content: string}>, res:Response){
        try {
            const postId = req.params.id;
            const content = req.body.content;
            if(!content){
                console.log("content doest find")}

            const userId = new ObjectId(req.user?._id);
            if (!userId){
                console.log("userId doest find")
                res.sendStatus(404);
                return;
            }
            const foundPostById = await this.postsService.findPostById(postId)

            if (!foundPostById) {
                console.log("foundPostById doest find")
                res.sendStatus(404);
                return;
            }

            const newComment: CommentsViewType | null = await this.commentsRepository.createComment
            (content,
                userId,
                postId)

            if(!newComment){
                console.log("newComment doest find")
                res.sendStatus(404);
                return;
            }
            res.status(201).send(newComment);
            return;
        } catch (e) {
            console.log("postsRouter.post('/:id/comments'", e)
            res.status(500).send(e)
            return;
        }
    }
    async getCommentForPost (req:Request<{id:string},{},{},QueryInputCommentsType>,res:Response){
        let foundPostById = await this.postsService.findPostById(req.params.id)
        if(!foundPostById){
            res.sendStatus(404);
            return;
        }
        try{
            const token = req.headers.authorization?.toString().split(' ')[1]
            let userId: ObjectId | null
            if (token) {
                userId = await jwtService.verifyUserIdByAccessToken(token)
            }
            else{  userId = null}
            const { pageNumber=1, pageSize=10, sortBy, sortDirection} = req.query;
            const comments = await  this.commentsQueryService.getCommentsForPost( sortBy?.toString(),
                sortDirection?.toString(), req.params.id, +pageNumber, +pageSize, userId)
            const paginator:paginationType = await this.commentsQueryService.paginationPage(+pageNumber,+pageSize, req.params.id)
            res.status(200).send({
                "pagesCount": paginator.pagesCount,
                "page": +pageNumber,
                "pageSize": +pageSize,
                "totalCount": paginator.totalCount,
                "items": comments ? comments : []
            })
            return;
        }
        catch (e){
            res.sendStatus(404)
            return;
        }
    }
    async updatePost(req:Request, res:Response){
        let findPostById = await this.postsService.updatePost(req.params.id, req.body.title, req.body.shortDescription,
            req.body.content, req.body.blogId)
        if (findPostById) {
            res.sendStatus(204)
        }
        else{
            res.sendStatus(404)
        }
    }
    async deletePost(req:Request, res:Response){
        let foundPostById = await this.postsService.deletePost(req.params.id)
        if(foundPostById){
            res.sendStatus(204)
        }
        else{
            res.sendStatus(404)
        }
    }
    async updateLikeStatus(req:Request<{ postId : string },{},{likeStatus:string}>,res:Response){
        const findPost =await this.postsService.findPostById(req.params.postId )
        if(!findPost){
            res.sendStatus(404)
            return;
        }
        try {
            const token = req.headers.authorization!.split(' ')[1]
            const userId:ObjectId = await jwtService.verifyUserIdByAccessToken(token)
            await likesService.createOrUpdateLike(new ObjectId(findPost.id), userId, "post",req.body.likeStatus)
            res.sendStatus(204);
            return;
        }
        catch (e){
            console.log("post-Router-put-post.id.likeStatus", e)
            res.status(500).send(e);
            return;
        }
    }
}
const postController= new PostController()

postsRouter.get('/', postController.getAllPosts.bind(postController))
postsRouter.get('/:id',postController.getOnePost.bind(postController))
postsRouter.post('/',basicAuth,postTitleValidation,postShortDescriptionValidation,
    postContentValidation, postBlogIDValidation,postBlogIDValidator,
    inputBlogsAndPostsValidation,postController.createPost.bind(postController))
postsRouter.post('/:id/comments', CommentInputContentValidation, authMiddleWare,
    inputCommentsValidation, postController.createCommentForPost.bind(postController))
postsRouter.get('/:id/comments',postController.getCommentForPost.bind(postController))
postsRouter.put('/:id',basicAuth,postShortDescriptionValidation,postTitleValidation,postContentValidation,
    postBlogIDValidation, postBlogIDValidator, inputBlogsAndPostsValidation,postController.updatePost.bind(postController))
postsRouter.delete('/:id',basicAuth, postController.deletePost.bind(postController))
postsRouter.put('/:postId/like-status', authMiddleWare,
    likeStatusValidation, inputLikesValidation,
    postController.updateLikeStatus.bind(postController))
