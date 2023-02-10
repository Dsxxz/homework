export  type QueryInputBlogAndPostType = {
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
export  type QueryInputCommentsType = {
    pageNumber:string,
    pageSize:string,
    sortBy:string,
    sortDirection:string
}