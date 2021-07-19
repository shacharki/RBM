import { db } from '../firebase/firebase';
import sendGmail from './sendGmail'
import templates from './templates';

function sendSingleBudgetUpdateMail(budgetName, toEmail) {
    return sendGmail(templates.budgetUpdatedMail, toEmail, { budgetName: budgetName })
}


/**
 * Send the budget updated mail to all of the researchers that can view the budget.
 * @param { string[] } canViewUids The uids of the researchers that can view the project.
 * @param { string } managerMail The mail of the manager.
 * @param { string } budgetName The name of the budget that will appear in the mail.
 */
async function sendBudgetUpdatedMails(canViewUids, managerMail, budgetName) {
    const query = await db.collection('researchers').where('uid', 'in', canViewUids).get()
    const emails = query.docs.map(doc => doc.data().email)
    emails.push(managerMail)
    emails.push('ishaisela@gmail.com')

    const list = `[${emails.map(mail => `"${mail}"`).join(',')}]`

    return sendSingleBudgetUpdateMail(budgetName, list)
}

export default sendBudgetUpdatedMails;