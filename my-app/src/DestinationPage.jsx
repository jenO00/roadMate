import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import roam_logo from "./roamMate_logo_no_bg.png";
import './DestinationPage.css'
import axios from 'axios';
import { getDatabase, ref, onValue, get, child, push, update } from 'firebase/database'
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import stars!! 
import { auth } from './firebase';
import Review from './profile-props/Reviews'


const DestinationPage = () => {
    const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_KEY; //API key for pictures upon destination match
    const navigate = useNavigate();
    const destination = useLocation();
    const destinationTitle = destination.state?.destinationTitle; 
    const displayedTitle = destinationTitle.toUpperCase();

    const [imageUrl, setImageUrl] = useState(null);
    const [destinationDescription, setDestinationDescription] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [reviews, setReviews] = useState([])
    const [ratingAverage, setRatingAverage] = useState(null);

    
    {/*Returns: true if a user exists in the reviews. False if not. 
      Prevents multiple reviews and spam.
      Parem: UserID. */}
    const hasReviewed = async (userId) => {
      const db = getDatabase();
      const dbRef = ref(db, `destinations/${destinationTitle.toLowerCase()}/reviews/${userId}`);
      try{
        const reviewExists = await get(dbRef); //Await is important? nothing works otherwise..
        return reviewExists.exists(); //returns true
      }
      catch(error){
        console.error("Error fetching reviews!")
        return false;
      }
    };
    
    {/*Update a destination's average rating after a review!!
      Parameters:
      destinationTitle: the destination's name sent in the navigation from ExplorePage.jsx. eg: rome, paris .. 
      rating: how many stars the user entered for said destination. */}
    function  updateAverageRating(destinationTitle, rating){
      const db = getDatabase();
      const reviewsRef = ref(db, `destinations/${destinationTitle}/reviews`);
      onValue(reviewsRef, (snapshot) =>{
        const data = snapshot.val();
        if(data){
          {/*Loop through all ratings. 
            Add all ratings together, divide with amount of total ratings to get an average.
            Update the databse with the new average rating. */}
          const reviewsArray = Object.values(data);
          let totalSumRatings = 0; 
          reviewsArray.forEach(review => {
            totalSumRatings += parseInt(review.reviewRating, 10); //the 10 converts to int. Faced problems otherwise.
          });
          const newAverage = (totalSumRatings + parseInt(rating, 10)) / (reviewsArray.length + 1);
          const dbRef = ref(db, `destinations/${destinationTitle}`);
          update(dbRef, {averageRating: parseInt(newAverage)});
        } 
        else{
          //No previous reviews! We just add this one rating 
          const dbRef = ref(db, `destinations/${destinationTitle}`);
          update(dbRef, { averageRating: parseInt(rating, 10) }); //just update with current rating
        }
      });
    }


    {/*Upon press of Add Review. If user has not reviewed before. Add review.
      Followed youtube video to fully understand how one could implement stars.
      Youtube vid: https://www.youtube.com/watch?v=rw3eZ6XodN8&t=331s.
      Returns: null. 
      Rating: Select all input items with the name=rating. That is our stars. If checked, return the value=1-5.
       */}
    const handleAddReview = async (e) =>{
      e.preventDefault();
      const db = getDatabase();
      const userId = auth.currentUser.uid; 
      const email = auth.currentUser.email;
     
      const rating = document.querySelector('input[name="rating"]:checked')?.value; 
      const reviewText = document.getElementById('review-textarea').value;
      
      //Now we validate all input 
      if(!rating){
        alert("Please rate your stay");
        return
      }
      if(!reviewText){
        alert("Please write something to post :)")
        return
      }
      //all input ok
      const reviewed = await hasReviewed(userId);
      if(!reviewed){
        //User has not reviewed this place before.
        if (reviewText.trim() !== '') {
        addReviewToDatabase(destinationTitle.toLowerCase(), userId, email, reviewText.trim(), rating); 
        console.log(email, " ",reviewText.trim())
          }
        else{
          alert("Write something to post!")
        }
      }
      else{
        alert("You have already reviewed this destination! I hope you liked your stay");
      }
  
    };
    
    {/*Add post to the database */} //FUNKAR
      function addReviewToDatabase(destinationTitle, userId, email, text, rating){
        const db = getDatabase();
        const dbRef = ref(db, `destinations/${destinationTitle}/reviews/${userId}`)
        {/*
        Each review is saved in the realtime database with the following structure:
        rootOfDatabase{
          destinations{
            destination{
              name: Name
              description: Decription
              reviews{
                user1ID{
                  reviewText: text
                  rating: 1-5. 
                  email: email
                  timestamp: current time. 
                  }
                user2ID{
                  ...
                  }
                }
              }
            }
          } 

        */}
        
        update(dbRef,{
          reviewText: text,
          reviewRating: rating,
          userEmail: email,
          timestamp:Date.now()
        });

        updateAverageRating(destinationTitle, rating)
      };

      {/*searchQuery: what the user entered into the search bar. 
        Splits the searchQuery into a firstname and a lastname, checks database if this user exists. 
        Returns: all user information if user exists. */}
      const userExists = async () =>{
        const db = getDatabase();
        const [userFirstName, userLastName] = searchQuery.toLowerCase().split(" ");
        if(!userFirstName || !userLastName){
          alert("Enter both first and surname to search for a user!");
          return null;
        }
        else{
          const formattedFirstName = userFirstName.toLowerCase();
          const formattedLastName = userLastName.toLowerCase();
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
        return null;
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
            //destination exists.
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
              //no user, no destinaition 
              alert("Destination or user not found");
            }
          }
        } catch (error) {
          console.error("Error fetching destination:", error);
        }
      };


    /*FETCH ALL REVIEWS*/
    useEffect(() => {
      const db = getDatabase();
      const reviewRef = ref(db, 'destinations/' + destinationTitle?.toLowerCase()+'/reviews')
      
      //Same logic as in OwnProfilePage.js
      onValue(reviewRef, (snapshot) =>{
        const data = snapshot.val();
        if(data){
          console.log("all of the data: ", data);
          const reviewsArray = Object.entries(data).map(([key, review]) => {
            console.log("Fetched review timestamp:", review.timestamp);
            
            return{
              id:key,
              email:review.userEmail,
              text:review.reviewText,
              rating:review.reviewRating,
              time:review.timestamp
            };
              

          });
          console.log("Fetched reviews:", reviewsArray); // Log reviews here
          setReviews(reviewsArray)
        }
      })

    }, [destinationTitle]); //rerenders when a new search is made
    

      {/*FETCH DESCRIPTION AND AVERAGE RATING OF CURRENT DESTINATION*/}
      useEffect(() => {
        const db = getDatabase();
        const destinationRef = ref(db, 'destinations/' + destinationTitle?.toLowerCase());
        if(destinationTitle){
          onValue(destinationRef, (snapshot) => {
              const desDescription = snapshot.val();
              if (desDescription) {
                setDestinationDescription(desDescription.description)
                setRatingAverage(desDescription.averageRating);
              }
              else {
                  console.error("Error fetching description:");
                  }
              });
            }
    }, [destinationTitle]); //rerenders when a new search is made!




  {/*Fetch the destination image from Unsplash API. We have 50 free per hour.
    Apparently, each destination has ilke... 100 urls. We only tkae the one on index 0.*/}
  useEffect(() => {
    const fetchImage = async () => {
      if(destinationTitle){
        try {
          const response = await axios.get(
            `https://api.unsplash.com/search/photos?query=${destinationTitle}&client_id=${UNSPLASH_API_KEY}`
          );
          if (response.data.results.length > 0) {//if there is a response in the API
            setImageUrl(response.data.results[0].urls.small); //set the url of the image
          }
        } catch (error) {
          console.error("Error fetching image from Unsplash:", error);
        }
      };
    }
    fetchImage();
  }, [destinationTitle, UNSPLASH_API_KEY]);

/*Just to ensure the image is rendered before we try to show it hehe*/
  let renderedImage;
  if(imageUrl){
    renderedImage = <img src={imageUrl} alt={destinationTitle} />;
  }
  else{
    renderedImage = <p>Trouble loading image... trying my best...</p>
  }

    return (
        <div className='destination_page_container'>
            <div id="gridHeader">
               
                <div id="header-links">
                  <ul className="explore-links">
                    <li><Link className="back-link" to="explore" onClick={(e) => {e.preventDefault();navigate("/explore")}}>Back</Link></li>
                    <li><Link className="explore-link" to="explore" onClick={(e) => {e.preventDefault();navigate("/explore");}}>Explore</Link></li>
                    <li><Link className="profile-link" to="profilepage" onClick={(e) => {e.preventDefault();navigate("/profilepage"); }}>Profile</Link></li>
              
                  </ul>
                </div>

                <div id="logo-container">
                    <img src={roam_logo} id="roam-logo" alt="Roam Logo" />
                </div>
            </div>

            <div id="gridSearchBar">
                <h1 className="explore-page-title">Explore</h1>
                <div className="search-bar">
                    <input type="text" placeholder="Find friends, destinations, hotels?"  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    <button id="write-button" type="submit" onClick={handleSearchQuery}>Search</button>
                </div>


            </div>

            <div id="gridTitleAndPicture">
                <h1 id="destination-title">{displayedTitle}</h1>
                {renderedImage}
                

            </div>
            <div id="gridDescription">
              <p>{destinationDescription || "Loading description..."}</p>
              <h2>Average rating: {ratingAverage}/5</h2>
             
              <h1 id="add-review-title">Add a review</h1>
              {/*How stars works, information from: https://www.youtube.com/watch?v=rw3eZ6XodN8&t=331s.
              Has to be ordered 5 first and 1 last. Otherwise it does not go from left to right. 
              When adding a review, it checks all of these with name="rating". Then checks the pressed value.
              Star-shape implemented from fas fa-star. */}
              <div class="star-rating-system">
                <input type="radio" name="rating" id="rating-5" value="5"></input>
                <label for="rating-5" class='fas fa-star'></label>
                <input type="radio" name="rating" id="rating-4" value="4"></input>
                <label for="rating-4" class="fas fa-star"></label>
                <input type="radio" name="rating" id="rating-3" value="3"></input>
                <label for="rating-3" class="fas fa-star"></label>
                <input type="radio" name="rating" id="rating-2" value="2"></input>
                <label for="rating-2" class="fas fa-star"></label>
                <input type="radio" name="rating" id="rating-1" value="1"></input>
                <label for="rating-1" class="fas fa-star"></label>
            
                <div class="textarea" placeholder="Any review to share?"  maxLength={200}>
                  <textarea id="review-textarea"></textarea>
                </div>
                <div class="button">
                  <button id="post-review-button" onClick={handleAddReview}>Add Review</button>
                </div>
              </div>
            </div>

            <div id="gridReviews">
              <div id="reviews-wall">
                <h1>Reviews</h1>
                {reviews.length > 0 ? (reviews.map((review) => {
                   const timeInMs = parseInt(review.time, 10); //convert to int.
                   const correctTime = new Date(timeInMs).toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'});
                   //We had to reshape the time, as it wasn't formatted properly otherwise. Just numbers.
                return (<Review
                    key={review.id}
                    email={review.email}
                    text={review.text}
                    rating={review.rating}
                    time={correctTime}
                />
                )})
                 ) : (
                <p>No reviews yet</p>
              )}
              </div>

             
            </div>
        </div>


    );
};


export default DestinationPage;
