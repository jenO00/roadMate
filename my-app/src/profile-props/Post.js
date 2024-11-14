import React from 'react';
import { firebaseApp, auth } from '../firebase';
import './Post.css'
import '../OwnProfilePage.js'
import {getDatabase } from 'firebase/database'


{/*Post component, so we can reuse it when posting something.*/}
const Post = ({ email, text }) => {
  return (
    <div className="visiblePost">
       <p>Post by: {email}</p> {/* Här visar vi e-posten för användaren */}
      <p id="postText">{text}</p>
    </div>
  );
};

export default Post;