import firebase from 'firebase/app'
import 'firebase/auth'


const firebaseConfig = {
    apiKey: "AIzaSyAE7I2YNI5d5VtnQt_aGEpLuYGtkapu8Oo",
    authDomain: "rbms-b759b.firebaseapp.com",
    projectId: "rbms-b759b",
    storageBucket: "rbms-b759b.appspot.com",
    messagingSenderId: "563173400914",
    appId: "1:563173400914:web:ec4f7c98e7cdda959b5a8b"
};
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export default firebase;