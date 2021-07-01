import { db } from "./firebase";
import { getResearcherData } from './firebase'

/**
 * Return all of the managers in the collection.
 * @returns { Array<Object> } All of the managers.
 */
async function getAllManagers() {
    const queryResponse = await db.collection('managers').get();
    const managers = queryResponse.docs.map(snap => snap.data())

    return managers
}

export default getAllManagers;