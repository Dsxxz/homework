import {
    BlogDbType,
    blogsCollectionDb,
    BlogType,
    PostDBType,
    postsCollectionDb,
    PostType,
    usersCollectionDb
} from "../repositories/db";
import {UserInDbType, UserViewModel} from "../models/userType";
export  type QueryInputType = {
    pageNumber:string,
    pageSize:string,
    sortBy:string,
    sortDirection:string,
    searchNameTerm:string
}

export type paginationType={
    totalCount:number,
    pagesCount:number
}


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
                description: blog.description
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
                description: blog.description
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
    async paginationPage(pageNumber:number=1,pageSize:number=10):Promise<paginationType>{
        const   totalCount = await usersCollectionDb.countDocuments()
        const   pagesCount = Math.ceil(totalCount / pageSize)
        return {totalCount,pagesCount};
    }
    ,
    async findUsersByQuerySort(sortBy:string='createdAt',searchLoginTerm:string='',searchEmailTerm:string='',
                               pageNumber:number=1,pageSize:number=10,sortDirection:string='desc')
        :Promise<Array<UserViewModel>>
    {
        const filterEmail = searchEmailTerm ? {email:searchEmailTerm} :{}
       const filterLogin = searchLoginTerm ? {login:searchLoginTerm} :{}
        if(sortDirection==="asc") {
            const users: UserInDbType[] = await usersCollectionDb.find({$or:[filterEmail, filterLogin]})
                .sort({[sortBy]: 1})
                .skip((pageNumber-1)*pageSize)
                .limit(pageSize)
                .toArray();
            return users.map((user:UserInDbType) => ({
                id:user._id.toString(),
                login:user.userName,
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
                login:user.userName,
                email:user.email,
                createdAt:user.createdAt
            }))}}}