import * as emailjs from 'emailjs-com'
import { NotificationManager } from 'react-notifications';
import servicesId from './emailServices'


/**
 * Send the template to an email.
 * @param { string } template The template to send.
 */
export default async function sendGmail(template, email) {
    var response = null;

    try {
        response = await emailjs.send(servicesId.gmail, template, { to: email })
    } catch (error) {
        return NotificationManager.error("אי אפשר היה לשלוח את המייל", error.message)
    }

    NotificationManager.success("המייל נשלח בהצלחה")
}