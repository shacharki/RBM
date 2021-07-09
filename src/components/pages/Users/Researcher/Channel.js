import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import { useFirestoreQuery } from '../Researcher/hooks';
import './Researcher.css'
import Message from './Message';
import { auth } from '../../../../firebase/firebase';
import { NotificationManager } from "react-notifications";


const Channel = ({ user = null, selectedUserUid }) => {
    const db = firebase.firestore();
    const messagesRef = db.collection('messages');
    const messages = useFirestoreQuery(
        messagesRef.orderBy('createdAt', 'desc').limit(100)
    );

    const [newMessage, setNewMessage] = useState('');

    const inputRef = useRef();
    const bottomListRef = useRef();

    const { uid, displayName, photoURL } = user;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef]);

    const handleOnChange = e => {
        setNewMessage(e.target.value);
    };

    const handleOnSubmit = e => {
        e.preventDefault();

        const trimmedMessage = newMessage.trim();

        // Add new message in Firestore only if a user is selected.
        // Broadcast can be added if selectedUserUid is undefined.
        if (trimmedMessage && selectedUserUid !== undefined) {
            messagesRef.add({
                text: trimmedMessage,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                displayName,
                photoURL,
                addresee: selectedUserUid
            });

            // Clear input field
            setNewMessage('');
            // Scroll down to the bottom of the list
            bottomListRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const sentBySelf = (msg) => msg.uid == auth.currentUser.uid && msg?.addresee == selectedUserUid
    const sentBySelectedUser = (msg) => msg.uid == selectedUserUid && msg?.addresee == auth.currentUser.uid;

    const [lastRecivedMessageDate, setLastRecivedMessageDate] = useState(new Date())

    useEffect(() => {
        return db.collection("messages")
            .where('addresee', '==', auth.currentUser.uid)
            .where('createdAt', '>', lastRecivedMessageDate)
            .onSnapshot(snap => {
                // Filter the first call.
                if (snap.docs.length <= 0) {
                    return;
                }

                const msg = snap.docs[0].data()
                const shortenedText = msg.text.substr(0, 15) + '...'

                NotificationManager.success(`הודעה חדשה התקבלה ממשתמש ${msg.displayName}`,
                    shortenedText,
                    5000)
            })
    }, [])

    return (
        <div  className="flex flex-col h-full w-full">

            <div ref={bottomListRef} className="messages-list-container" style={{width: '1000px'}}>
                {messages
                    ?.filter(msg => sentBySelectedUser(msg) || sentBySelf(msg))
                    ?.sort((first, second) =>
                        first?.createdAt?.seconds <= second?.createdAt?.seconds ? -1 : 1
                    )
                    ?.map(message => (
                        <div key={message.id} style={{  alignSelf: sentBySelf(message) ? 'flex-end' : 'flex-start' }}>
                            <h4><Message {...message} sentBySelf={sentBySelf(message)} /></h4>
                        </div>
                    ))}
            </div>
            <div className="mb-6 mx-4">
                <form
                    onSubmit={handleOnSubmit}
                    >
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleOnChange}
                        placeholder=" הקלד כאן את תשובתך"
                         />
                    <button
                        type="submit"
                        disabled={!newMessage}
                        className="uppercase font-semibold text-sm tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        שלח
                    </button>
                </form>
            </div>
        </div>
    );
};

Channel.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string,
        displayName: PropTypes.string,
        photoURL: PropTypes.string,
    }),
};

export default Channel;