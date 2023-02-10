export type CommentInputModel={
    content:string
}
export type CommentsInDbType={
    id:string,
    content:string,
    commentatorInfo:CommentatorInfo
    createdAt:string
}
export  type  CommentatorInfo={
    userId:string
    userLogin:string
}
export  type LoginSuccessViewModel={
    accessToken:string
}