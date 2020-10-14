const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const EVENT_BUS_URL = process.env.EVENT_BUS_URL || "http://localhost:4005";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/posts/create', async (req, res, next) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title
  };

  try {
    await axios.post(`${EVENT_BUS_URL}/events`, {
      type: 'PostCreated',
      data: {
        id,
        title
      }
    });
  } catch (error) {
    return next(error);
  }

  return res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);

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

app.listen(4000, () => {
  console.log(`event bus at ${EVENT_BUS_URL}`);
  console.log('Listening on 4000');
});
