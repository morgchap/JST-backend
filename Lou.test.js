const request = require('supertest');
const app = require('./app');

it('POST /comments', async () => {
    const res = await request(app).post('/comments').send({
        ratingsId: '675f250b560a83a903547eac',
        userId: '675f243223fb7728fe63bcbd',
        content: 'I love this game ',
    });
   
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
   });
