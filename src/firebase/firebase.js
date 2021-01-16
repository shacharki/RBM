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
    console.log("email"+email)

    var res = auth.createUserWithEmailAndPassword(email,phone)
    console.log("res"+res)

    return res;
}

export async function RegisterUser(uid,user) {


    uid.updateProfile({displayName:user.fname+" "+ user.lname})
    await db.collection("waitforapproval").doc(uid.uid).set(user);
    console.log("uid"+uid)
    console.log("user"+user)
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

export async function CreateNewTeam(team) {
    await  db.collection("Teams").doc().set({name:team}).then(()=>{
            alert("הקבוצה נוספה בהצלחה")
            return true;
        }
    ).catch((e)=>{
        alert("משהו השתבש הקבוצה לא נוספה ")
        return false;
    })

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
    // console.log(guide);
    return researcher;
}

export async function getResearcherData(uid) {
    var researcherData = await (await db.collection("researcher").doc(uid).get()).data();
    // console.log(guideData);
    return researcherData;
}

export async function getGuideFormByDate(uid, date) {
    var guideData = await (await db.collection("guides").doc(uid).collection("comes").doc(date).get()).data();
    // console.log(guideData);
    return guideData;
}

export async function getPathData(path) {
    var guideData =await (await db.doc(path).get()).data();
    // console.log(guideData);
    return guideData;
}

export async function getGuideForms(uid) {
    var forms = [];
    var guideData = await db.collection("guides").doc(uid).collection("comes").get();
    // console.log(guideData.docs[0].data());
    guideData.docs.forEach(doc=>{
        forms.push(doc.data());
    })
    // console.log(forms);
    return forms;
}

export async function getStudent(uid) {
    var student = await db.collection("students").doc(uid);
    // console.log(student);
    return student;
}

export async function getStudentData(uid) {
    // console.log(uid)
    var studentData = await (await db.collection("students").doc(uid).get()).data();
    // console.log(studentData);
    return studentData;
}


export async function getStudentFormByDate(uid, date) {
    var studentFormByDate = await (await db.collection("students").doc(uid).collection("comes").doc(date).get()).data();
    // console.log(studentFormByDate);
    return studentFormByDate;
}

export async function getStudentForms(uid) {
    var forms = [];
    var studentData = await db.collection("students").doc(uid).collection("comes").get();
    // console.log(studentData.docs[0].data());
    studentData.docs.forEach(doc=>{
        forms.push(doc.data());
    })
    // console.log(forms);
    return forms;
}


export async function getUser(user) {
    // var testers = await db.collection('testers').doc(user.uid).get()
    var researcher = await db.collection('researcher').doc(user.uid).get()
    var manager = await db.collection('managers').doc(user.uid).get()
    var wait = await db.collection('waitforapproval').doc(user.uid).get()

    // console.log(testers.data())
    if (wait.exists)
        return 'wait'
        // else if(testers.exists)
    //     return 'Tester'
    else if (manager.exists)
    {
        console.log("manager.data()",manager.data())
        return 'Manager'
    }

    else if(researcher.exists)
        return 'Researcher'
    // else if(students.exists)
    //     return 'Student'
    else
        return null
}


export async function getManager(uid) {
    var manager = await db.collection("managers").doc(uid);
    // console.log(manager);
    return manager;
}

export async function getManagerData(uid) {
    var managerData = await (await db.collection("managers").doc(uid).get()).data();
    // console.log(managerData);
    return managerData;
}









