import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentCreate from './CommentCreate';
import CommentList from './CommentList';
import { BACKEND_URL } from './config';

export default () => {
  const [posts, setPosts] = useState({});

  const fetchPosts = async () => {
    try {
      // console.log(`BACKEND_URL: ${BACKEND_URL}`);
      const res = await axios.get(`${BACKEND_URL}/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error("API error", error.response);
      if (error.response) {
        let message = error.response.data.message;
        throw Array.isArray(message) ? message : [message];
      }
      throw new Error("Server probably crashed...");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderedPosts = Object.values(posts).map(post => {
    return (
      <div
        className="card"
        style={{ width: '30%', marginBottom: '20px' }}
        key={post.id}
      >
        <div className="card-body">
          <h3>{post.title}</h3>
          <CommentList comments={post.comments} />
          <CommentCreate postId={post.id} />
        </div>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flex-wrap justify-content-between">
      {renderedPosts}
    </div>
  );
};
