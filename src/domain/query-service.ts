import {BlogDbType, blogsCollectionDb, BlogType, PostDBType, postsCollectionDb, PostType} from "../repositories/db";
export  type QueryInputType = {
    pageNumber:string,
    pageSize:string,
    sortBy:string,
    sortDirections:string,
    searchNameTerm:string
}

export type paginationType={
    totalCount:number,
    pagesCount:number
}


export const blogQueryService={
    async paginationPage(searchNameTerm?:string,pageNumber:number=1,pageSize:number=10):Promise<paginationType>{
        const filter = searchNameTerm ? {name: {$regex: searchNameTerm}}:{}
        const   totalCount = await blogsCollectionDb.countDocuments(filter)
        const   pagesCount = Math.ceil(totalCount / pageSize)

        return {totalCount,pagesCount};
    }
    ,
    async findBlogsByQuerySort(sortBy:string='createdAt',sortDirections:string,searchNameTerm?:string,
                               pageNumber:number=1,pageSize:number=10):Promise<Array<BlogType>>
    {
        const filter = searchNameTerm ? {name: {$regex: searchNameTerm}}:{}

        if(sortDirections==='asc') {
            const blogs: BlogDbType[] = await blogsCollectionDb.find(filter)
                .sort({[sortBy]: 1})
                .skip(pageNumber*pageSize)
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
                .skip(pageNumber*pageSize)
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
    async paginationPage(pageNumber:number=1,pageSize:number=10):Promise<paginationType>{
        const   totalCount = await postsCollectionDb.countDocuments()
        const   pagesCount = Math.ceil(totalCount / pageSize)

        return {totalCount,pagesCount};
    }
    ,
    async findPostsByQuerySort(sortBy:string='createdAt',sortDirections:string,
         pageNumber:number,pageSize:number,blogId?:string)
            :Promise<Array<PostType>>
        {
            const filter = blogId ? {blogId:blogId} :{}
            if(sortDirections==='asc') {
                const posts: PostDBType[] = await postsCollectionDb.find(filter)
                    .sort({[sortBy]: 1})
                    .skip(pageNumber*pageSize)
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
                .skip(pageNumber*pageSize)
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