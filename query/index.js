const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const EVENT_BUS_URL = process.env.EVENT_BUS_URL || "http://localhost:4005";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
  switch (type) {
    case 'PostCreated': {
      const { id, title } = data;
      posts[id] = { id, title, comments: [] };
      break;
    }
    case 'CommentCreated': {
      const { id, content, postId, status } = data;
      const post = posts[postId];
      post.comments.push({ id, content, status });
      break;
    }
    case 'CommentUpdated': {
      const { id, content, postId, status } = data;
      const post = posts[postId];
      const comment = post.comments.find(comment => {
        return comment.id === id;
      });

      comment.status = status;
      comment.content = content;
      break;
    }

    default:
      break;
  }
};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

/** 404 Not Found handler. */
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/** Generic error handler. */
app.use((err, req, res, next) => {
  if (err.stack) console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message,
  });
});

app.listen(4002, async () => {
  console.log(`event bus at ${EVENT_BUS_URL}`);
  console.log('Listening on 4002');

  const res = await axios.get(`${EVENT_BUS_URL}/events`);

  for (let event of res.data) {
    console.log('Processing event:', event.type);

    handleEvent(event.type, event.data);
  }
});
