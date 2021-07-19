import { useEffect, useState } from "react";
import NotificationManager from "react-notifications/lib/NotificationManager";
import { auth, db } from "../../../firebase/firebase";


function NewMessagesCounter() {
    const [lastRecivedMessageDate, setLastRecivedMessageDate] = useState(new Date())
    const [unsubNewMessages, setUnsubNewMessages] = useState(() => undefined)

    useEffect(() => {
        auth.onAuthStateChanged(user => {
            if (user) {
                const unsub = db.collection("messages")
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
                    })

                setUnsubNewMessages(unsub)
            }
        })

        return unsubNewMessages;
    }, [])

    return <div style={{ position: 'absolute' }}>
        Test
    </div>
}

export default NewMessagesCounter;