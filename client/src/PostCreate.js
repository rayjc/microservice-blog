import React, { useState } from 'react';
import axios from 'axios';

export default () => {
  const [title, setTitle] = useState('');

  const onSubmit = async event => {
    event.preventDefault();

    try {
      await axios.post('http://localhost:4000/posts', {
        title
      });
    } catch (error) {
      console.error("API error", error.response);
      if (error.response) {
        let message = error.response.data.message;
        throw Array.isArray(message) ? message : [message];
      }
      throw "Server probably crashed...";
    }

    setTitle('');
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};
