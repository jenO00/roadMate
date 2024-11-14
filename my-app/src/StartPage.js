import React, { useState } from 'react';
import { auth } from './firebase'; // Import the auth object from firebase.js
import logo from './start.jpg'; // Import the image file
import roam_logo from "./roamMate_logo_no_bg.png"
import './start-page.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth';

function StartPage() {
  const currentSite = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
      const user = userCredential.user;
      currentSite('/explore')
    })
    .catch((err) => {
      alert("Error ", + err.code + ": " + err.message);
      console.log(err.code);
      console.log(err.message);
    });
  };

  const navigateSignUp = async () => {
    currentSite('/signup')
  };

  return (
    <div className="startPage" style={{ backgroundImage: `url(${logo})` }}>
      <div className="startPageContent">
        <h2>Sign Up</h2>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}  
        />
        <button className="signIn" onClick={signIn} >Sign In</button>
        <p className="account">Do not have an account? </p>
        <button className="signUp" onClick={navigateSignUp} >Sign up here</button>
      </div>
    </div>
  );
}
export default StartPage;

