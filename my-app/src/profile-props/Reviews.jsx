import React from 'react';
import './Reviews.css'
import '../DestinationPage.jsx'


{/*Review component, very much alike the post component*/}
const Review = ({ email, text, rating, time }) => {
 

  return (
    <div className="visiblePost">
       <p>{email} at {time}</p> {/* Här visar vi e-posten för användaren */}
       <p id="reviewRating">Rating: {rating} stars</p>
       <p id="reviewText">{text}</p>
   
    </div>
  );
};

export default Review;