import React from 'react';
import './UserProfilePage.css'; //import my css file
import roam_logo from "./roamMate_logo_no_bg.png"
import {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import Avatar from './profile-props/Avatar'
import Post from './profile-props/Post'

import { useLocation, useNavigate } from 'react-router-dom';
import {ref, getDatabase, onValue, get} from 'firebase/database'

const UserProfilePage = () => {
  
  const location = useLocation();
  const navigate = useNavigate();

  // Access userName from location.state if available
  const userName = location.state?.userName;
  const firstName = userName.split(" ")[0];
  const lastName = userName.split(" ")[1];
 

  const [posts, setPosts] = useState([]);
  const [userBio, setBiography] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');


  {/*Set all necessary information about fetched user.
    Go through all users in /user/. If one matches the first and lastname, fetch their information*/}
  const fetchUserInfo = async () => {
    const db = getDatabase();
    if(!firstName || !lastName){
      alert("Something went wrong");
      return null;
    }
    else{
      try{
        const userSnapshot = await get(ref(db,  `user`)); //fetch all users instead
        for (const userId of Object.keys(userSnapshot.val())){
          const user = userSnapshot.val()[userId];
          if((user.firstName).toLowerCase() == firstName.toLowerCase() && (user.lastName).toLowerCase() == lastName.toLowerCase()){
            //found user
            setUserId(userId); //set user ID
            setProfilePic(user.profilePic);
            setBiography(user.userBio);
            setEmail(user.email);
            return;
          }
        }
      }
      catch(error){
        console.log("Something went wrong", error)
      }
    }
  };

  {/*Upon rendering. Fetch the user info. Separate because of async */}
  useEffect(() => {
    fetchUserInfo();
  }, []);

  {/*Upon rendering, fetch the user's postwall.
    Only run when userID is fetched from fetchUserInfo(). Didn't work otherwise.  */}
  useEffect(() => {
      if(userId){ 
        const db = getDatabase();
        const postsRef = ref(db, 'postWall/' + userId);
        onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
          console.log("current data: ", data)
          if (data) {
            const postsArray = Object.entries(data).map(([key, post]) => ({
              id: key, // Use the key as an ID
              postText: post.postText, // Extract the postText from the object
              email: post.email //NEW: add email from post
            }));
            setPosts(postsArray); // Set the posts to be rendered
            }
  });
      }else{
        setPosts([]); //empty if no posts are found somehow

      }
  }, [userId]); 





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

      <div id="gridProfileAbout">
      <div id="profile-about">
        
        <Avatar alt="avatarPicture" src={profilePic}/>
        <div user-name-div>
          <label id="user-name-label">{firstName}</label>
          <label id="user-lastname-label">{lastName}</label>
        </div>      
        
        <p id="editableText" contentEditable="false">{userBio}</p>
        
        <div id="profile-picture">
            
        </div>
      </div>
      </div>

     

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

export default UserProfilePage;
