import {CommentModel} from "./db"
import {ObjectId} from "mongodb";
import {CommentsInDbType, CommentsViewType} from "../models/comments-types";
import {AuthService} from "../service/auth-service";
import {likeEnum} from "../models/LikesInfoType";
import {HydratedDocument} from "mongoose";

export class CommentsRepository{
    private authService: AuthService;
    constructor() {
        this.authService = new AuthService();
    }
    async saveComment(comment:HydratedDocument<CommentsInDbType>){
        return await comment.save();
    }
    async createComment(content:string,userId:ObjectId, postId:string):Promise<CommentsViewType|null>{
        const user = await this.authService.findUsersById(userId)
        if(!user) {
            console.log("user not found")
            return null
        }
        const comment:CommentsInDbType = {
            _id:new ObjectId(),
            content:content,
            commentatorInfo:{userId:user._id.toString(),userLogin:user.accountData.userName},
            createdAt:new Date().toISOString(),
            postId:postId
        }
        const newComment = await CommentModel.create(comment)
        await this.saveComment(newComment)
        return {
            id:comment._id.toString(),
            commentatorInfo:comment.commentatorInfo,
            content:comment.content,
            createdAt:comment.createdAt,
            likesInfo: {
                likesCount:0,
                dislikesCount:0,
                myStatus:likeEnum.None,
            }
        }
    }
    async getCommentById(id:string):Promise<HydratedDocument<CommentsInDbType>|null>{
        return  CommentModel.findOne({_id: new ObjectId((id))})
    }
    async updateComment(id:string,content:string){
       return  CommentModel.findOneAndUpdate({_id: new ObjectId(id)},{$set: {content}})
    }
    async deleteComment(id:string){
       return CommentModel.findOneAndDelete({_id: new ObjectId(id)})
    }
}
