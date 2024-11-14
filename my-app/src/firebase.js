import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// project ID: roammate-97961
// The web app's Firebase configuration
/*const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
*/
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  authDomain: "roammate-97961.firebaseapp.com",
  projectId: "roammate-97961",
  storageBucket: "roammate-97961.appspot.com",
  messagingSenderId: "900598357729",
  appId: "1:900598357729:web:8a29cfb468c4c1bdb621a0",
  databaseURL: "https://roammate-97961-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);



//TO DO: cloud firestore.
//Ska skapa en realtime firestore, så man kan ha en databas med 3 collections
// dvs. profilinfo, chatt, profile messages
// useMemo måste wrappa: " make sure to wrap the `collection()` 
//function or any other firebase function at the top of a component in a 
//useMemo if it doesn't need to be called every time a component re-renders. 
//The way the code is written here, `collection()` will be called for every change 
//to any of the text inputs and counts as a firestore read which contributes to billing."


export { firebaseApp, auth, database };