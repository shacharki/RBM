import * as emailjs from 'emailjs-com'
import { NotificationManager } from 'react-notifications';
import servicesId from './emailServices'


/**
 * Send the template to an email.
 * @param { string } template The template to send.
 */
export default async function sendGmail(template, email, templateParameters) {
    var response = null;
    const defaultParams = { to: email }
    templateParameters = typeof(templateParameters) == "object" ? templateParameters : {}

    const params = {...defaultParams, ... templateParameters}

    try {
        response = await emailjs.send(servicesId.gmail, template, params)
    } catch (error) {
        return NotificationManager.error("אי אפשר היה לשלוח את המייל", error.message)
    }

    NotificationManager.success(`מייל נשלח ל ${email} בהצלחה`)
}