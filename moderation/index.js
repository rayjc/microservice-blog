const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const EVENT_BUS_URL = process.env.EVENT_BUS_URL || "http://localhost:4005";

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res, next) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    try {
      await axios.post(`${EVENT_BUS_URL}/events`, {
        type: 'CommentModerated',
        data: {
          id: data.id,
          postId: data.postId,
          status,
          content: data.content
        }
      });
    } catch (error) {
      return next(error);
    }
  }

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

app.listen(4003, () => {
  console.log(`event bus at ${EVENT_BUS_URL}`);
  console.log('Listening on 4003');
});
