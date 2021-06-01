// import {ChatEngine} from "react-chat-engine";
// import './Researcher.css'
// import firebase from "firebase";
// import 'firebase/auth';
// import 'firebase/firestore';
//
//
// import React, { useEffect, useRef, useState } from 'react';
//
// import 'firebase/firestore';
// import 'firebase/auth';
//
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { useCollectionData } from 'react-firebase-hooks/firestore';
//
// firebase.initializeApp({}
//
// )
// const auth = firebase.auth();
// const firestore = firebase.firestore();
//
// function ChatR() {
//     const [user] = useAuthState(auth);
//
//     return (
//         <div>
//             <SignOut />
//             <section>
//                 {/* Shows chatroom if user is logged in
//         else show signin page */}
//                 {user ? <ChatRoom /> : <SignIn />}
//             </section>
//         </div>
//     );
// }
//
// function SignIn() {
//     const signInWithGoogle = () => {
//         const provider = new firebase.auth.GoogleAuthProvider();
//         auth.signInWithPopup(provider);
//     }
//     return (
//         <div>
//             <button onClick={signInWithGoogle}>Sign In With Google</button>
//         </div>
//     )
// }
//
// function SignOut() {
//     return auth.currentUser && (
//         <div>
//             <button onClick={() => auth.signOut()}>Sign Out</button>
//         </div>
//     )
// }
//
// function ChatRoom() {
//     // we will use this to scroll to bottom of chat on page-reload and after sending a message
//     const dummy = useRef();
//     const scrollToBottom = () => {
//         dummy.current.scrollIntoView({ behavior: 'smooth' });
//     }
//
//     // getting the message and sorting them by time of creation
//     const messagesRef = firestore.collection('messages');
//     const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25);
//
//     const [messages] = useCollectionData(query, {idField: 'id'});
//
//     return (
//         <div>
//             <div>
//                 {/* we will loop over the message and return a
//         ChatMessage component for each message */}
//                 {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
//                 <span ref={dummy}></span>
//             </div>
//
//             {/* Form to type and submit messages */}
//             <form onSubmit={sendMessage}>
//                 <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something" />
//                 <button type="submit" disabled={!formValue}>send</button>
//             </form>
//         </div>
//     )
// }
//
// const sendMessage = async (e) => {
//     e.preventDefault();
//     // gets name, userID and pfp of logged in user
//     const { displayName, uid, photoURL } = auth.currentUser;
//
//     await messagesRef.add({
//         user: displayName,
//         body: formValue,
//         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//         uid: uid,
//         photoURL: photoURL
//     })
//
//     // resetting form value and scrolling to bottom
//     setFormValue('');
//     dummy.current.scrollIntoView({ behavior: 'smooth' });
// }
//
//
// function ChatMessage(props) {
//     const { user, body, uid, photoURL, createdAt } = props.message;
//
//     return (
//         <div>
//             <img src={photoURL || 'https://i.imgur.com/rFbS5ms.png'} alt="{user}'s pfp" />
//         </div>
//     <div>
//         <p>{user}</p>
//         <p>{body}</p>
//     </div>
// )
// }
//
// export default ChatR;