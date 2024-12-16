const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const User = require('./models/users');
// const List = require("./models/lists");

const newUser = { username: 'testAcount', email: "testaccount@email.com", password: 'test123' };
const newList = { username: "testAccount", listName: "testList", isPublic: false }
const newGame = { username: "testAccount", listName: "testList", gameName: "Minecraft" }

it('POST /addToList', async () => {
    const res = await request(app).post('/users/signup').send(newUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);

    const res2 = await request(app).post('/lists/addList').send(newList);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.result).toBe(true);

    const res3 = await request(app).post('/games/addToList').send(newGame);
    expect(res3.statusCode).toBe(200);
    expect(res3.body.result).toBe(true);
});

afterAll(async () => {
    // delete la liste avant de delete le user ?
    await User.deleteOne({ username: new RegExp(newUser.username, 'i') });
    mongoose.connection.close();
});  