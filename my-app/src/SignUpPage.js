import React, { useState } from 'react';
import { auth, firebaseApp } from './firebase'; // Import the auth object from firebase.js
import start from "./start.jpg"; // Import the image file
import roam_logo from "./roamMate_logo_no_bg.png"
import './signup-page.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, onValue} from 'firebase/database'
import { useNavigate } from 'react-router-dom'
import avatarPlaceholder from './profile-props/avatar-placeholder.jpg';


function SignUpPage() {
 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [repeatEmail, setRepeatEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const currentSite = useNavigate();

{/*Check if the password is valid. 
  Requirements: 
  - Longer than 8 characters
  - Has okay characters. */}
  const isPasswordValid = (password) => {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[@\-%&]/.test(password);
};

const navigateSignIn = async () => {
  currentSite('/')
};

  const handleSignUp = () => {
    if (!firstName || !lastName || !email || !repeatEmail || !password || !repeatPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if(repeatPassword !== password || !isPasswordValid ){
      alert("Password do not match repeated password")
      return;
    }
    if(email !== repeatEmail){
      alert("Email does not match repeated email")
      return;
    
    }
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userId = user.uid;
      console.log('User signed up:', user);
      alert("Successfully signed up");
  
      //Put the data into the realtime db. 
      const userBiography = "TEST Edit your bio here";
      const datab = getDatabase();
      
      set(ref(datab, 'user/'+ userId),{
        firstName: firstName,
        lastName: lastName,
        email: email,
        userBio: userBiography,
        profilePic: avatarPlaceholder
      });

  const userRef = ref(datab, 'user/̈́');
 /* onValue(userRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data);
  console.log(data.firstName);
  console.log(data.lastName);
  console.log(data.email)
});*/
/*
FOR READING THE DATABASE INSIDE TO SEE IF IT WORKS, spoiler, it does work :D 

      onValue(ref(datab, 'user'), (snapshot) => {
        const data = snapshot.val();
        console.log(data)
        console.log("I DID IT!!!")
        console.log("firstname: ", data.firstName);
        console.log("Last name: ", data.lastName);
        console.log("Email: ", data.email);
     

        import { getDatabase, ref, set } from "firebase/database";


      });*/
      
    }
    ).catch((error) => {
      console.error('Error saving user data to database:', error);
      alert('Error saving user data to database: ' + error.message);
    })
  .catch((error) => {
    console.error('Error signing up:', error.message);
    alert('Error signing up: ' + error.message);
  });
  }
  return (
    <div className="startPage" style={{ backgroundImage: `url(${start})`, backgroundSize: 'cover',
    height: '100vh' }}>
    <div className="startPageContent">
      <h2>Sign Up</h2>
        <input 
          type="text" 
          placeholder="First Name" 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Last Name" 
          value={lastName} 
          onChange={(e) => setLastName(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Repeat Email" 
          value={repeatEmail} 
          onChange={(e) => setRepeatEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Repeat Password" 
          value={repeatPassword} 
          onChange={(e) => setRepeatPassword(e.target.value)} 
        />
 <button className="signUp" onClick={handleSignUp}>Sign Up</button>
        <p className="account">Already have an account? <button className="signIn" onClick={navigateSignIn}>Sign In</button></p>
      </div>
    </div>
  );
}

export default SignUpPage;
