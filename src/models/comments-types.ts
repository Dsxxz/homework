export type CommentsViewType ={
    id:string,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string
}
export type CommentsInDbType={
    id:string,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string
    postId:string
}
export  type  CommentatorInfo={
    userId:string
    userLogin:string
}
