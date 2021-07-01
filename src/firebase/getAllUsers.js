import firebase from "firebase";


async function getUsersLists() {
    var coll = await firebase.firestore().collection('researcher').get()
    return coll.docs.map(querySnapshot => querySnapshot.data())
}


export default getUsersLists;