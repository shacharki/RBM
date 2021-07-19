import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import { useFirestoreQuery } from '../Researcher/hooks';
import './Researcher.css'
import Message from './Message';
import { auth, db } from '../../../../firebase/firebase';
import { NotificationManager } from "react-notifications";
import inferUserTypeFromUrl from '../../../../firebase/inferUserTypeFromUrl';


function useFirestoreField(fieldName) {
    const uid = auth.currentUser.uid;
    const [fieldData, setFieldData] = useState(undefined)

    var doc = inferUserTypeFromUrl() == 'Manager' ? db.collection('managers').doc(uid) : db.collection('researcher').doc(uid)

    auth.onAuthStateChanged(user => {
        if (user) {
            doc.get().then(data => {
                const document = data.data()
                setFieldData(document[fieldName])
            })
        }
    })

    const setter = (value) => {
        var obj = {}
        obj[fieldName] = value;
        doc.update(obj).then(_ => setFieldData(value))
    }

    return [fieldData, setter]
}

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
    const [lastRecivedMessageUid, setLastRecivedMessageUid] = useFirestoreField("lastRecivedMessage")

    useEffect(() => {
        return db.collection("messages")
            .where('addresee', '==', auth.currentUser.uid)
            .where('createdAt', '>', lastRecivedMessageDate)
            .onSnapshot(async snap => {
                // Filter the first call.
                if (snap.docs.length <= 0) {
                    return;
                }

                const msg = snap.docs[0].data()
                const shortenedText = msg.text.substr(0, 15) + '...'

                NotificationManager.success(`הודעה חדשה התקבלה ממשתמש ${msg.displayName}`,
                    shortenedText,
                    5000)

                setLastRecivedMessageUid(snap.docs[snap.docs.length - 1].id)
            })
    }, [])

    return (
        <div className="flex flex-col h-full w-full">

            <div ref={bottomListRef} className="messages-list-container" style={{ width: '1000px' }}>
                {
                    (() => {
                        const elements =
                            messages?.filter(msg => sentBySelectedUser(msg) || sentBySelf(msg))
                                ?.sort((first, second) =>
                                    first?.createdAt?.seconds <= second?.createdAt?.seconds ? -1 : 1
                                )
                                ?.map(message => (
                                    <div key={message.id} style={{ alignSelf: sentBySelf(message) ? 'flex-end' : 'flex-start' }}>
                                        <h4><Message {...message} sentBySelf={sentBySelf(message)} /></h4>
                                    </div>
                                ))
                        const lastReadMessageIndex = messages.indexOf(lastRecivedMessageUid)
                        
                        if(lastReadMessageIndex !== -1 && lastReadMessageIndex) {
                            elements.splice(lastReadMessageIndex, 0, <h1>לא נקרא</h1>)
                        }
                                    
                        return elements
                    })()
                }
            </div>
            <div className="mb-6 mx-4">
                <form
                    onSubmit={handleOnSubmit}
                    className="flex flex-row bg-gray-200 dark:bg-coolDark-400 rounded-md px-4 py-3 z-10 max-w-screen-lg mx-auto dark:text-white shadow-md">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleOnChange}
                        placeholder=" הקלד כאן את תשובתך"
                        className="flex-1 bg-transparent outline-none" />
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