const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const POSTS_URL = process.env.POSTS_URL || "http://localhost:4000";
const COMMENTS_URL = process.env.COMMENTS_URL || "http://localhost:4001";
const QUERY_URL = process.env.QUERY_URL || "http://localhost:4002";
const MODERATION_URL = process.env.MODERATION_URL || "http://localhost:4003";

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', async (req, res, next) => {
  const event = req.body;

  events.push(event);

  try {
    await Promise.allSettled([
      axios.post(`${POSTS_URL}/events`, event),
      axios.post(`${COMMENTS_URL}/events`, event),
      axios.post(`${QUERY_URL}/events`, event),
      axios.post(`${MODERATION_URL}/events`, event)
    ]);
  } catch (error) {
    return next(error);
  }

  res.send({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.send(events);
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

app.listen(4005, () => {
  console.log(`posts service at ${POSTS_URL}`);
  console.log(`comments service at ${COMMENTS_URL}`);
  console.log(`query service at ${QUERY_URL}`);
  console.log(`moderation service at ${MODERATION_URL}`);
  console.log('Listening on 4005');
});
