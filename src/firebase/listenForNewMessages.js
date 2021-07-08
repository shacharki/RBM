import { auth, db } from './firebase'

/**
 * Listen for new messages in the database and call the onNewMessage callback when a new message has recived.
 * @param { (firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => void } onNewMessage 
 */
function listenForNewMessages(onNewMessage, onError, onComplete) {
    const unsub = db.collection("messages")
        .where('addresee', '==', auth.currentUser.uid) // Only messages adreesed to this user.
        .where('createdAt', '>', this.state.lastRecivedMessageDate)
        .onSnapshot(onNewMessage, onError, onComplete)

    return unsub;
}

export default listenForNewMessages;