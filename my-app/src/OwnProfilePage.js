import React from 'react';
import './OwnProfilePage.css'; //import my css file
import roam_logo from "./roamMate_logo_no_bg.png"
import {useState, useEffect} from 'react';
import Avatar from './profile-props/Avatar'
import { firebaseApp, auth } from './firebase';
import {getAuth, signOut} from 'firebase/auth';
import Post from './profile-props/Post'
import { postNewMessage } from './profile-props/Post';
import pencil_icon from "./profile-props/pencil-edit-icon.png";
import { getDatabase, ref, onValue, set, update, push } from 'firebase/database'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const OwnProfilePage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [file, setFile] = useState();
  const [posts, setPosts] = useState([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userBio, setBiography] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [email, setEmail] = useState('');


  {/*Set all necessary information from the database.
    Fetches the currently loggedinUser, then all their information.*/}
  useEffect(() => {
    const db = getDatabase();
    const loggedinUser = auth.currentUser;
    if (loggedinUser){
      const userId = loggedinUser.uid;
      const userRef = ref(db, 'user/' + userId);

      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
        
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
          setProfilePic(userData.profilePic);
          setBiography(userData.userBio);
          setEmail(userData.email);

        }
      });
      {/*Show the user's all posted messages. */}
      const postsRef = ref(db, 'postWall/' + userId); 
      onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const postsArray = Object.entries(data).map(([key, post]) => ({
            id: key, // Use the key as an ID
            postText: post.postText, // Extract the postText from the object
            email: post.email 
          }));
          setPosts(postsArray); // Set the posts to be rendered
          }
});
    } 
  }, []); 

 {/*Edit the biography of the user upon change. 
  Could be done in a better way, as contentEdible gives a "warning" in console. But works for now.
  When pressing the edit pencil, contentEdible toggles to true so the text is edible. 
  Makes the Save Edit button visible*/} 
  const editDescription = (event) => {
    var editText = document.getElementById("editableText");
    editText.contentEditable = "true";
    document.getElementById("saveEditButton").style.display = "block";
  }


  {/*Sign out the logged in user and navigate to login*/}
  const handleSignOut = () =>{
    const userAuth = getAuth();
    if(userAuth) {
      try{
        signOut(userAuth) //sign out current user
        navigate("/"); //back to start page <3 
      }
      catch(error){
        console.log("Could not sign user out", error)
      }
    }
  }

 {/*Update the biography of the user upon change.*/}
  const saveBiography = (event) => {
    const db = getDatabase();
    var editText = document.getElementById("editableText") //fetch the biography 
    var newUserBio = editText.innerText; //fetch the text only 
    const loggedinUser = auth.currentUser;
    if (loggedinUser){
      const userId = loggedinUser.uid;
      const userRef = ref(db, 'user/' + userId + '/');
      update(userRef, {
        userBio: newUserBio
      })
    
    //make the text uneditable again and hide the save button. 
    editText.contentEditable = "false";
    document.getElementById("saveEditButton").style.display="none";
    alert("Successfully changed bio!")
  }
  else{
    alert("Not logged in");
  }
}


{/*Add post visibly to the page.
  Calls funciton addPostToDatabase with the text user wrote.*/}
  const handlePost = (event) =>{
    const db = getDatabase();
    if (text.trim() !== '') {
        const currentEmail = email;
        const userId = auth.currentUser.uid; 
        addPostToDatabase(userId, text.trim()); //add it so we can update postwall continuously
        }
    else{
      alert("Write something to post!")
    }

  };

{/*Push post to the database.
  Parameters:
  userID: the user's userID. 
  text: the text the user added to the post. */}
  function addPostToDatabase(userId, text){
    const db = getDatabase();
    push(ref(db, 'postWall/'+ userId + '/'),{
      postText: text,
      email: email 
    });
  }


 {/*Function to ensure change of the avatar.
  Right now, this is redundant and does not work.*/}
  function handleChangeOfAvatar(e) {
    const newFile = e.target.files[0];
    if(!newFile){
      console.log("No file?")
    }
    else{
      //file exists
      const db = getDatabase();
      const userId = auth.currentUser.uid; 
      const userRef = ref(db, 'user/' + userId); 
      
    }
    console.log(e.target.files);
    setFile(URL.createObjectURL(e.target.files[0]));
}
  return (
    <div className="profile-page-container" style={{backgroundSize: 'cover'}}>
      <grid id="gridHeader">
      <div id="logo-and-links">
        <header id="profile-header">
          <div id="image_container">
            <img src={roam_logo} id="roam-logo"/>
          </div>
          <ul className="explore-links">  
          <li><Link className="explore-link" to="explore" onClick={(e) => {e.preventDefault();navigate("/explore");}}>Explore</Link></li>
          <li><Link className="profile-link" to="profilepage" onClick={(e) => {e.preventDefault();navigate("/profilepage"); }}>Profile</Link></li>
        </ul>
      </header>
      </div>
      </grid>

      <grid id="gridProfileAbout">
      <div id="profile-about">
        
        <Avatar alt="avatarPicture" src={profilePic} onClick={handleChangeOfAvatar}/>
        <div user-name-div>
          <label id="user-name-label">{firstName}</label>
          <label id="user-lastname-label">{lastName}</label>
          <img src={pencil_icon} id="pencil-edit-icon" onClick={editDescription}/>
        </div>

           
        
        <p id="editableText" contentEditable="false">{userBio}</p>
        <button id="saveEditButton" onClick={saveBiography}>Save</button>
        <div id="profile-picture">
            
        </div>
        <div id="divSignOutButton">
          <button id="sign-out-button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
      </grid>

      <grid id="gridTextbox">
      <div className="post-textbox-container">
        <textarea id="post-textbox"
          placeholder="Any new travel stories?"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={200} // Limit the maximum number of characters, as on twitter, typ coolt
      />
        <div id="char-and-button">
          <p>Characters remaining: {200 - text.length}</p>
          <button id="post-message-button" onClick={handlePost}>Post</button>
        </div>
      </div>
      </grid>

      <grid id="gridPostWall"> 
      <div className="post-wall-container">
        <h1>Posted messages</h1> 
         {posts.map((post) => (
          <Post key={post.id} email={post.email} text={post.postText} /> //Ändrat denna del, från post.text till post.postText eftersom det fältet faktiskt finns i objekten som hämtas från firebase. Detta löste problemet med att inlägg inte visades.
        ))}
      </div>
      </grid>
     
    </div>
  );
}

export default OwnProfilePage;