
const request = require('supertest');
const app = require('./app');

it('DELETE /comments', async () => {
 const res = await request(app).delete('/comments').send({
    commentId: "ddzadzadazfgae83218321",

})



 expect(res.statusCode).toBe(200);
 expect(res.body.stock).toBe(true);
});

