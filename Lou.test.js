const request = require('supertest');
const app = require('../app');
const { Comment, User, Game } = require('../models');

describe('Comment API', () => {
  it('should create a new comment', async () => {
    const user = await User.create({ ... });
    const game = await Game.create({ ... });

    const newComment = {
      userId: user._id,
      gameId: game._id,
      content: 'Très bon jeu !',
      note: 5,
    };

    const res = await request(app)
      .post('/comments')
      .send(newComment);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');

    const createdComment = await Comment.findById(res.body._id).populate('user game');
    expect(createdComment.user._id).toEqual(user._id);
    expect(createdComment.game._id).toEqual(game._id);
  });
});