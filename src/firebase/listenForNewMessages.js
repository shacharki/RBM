import { auth, db } from './firebase'

/**
 * 
 * @param { (firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => void } onNewMessage 
 */
function listenForNewMessages(onNewMessage) {
    const unsub = db.collection("messages")
        .where('addresee', '==', auth.currentUser.uid)
        .onSnapshot(onNewMessage, (err) => undefined)

    return unsub;
}

export default listenForNewMessages;