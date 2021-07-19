import sendGmail from "./sendGmail";
import templates from "./templates";


/**
 * Send the genenral notification template to the user.
 * @param {Object} params The template parameters. 
 * @param { string } params.subject The subject of the email.
 * @param { string } params.toMail The email to send the mail to.
 * @param { string } params.fullName The full name.
 * @param { string } params.message The message text.
*/
function sendGeneralNotificationMail({subject, toMail, fullName, message}) {
    return sendGmail(templates.generalNotification, toMail, { subject: subject, full_name: fullName, message: message })
}

export default sendGeneralNotificationMail;