import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firebase-firestore'
// import * as admin from 'firebase-admin';


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



export async function CreateNewUser(email,phone) {

    var res = auth.createUserWithEmailAndPassword(email,phone)
    return res;
}

export async function RegisterUser(uid,user) {

    uid.updateProfile({displayName:user.fname+" "+ user.lname})
    await db.collection("waitforapproval").doc(uid.uid).set(user);
    return;
}
export async function DeleteUser(uid) {
    await db.collection("waitforapproval").doc(uid).delete();
    return;
}

export async function CreateUser(user) {

    if(user.type==="testers") {
        await db.collection("researcher").doc(user.uid).set(user)
        await db.collection("manager").doc(user.uid).set(user)
    }
    await  db.collection(user.type).doc(user.uid).set(user)

    await db.collection("waitforapproval").doc(user.email).delete();
    await DeleteUser(user.uid)
    console.log("done the user is ready")
    return true;
}


export async function checkUser() {
    const user =await auth.onAuthStateChanged();
    return user
}

export async function signOut() {
    await auth.signOut();
    return
}

export async function getResearcher(uid) {
    var researcher = await db.collection("researcher").doc(uid);
    return researcher;
}

export async function getResearcherData(uid) {
    var researcherData = await (await db.collection("researcher").doc(uid).get()).data();
    return researcherData;
}

export async function getResearcherFormByDate(uid, date) {
    var ResearcherData = await (await db.collection("researcher").doc(uid).collection("comes").doc(date).get()).data();
    return ResearcherData;
}

export async function getPathData(path) {
    var researcherData =await (await db.doc(path).get()).data();
    return researcherData;
}

export async function getResearcherForms(uid) {
    var forms = [];
    var researcherData = await db.collection("researcher").doc(uid).collection("comes").get();
    researcherData.docs.forEach(doc=>{
        forms.push(doc.data());
    })
    return forms;
}

export async function getUser(user) {
    var researcher = await db.collection('researcher').doc(user.uid).get()
    var manager = await db.collection('managers').doc(user.uid).get()
    var wait = await db.collection('waitforapproval').doc(user.uid).get()

    if (wait.exists)
        return 'wait'
    else if (manager.exists)
    {
        // console.log("manager.data()",manager.data())
        return 'Manager'
    }
    else if(researcher.exists)
        return 'Researcher'
    else
        return null
}


export async function getManager(uid) {
    var manager = await db.collection("managers").doc(uid);
    return manager;
}

export async function getManagerData(uid) {
    var managerData = await (await db.collection("managers").doc(uid).get()).data();
    return managerData;
}









