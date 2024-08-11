// import express from "express";
// import {router} from "../tools/router";
// import request from "supertest";
//
// const app = express();
// app.use(express.json());
// app.use('/api', router);
//
// describe('/api/table', () => {
//     let random: number;
//     let tokenAnton: string;
//     let tokenRoot: string;
//
//     beforeEach(async () => {
//         jest.resetAllMocks();
//
//         random = Math.floor(Math.random() * 100);
//
//         const responseWithTokenForAnton = await request(app)
//             .post('/api/auth')
//             .send({username: 'anton', password: 'anton'});
//         tokenAnton = responseWithTokenForAnton.body.token;
//
//         const responseWithTokenForRoot = await request(app)
//             .post('/api/auth')
//             .send({username: 'root', password: 'root'});
//         tokenRoot = responseWithTokenForRoot.body.token;
//     })
//
//     describe('get', () => {
//         test('get - Authentication Required', async () => {
//             const response = await request(app)
//                 .get('/api/table')
//                 .expect('Content-Type', /json/)
//                 .expect(401);
//
//             expect(response.body.message).toBe('Authentication Required');
//         });
//         test('get - Success', async () => {
//             const response = await request(app)
//                 .get('/api/table')
//                 .set('Authorization', `Bearer ${tokenAnton}`)
//                 .send()
//                 .expect('Content-Type', /json/)
//                 .expect(200);
//
//             console.log(response.body);
//         });
//         test('get - Success for Root', async () => {
//             const response = await request(app)
//                 .get('/api/table')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send()
//                 .expect('Content-Type', /json/)
//                 .expect(200);
//
//             console.log(response.body);
//         });
//     });
//
//     describe('create', () => {
//         test('create - Access Denied', async () => {
//             const response = await request(app)
//                 .post('/api/table')
//                 .send({name: 'table1', title: 'table1'})
//                 .set('Authorization', `Bearer ${tokenAnton}`)
//                 .expect('Content-Type', /json/)
//                 .expect(403);
//
//             expect(response.body.message).toBe('Access Denied');
//         });
//         test('create - Invalid Request', async () => {
//             const response = await request(app)
//                 .post('/api/table')
//                 .send({title: 'table1'})
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .expect('Content-Type', /json/)
//                 .expect(400);
//
//             expect(response.body.message).toBe('Invalid Request');
//         });
//         test('create - Success', async () => {
//             const randomExtended = `${random}${random * 13}`;
//             const response = await request(app)
//                 .post('/api/table')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({
//                     name: `Test Table #${randomExtended}`,
//                     title: 'Created by unit tests'
//                 })
//                 .expect('Content-Type', /json/)
//                 .expect(201);
//
//             expect(response.body.name).toBe(`Test Table #${randomExtended}`);
//         });
//     });
//
//     describe('edit', () => {
//         test('edit - Authentication Required', async () => {
//             const response = await request(app)
//                 .put('/api/table')
//                 .send({name: 'table1', title: 'table1'})
//                 .expect('Content-Type', /json/)
//                 .expect(401);
//
//             expect(response.body.message).toBe('Authentication Required');
//         });
//         test('edit - Invalid Request', async () => {
//             const response = await request(app)
//                 .put('/api/table')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({title: 'table1'})
//                 .expect('Content-Type', /json/)
//                 .expect(400);
//
//             expect(response.body.message).toBe('Invalid Request');
//         });
//         test('edit - Success', async () => {
//             const response = await request(app)
//                 .put('/api/table')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({id: 1, name: `table_${random}`, title: `Random13: ${random}`})
//                 .expect('Content-Type', /json/)
//                 .expect(201);
//
//             expect(response.body.title).toBe(`Random13: ${random}`);
//         });
//     });
//
//     describe('remove', () => {
//         test('remove - Authentication Required', async () => {
//             const response = await request(app)
//                 .delete('/api/table')
//                 .send({id: 2})
//                 .expect('Content-Type', /json/)
//                 .expect(401);
//
//             expect(response.body.message).toBe('Authentication Required');
//         });
//         test('remove - Invalid Request', async () => {
//             const response = await request(app)
//                 .delete('/api/table')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send()
//                 .expect('Content-Type', /json/)
//                 .expect(400);
//
//             expect(response.body.message).toBe('Invalid Request');
//         });
//         test('remove - Success', async () => {
//             setTimeout(async () => {
//                 const response = await request(app)
//                     .delete('/api/table')
//                     .set('Authorization', `Bearer ${tokenRoot}`)
//                     .send({id: 2})
//                     .expect('Content-Type', /json/)
//                     .expect(201);
//
//                 expect(response.body.deleted).toBe(1);
//             }, 500);
//         });
//     });
//
//     describe('groupAdd', () => {
//         test('groupAdd - Authentication Required', async () => {
//             const response = await request(app)
//                 .post('/api/table/group')
//                 .send({tableId: 1, groupId: 1})
//                 .expect('Content-Type', /json/)
//                 .expect(401);
//
//             expect(response.body.message).toBe('Authentication Required');
//         });
//         test('groupAdd - Invalid Request', async () => {
//             const response = await request(app)
//                 .post('/api/table/group')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({tableId: 0, groupId: 1})
//                 .expect('Content-Type', /json/)
//                 .expect(400);
//
//             expect(response.body.message).toBe('Invalid Request');
//         });
//         test('groupAdd - Success', async () => {
//             const response = await request(app)
//                 .post('/api/table/group')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({tableId: 4, groupId: 3})
//                 .expect('Content-Type', /json/)
//                 .expect(201);
//
//             expect(response.body.tableId).toBe(4);
//         });
//     });
//
//     describe('groupRemove', () => {
//         test('groupRemove - Authentication Required', async () => {
//             const response = await request(app)
//                 .delete('/api/table/group')
//                 .send({tableId: 1, groupId: 1})
//                 .expect('Content-Type', /json/)
//                 .expect(401);
//
//             expect(response.body.message).toBe('Authentication Required');
//         });
//         test('groupRemove - Invalid Request', async () => {
//             const response = await request(app)
//                 .delete('/api/table/group')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({tableId: 0, groupId: 1})
//                 .expect('Content-Type', /json/)
//                 .expect(400);
//
//             expect(response.body.message).toBe('Invalid Request');
//         });
//         test('groupRemove - Success', async () => {
//             const response = await request(app)
//                 .delete('/api/table/group')
//                 .set('Authorization', `Bearer ${tokenRoot}`)
//                 .send({tableId: 4, groupId: 3})
//                 .expect('Content-Type', /json/)
//                 .expect(201);
//
//             expect(response.body.tableId).toBe(4);
//         });
//     });
//
// });
