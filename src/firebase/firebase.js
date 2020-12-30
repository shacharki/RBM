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

// var serviceAccount = require("./adminYbl");
//
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://ybl-project-b5e04.firebaseio.com"
// });
export const auth = firebase.auth();
export const db = firebase.firestore();
// export  const admin = admin.auth();
export default firebase;


//
// console.log(admin);
//
//
// admin.auth().createUser({
//     email: 'user@example.com',
//     emailVerified: false,
//     phoneNumber: '+11234567890',
//     password: 'secretPassword',
//     displayName: 'John Doe',
//     photoURL: 'http://www.example.com/12345678/photo.png',
//     disabled: false
// })
//     .then(function(userRecord) {
//         // See the UserRecord reference doc for the contents of userRecord.
//         console.log('Successfully created new user:', userRecord.uid);
//     })
//     .catch(function(error) {
//         console.log('Error creating new user:', error);
//     });

// db.collection("Teams").doc().get().then(res=>{
//     // console.log(res)
// }).catch(e=>{
//     console.log(e)
// })

export async function CreateNewUser(email,phone) {
    console.log("email"+email)

    var res = auth.createUserWithEmailAndPassword(email,phone)
    console.log("res"+res)

    return res;
}

export async function RegisterUser(uid,user) {


    uid.updateProfile({displayName:user.fname+" "+ user.lname})
    db.collection("waitforapproval").doc(uid.uid).set(user);
    console.log("uid"+uid)
    console.log("user"+user)
    return;
}
export async function DeleteUser(uid) {
    await db.collection("waitforapproval").doc(uid).delete();
    return;
}

export async function CreateUser(user) {


    // console.log(user)
    // var res = await auth.createUserWithEmailAndPassword(user.email,user.phone)
    // res.user.updateProfile({displayName:user.fname+" "+ user.lname})

    if(user.type==="testers") {
        // await db.collection("students").doc(user.uid).set(user)
        await db.collection("researcher").doc(user.uid).set(user)
        await db.collection("managers").doc(user.uid).set(user)
    }
    await  db.collection(user.type).doc(user.uid).set(user)
    // var team=await db.collection('Teams').doc(user.team.id);
    // team.set({
    //     name: user.teamName,
    //     guide: db.doc('guides/'+user.uid)
    // })

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

export async function getGuide(uid) {
    var guide = await db.collection("guides").doc(uid);
    // console.log(guide);
    return guide;
}

export async function getGuideData(uid) {
    var guideData = await (await db.collection("guides").doc(uid).get()).data();
    // console.log(guideData);
    return guideData;
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


export async function getUser(user)
{
    console.log("userjs"+user)

    // var testers = await db.collection('testers').doc(user.uid).get()
    var researcher = await db.collection('researcher').doc(user.uid).get()
    var managers = await db.collection('managers').doc(user.uid).get()
    var wait = await db.collection('waitforapproval').doc(user.uid).get()

    console.log(user.data())
    console.log("mangers"+managers.data())
    // console.log(user)
    // console.log(testers.data())
    // if(wait.exists)
    //     return 'wait'
    // else if(testers.exists)
    //     return 'Tester'
    if(managers.exists)
        return 'Managers'
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
export async function getTeamFeedbackByDate(teamPath,date) {
    var team = await db.collection("Teams").doc(teamPath).collection("Dates").doc(date).get();
    var teamFeedback=team.data()
    // console.log(teamFeedback);
    return teamFeedback;
}








