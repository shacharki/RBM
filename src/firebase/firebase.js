import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firebase-firestore'
// These imports load individual services into the firebase namespace.
import 'firebase/database';

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
export const db = firebase.firestore();

export default firebase;

export async function getUser(user)
{
    var testers = await db.collection('testers').doc(user.uid).get()
    var guides = await db.collection('guides').doc(user.uid).get()
    var students = await db.collection('students').doc(user.uid).get()
    var managers = await db.collection('managers').doc(user.uid).get()
    var wait = await db.collection('waitforapproval').doc(user.uid).get()

    // console.log(user)
    // console.log(testers.data())
    if(wait.exists)
        return 'wait'
    else if(testers.exists)
        return 'Tester'
    else if(managers.exists)
        return 'Manager'
    else if(guides.exists)
        return 'Guide'
    else if(students.exists)
        return 'Student'
    else
        return null
}
export async function CreateUser(user) {


    // console.log(user)
    // var res = await auth.createUserWithEmailAndPassword(user.email,user.phone)
    // res.user.updateProfile({displayName:user.fname+" "+ user.lname})

    if(user.type==="testers") {
        await db.collection("students").doc(user.uid).set(user)
        await db.collection("guides").doc(user.uid).set(user)
        await db.collection("managers").doc(user.uid).set(user)
    }
    await  db.collection(user.type).doc(user.uid).set(user)
    var team=await db.collection('Teams').doc(user.team.id);
    team.set({
        name: user.teamName,
        guide: db.doc('guides/'+user.uid)
    })

    await db.collection("waitforapproval").doc(user.email).delete();
    await DeleteUser(user.uid)
    console.log("done the user is ready")
    return true;
}
export async function DeleteUser(uid) {
    await db.collection("waitforapproval").doc(uid).delete();
    return;
}
export async function CreateNewUser(email,phone) {
    var res = await auth.createUserWithEmailAndPassword(email,phone)
    return res;
}

export async function checkUser() {
    const user =await auth.onAuthStateChanged();
    return user
}

