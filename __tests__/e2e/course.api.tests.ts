import request from "supertest";
import {app} from "../../src";
import {response} from "express";
import {BlogType} from "../../src/models/blogs-types";
describe('/blogs',()=>{
    beforeAll(async ()=>{
        await request(app)
            .delete('/testing/all-data')
    })

    it('should return 200 and empty array',async ()=>{
        await request(app)
            .get('/blogs')
            .expect(200,{ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    })
    it('should return 404 for not existing blog',async ()=>{
        await request(app)
            .get('/blogs/1')
            .expect(404)
    })
    it('should NOT create blog with correct data for Unauthorized users',async ()=>{
        await request(app)
            .post('/blogs')
            .send({
                "name": "string",
                "description": "string",
                "websiteUrl": "https://0wTJZNoXXB4PGxS3445cMCtmHvGOKuh4m8d-kLpSTCM3njzWObJw6vk3lwNQhBucLgT3aUbPu6Gjw8k2YpfoEplQ.zrT"
            })
            .expect(401)
    })

    it('should  create blog with correct for authorized users',async ()=>{
        await request(app)
            .post('/blogs')
            .send({
                "name": "string",
                "description": "string",
                "websiteUrl": "https://0wTJZNoXXB4PGxS3445cMCtmHvGOKuh4m8d-kLpSTCM3njzWObJw6vk3lwNQhBucLgT3aUbPu6Gjw8k2YpfoEplQ.zrT"
            })
            .auth('admin', 'qwerty')
            .expect(201)

    })
    it('should return 200 for existing blog name',async ()=>{
        await request(app)
            .get('/blogs?name=string')
            .expect(200)
    })
    it('should return 404 for not existing blog name',async ()=>{
        await request(app)
            .get('/blogs?searchNameTerm=55555')
            .expect(200,{ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    })
    it('should return 200 for existing blog name',async ()=>{
        const res = await request(app)
            .get('/blogs?searchNameTerm=string')
            .expect(200)
            expect(res.body.items).toHaveLength(1)
    })

    it('should return 200 ',async ()=>{
        const res = await request(app)
            .get('/blogs')
            .expect(200)

        const responseForBlog = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty')
            .send({
                name: 'name',
                websiteUrl: 'https://youtube.com',
                description: 'valid description',
            });


    })
    let id:string


    it('should return 200 ',async ()=>{
        const responseForBlog = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty')
            .send({
                name: 'name',
                websiteUrl: 'https://youtube.com',
                description: 'valid description',
            });

        const blog = responseForBlog.body;
        expect(blog).toBeDefined();
        id = blog.id
        console.log(id)
        const res = await request(app)
            .get(`/blogs/${id}`)
            .expect(200)
        expect(res.body.items).toHaveLength(1)
    })

    it('should return 204 for successful blog update',async ()=>{

            await request(app)
            .put(`/blogs/${id}`)
            .auth('admin', 'qwerty')
            .send({"name":"name","websiteUrl": 'https://youtube.com',"description": "description"})
            .expect(204)

    })
    it('should return 404 for updated blog',async ()=>{
             await request(app)
            .get(`/blogs/${id}`)
                 .auth('admin', 'qwerty')
                 .send({})
                 .expect(404)
    })

})