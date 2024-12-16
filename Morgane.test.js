const request = require('supertest');
const app = require('./app');

it('POST /comments/likes', async () => {
    const res = await request(app).post('comments/likes').send({
    username: 'admin',
    ratingsId: '675d5df638e42c67aab1df6c',
    });
   
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
   });

