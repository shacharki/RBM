import { db } from "../firebase/firebase";
import sendGeneralNotificationMail from "./sendGeneralNotificationMail";

async function sendMailToManagerOfResearcher(researcherUid, getSubject, getMessage) {
    const researcher = await db.collection("researcher").doc(researcherUid).get()

    const managers = await db.collection("managers")
        .get();

    managers.docs.map(mng => {
        const data = mng.data()
        return {
            mail: data.email,
            fullName: `${data.fname} ${data.lname}`
        }
    }).forEach(({ mail, fullName }) => sendGeneralNotificationMail({
        toMail: mail,
        fullName: fullName,
        subject: getSubject(researcher),
        message: getMessage(researcher)
    }))
}

export default sendMailToManagerOfResearcher;