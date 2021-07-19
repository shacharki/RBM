import * as logoUpImg from './../../../../../img/logoUp.JPG'
import * as logoFooterImg from './../../../../../img/logoDown.JPG'
import './purchaseRequest.css'
import { useEffect, useRef } from 'react'

function DisplayPurchaseRequests({ form, index, requests }) {
    var date = form.date.toDate()
    var day = date.getDate()
    var month = date.getMonth() + 1
    var year = date.getFullYear()

    if (day < 10)
        day = '0' + day
    if (month < 10)
        month = '0' + month


    return (
        <div style={{ textAlign: 'right' }}>
            <div className="report-logo">
                <img style={{ position: 'relative' }} src={logoUpImg.default} />
            </div>

            <h4> שם החוקר: {form.nameResearcher}</h4>
            <h4> תאריך הבקשה: {day + '/' + month + "/" + year}</h4>
            <h4><label id="Q1L" className="title-input"> שם הספק: {requests.q1 ? (requests.q1) : ('')}</label></h4>
            <div id="name-group">
                <h4>  <label id="Q2L" className="title-input"> נייד: {requests.q2 ? (requests.q2) : ('')}</label>
                </h4>
            </div>
            <div id="name-group" >
                <h4><label id="Q3L" className="title-input"> טופס הזמנה מס': {requests.q3 ? (requests.q3) : ('')}</label></h4>
            </div>
            <div id="name-group" >
                <h4> <label id="Q4L" className="title-input">מצורפת הצעת מחיר מס': {requests.q4 ? (requests.q4) : ('')}</label></h4>
            </div>
            <h4>פירוט ההצעה:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '25px' }}>
                <table border="1" >
                    <tbody>
                        <tr>
                            <th>מק"ט</th>
                            <th>תיאור הפריט</th>
                            <th>מחיר במט"ח</th>
                            <th>מחיר יח' בש"ח</th>
                            <th>מס' יחידות</th>
                            <th>מחיר בש"ח</th>

                        </tr>
                        <tr>
                            <td><div id="name-group" >
                                <h4> <label id="Q5L" className="title-input" htmlFor="name">{requests.q5 ? (requests.q5) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q6L" className="title-input" htmlFor="name">{requests.q6 ? (requests.q6) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q7L" className="title-input" htmlFor="name">{requests.q7 ? (requests.q7) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q8L" className="title-input" htmlFor="name"> {requests.q8 ? (requests.q8) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="insert-name" className="title-input" htmlFor="name"> {requests.q9 ? (requests.q9) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="insert-name" className="title-input" htmlFor="name"> {requests.q10 ? (requests.q10) : ('')}</label></h4>
                            </div></td>

                        </tr>

                        <tr>
                            <td><div id="name-group" >
                                <h4> <label id="Q50L" className="title-input" htmlFor="name">{requests.q50 ? (requests.q50) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q60L" className="title-input" htmlFor="name">{requests.q60 ? (requests.q60) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q70L" className="title-input" htmlFor="name">{requests.q70 ? (requests.q70) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q80L" className="title-input" htmlFor="name"> {requests.q80 ? (requests.q80) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q90L" className="title-input" htmlFor="name"> {requests.q90 ? (requests.q90) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q100L" className="title-input" htmlFor="name"> {requests.q100 ? (requests.q100) : ('')}</label></h4>
                            </div></td>

                        </tr>

                        <tr>
                            <td><div id="name-group" >
                                <h4> <label id="Q51L" className="title-input" htmlFor="name">{requests.q51 ? (requests.q51) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q61L" className="title-input" htmlFor="name">{requests.q61 ? (requests.q61) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q71L" className="title-input" htmlFor="name">{requests.q71 ? (requests.q71) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q81L" className="title-input" htmlFor="name"> {requests.q81 ? (requests.q81) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q91L" className="title-input" htmlFor="name"> {requests.q91 ? (requests.q91) : ('')}</label></h4>
                            </div></td>

                            <td><div id="name-group" >
                                <h4> <label id="Q101L" className="title-input" htmlFor="name"> {requests.q101 ? (requests.q101) : ('')}</label></h4>
                            </div></td>

                        </tr>

                    </tbody>
                </table>
            </div>
            <div id="name-group" >
                <h4> <label id="Q11L" className="title-input" htmlFor="name">סה"כ כולל מע"מ: {requests.q11 ? (requests.q11) : ('')}</label></h4>
            </div>
            <div id="name-group" >
                <h4> <label id="Q12L" className="title-input" htmlFor="name">נא לתאם קבלת משלוח עם: {requests.q12 ? (requests.q12) : ('')}</label></h4>
            </div>
            <div id="name-group" >
                <h4> <label id="Q13L" className="title-input" htmlFor="name">מטרת הרכישה:</label></h4>{requests.q13 ? (requests.q13) : ('')}
            </div>
            <div id="name-group" >
                <h4> <label id="Q14L" className="title-input" htmlFor="name">תקציב המחקר: {requests.q14 ? (requests.q14) : ('')}</label></h4>
            </div>
            <div id="name-group" >
                <h4> <label id="Q15L" className="title-input" htmlFor="name">מס' המחקר: {requests.q15 ? (requests.q15) : ('')}</label></h4>
            </div>
            <div id="name-group" >
                <h4> <label id="Q16L" className="title-input" htmlFor="name">חתימת החוקר: </label> </h4>
                <img style={{ position: 'relative', backgroundColor: 'white' }} src={requests.signature ? requests.signature : ''} />
            </div>

            <div id="name-group" >
                <h4> <label id="Q17L" className="title-input" htmlFor="name">תאריך החשבונית: {requests.q17 ? (requests.q17) : ('')}</label></h4>
            </div>
            <div id="name-group" >
                <h4> <label id="Q18L" className="title-input" htmlFor="name">מס' חשבונית: {requests.q18 ? (requests.q18) : ('')}</label></h4>
            </div>

            <div className="report-logo">
                <img style={{ position: 'relative' }} src={logoFooterImg.default} />
            </div>
        </div>
    );
}

export default DisplayPurchaseRequests;