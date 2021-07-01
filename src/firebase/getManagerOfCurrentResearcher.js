import { auth, db } from "./firebase";
import { getResearcherData } from './firebase'
import firebase from 'firebase/app'

/**
 * Get the manager of the current user from firestore. return undefined if no manager was found (because the current user is a manager).
 * @param { firebase.user } user The researcher user object.
 */
async function getManagerOfCurrentResearcher(user) {
    const data = await getResearcherData(user.uid)
    const team = (await data.team.get()).data()

    const queryResponse = await db.collection('managers').where('teamName', '==', team.name).get();
    const manager = queryResponse.docs[0].data()

    return manager
}

export default getManagerOfCurrentResearcher;