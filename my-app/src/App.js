import './App.css';
import React from 'react';
// import ProfilePage from './profile-page';
import {BrowserRouter, Routes,Route,} from "react-router-dom";
import { initializeApp } from "firebase/app";
import {useState} from 'react';
import StartPage from './StartPage'; // Import the startpage component
import SignUpPage from './SignUpPage'; // Import the signup page component
import start from './start.jpg';
import ExplorePage from './ExplorePage';
import OwnProfilePage from './OwnProfilePage';
import UserProfilePage from './UserProfilePage';
import roam_logo from "./roamMate_logo_no_bg.png"
import './start-page.css'; 
import DestinationPage from './DestinationPage';



function App() {
  
    const [showSignUp, setShowSignUp] = useState(false);
  
    return (
      <div>
            <BrowserRouter>
                <Routes>
                    <Route
                        exact
                        path="/"
                        element={<StartPage />}
                    />
                    <Route
                        exact
                        path="/explore"
                        element={<ExplorePage />}
                    />
                    <Route
                        exact
                        path="/signup"
                        element={<SignUpPage />}
                    />
                     <Route
                        exact
                        path="/profilepage"
                        element={<OwnProfilePage />}
                    />
                    <Route
                        exact
                        path="/destination/:name"
                        element={<DestinationPage />}
                    />
                    <Route
                        exact
                        path="/user/:fullName"
                        element={<UserProfilePage />}
                        
                    />
                </Routes>
            </BrowserRouter>
         {/*showSignUp && <SignUpPage />}
       { /*{showExplore && <ExplorePage />}*/}
      </div>
    );
  }
  
  export default App;

