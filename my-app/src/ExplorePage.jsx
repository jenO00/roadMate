import React from 'react';
import { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import the auth object from firebase.js
import roam_logo from "./roamMate_logo_no_bg.png"
import './explore-page.css';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import bali from "./bali.jpeg";
import naples from "./naples.jpeg"
import { getDatabase, ref, get, child } from "firebase/database"; 

const ExplorePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  

  {/*Function which, upon clicking the picture of Bali, navigates user to Destination page with bali information */}
  const searchBali = async (e) =>{
    navigate('/destination/bali', {state: {destinationTitle:"bali"}});
  };

  {/*Function which, upon clicking the picture of Nepal, navigates user to Destination page with Nepal information */}
  const searchNepal = async (e) => {
    navigate('/destination/nepal', {state: {destinationTitle:"nepal"}});
  };

  {/*searchQuery: what the user entered into the search bar. 
    Splits the searchQuery into a firstname and a lastname, checks database if this user exists. 
    Returns: all user information if user exists. */}
  const userExists = async () =>{
    const db = getDatabase();
    const [userFirstName, userLastName] = searchQuery.toLowerCase().split(" ");
    if(!userFirstName || !userLastName){
      alert("Enter both first and surname to search for a user! Or another destination");
      return null;
    }
    else{
      const formattedFirstName = userFirstName.toLowerCase();
      const formattedLastName = userLastName.toLowerCase();
      //user entered first and last name! 
      try{
        const userSnapshot = await get(ref(db,  `user`)); //fetch all users instead
        let userInfo = null; 
        //traverse each userID in /user. If first and lastname matches, we exit
        for (const userId of Object.keys(userSnapshot.val())){
          const user = userSnapshot.val()[userId];
          if((user.firstName).toLowerCase() == formattedFirstName && (user.lastName).toLowerCase() == formattedLastName){
            //found user
            userInfo = {id: userId.key, ... user};
            return userInfo;
          }  
      };
    }
    catch(error){
      console.log("Did not find anything", error)
    }
    return null; //return null if nothing is found
    }
  };

{/*Upon search, checks if the search regards a user or a destination.
  searchQuery: What the user entered in the search bar. 
  Returns nothing, navigates upon match in database*/}
  const handleSearchQuery = async (e) => {
    e.preventDefault();
    const db = ref(getDatabase());
    try {
      {/*Check if the searchQuery exists in the destinations in db.
       If destination exists, the user entered a destination and we can navigate. 
       App.js: /destination/:name */}
      const snapshot = await get(child(db, `destinations/${searchQuery.toLowerCase()}`));
      if (snapshot.exists()) {
        
        const destination = snapshot.val();
        navigate(`/destination/${searchQuery}`, { state: { destinationTitle: destination.name } });
      } 
      //If no destination found, it could be a user instead!
      else {
        {/*Code to handle search for user. Check first if it is a user in function userExists
        If the user exists, remove unwanted characters which could create mismatch with navigation specified in App.js. 
        Construct an url in this format: firstname-lastname. Send as fullName. Was hard to do two dynamic names.
        App.js: /user/:fullName. */}
        const userInfo = await userExists();
       
        if(userInfo){
          const formatFirstName = userInfo.firstName.trim().toLowerCase().replace(/\s+/g, "-");
          const formatLastName = userInfo.lastName.trim().toLowerCase().replace(/\s+/g, "-");
          const fullName = `${formatFirstName}-${formatLastName}` 
          const showCaseName = `${userInfo.firstName.trim()} ${userInfo.lastName.trim()}`; 

          
          const constructedUrl = `/user/${fullName}`;
          navigate(constructedUrl, {state: {userName: showCaseName}});
        }
        else{
          //no user, no destination 
          alert("Destination or user not found");
        }
      }
    } catch (error) {
      console.error("Error fetching destination:", error);
    }
  };


  return (
    <div className="explore-page-container">
      <div id="gridHeader-container">
        <div id="logo-container">
          <img src={roam_logo} id="roam-logo" alt="Roam Logo" />
        </div>
        <ul className="explore-links">
          <li><Link className="explore-link" to="explore" onClick={(e) => {e.preventDefault();navigate("/explore");}}>Explore</Link></li>
          <li><Link className="profile-link" to="profilepage" onClick={(e) => {e.preventDefault();navigate("/profilepage"); }}>Profile</Link></li>
        </ul>
      </div>

      <div id="gridTitleSearch">
        <h1 className="explore-page-title">Explore</h1>

      {/* Search Bar */}
        <div className="search-bar">
          <input type="text" placeholder="Find friends, destinations, hotels?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button id="write-button" type="submit" onClick={handleSearchQuery}>Search</button>
        </div>
      </div>
    
   
      <h1 id="recommended-title">Recommended</h1>
      <div id="gridExplorePic1">
        <img src={bali} alt="Bali" onClick={searchBali}/>
      </div>
      <div id="gridExplorePic2">
        <img src={naples} alt="Nepal" onClick={searchNepal}/>
      </div>
   
    
    </div>

   
  );
};

export default ExplorePage;
