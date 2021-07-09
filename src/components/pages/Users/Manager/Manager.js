import React from "react";
import { auth, getUser, signOut, db } from '../../../../firebase/firebase'
import listenForNewMessages from '../../../../firebase/listenForNewMessages'
import { Badge } from '@material-ui/core'

import { NextPage } from "../UserPage";
import ClipLoader from "react-spinners/ClipLoader";
import './Manager.css'
import { NotificationManager } from "react-notifications";

class Manager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPage: false,
            spinner: [true, 'נא להמתין הדף נטען'],
            isLoad: false,
            user: props.location,
            error: false,
            loading: true,
            rule: "Manager",
            waitingNewMessages: 0,
            lastRecivedMessageDate: new Date()
        };
    }


    loadPage(event) {
        this.setState({ loading: event })
    }

    async componentDidMount() {
        var href = window.location.href.split("/", 5)
        auth.onAuthStateChanged(async user => {
            if (user) {

                var type = await getUser(user)
                if (type === "wait") {
                    NotificationManager.error('המנהל עדיין לא אישר את הבקשה')
                    window.location.href = '/Login';
                    return
                }


                if (href[4] === user.uid && (href[3] === type || type === 'Tester')) {
                    await this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })
                    this.render()
                    this.setState({ loadPage: true })
                    this.loadSpinner(false, "")

                    this.unsubNewMessages = db.collection("messages")
                        .where('addresee', '==', auth.currentUser.uid) 
                        .where('createdAt', '>', this.state.lastRecivedMessageDate) 
                        .onSnapshot(snap => {
                            // Filter the first call.
                            if (snap.docs.length <= 0) {
                                return;
                            }

                            const msg = snap.docs[0].data()
                            const shortenedText = msg.text.substr(0, 15) + '...'

                            NotificationManager.success(`הודעה חדשה התקבלה ממשתמש ${msg.displayName}`,
                                shortenedText,
                                5000,
                                () => { // Move to the chat page if the user clicks on the message.
                                    NextPage({...this.props, selectedUserUid: msg.uid}, "ChatM", this.state.user)
                                })
                        })

                    return
                }
                else {
                    this.notfound()
                    return
                }

            }
            else {
                this.setState({
                    isLoad: true,
                })
                window.location.href = '/Login';
                return;
            }
        })
    }

    componentWillUnmount() {
        if (this.unsubNewMessages) {
            this.unsubNewMessages()
        }
    }

    loadSpinner(event, massage = "") {
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({ spinner: spinner })
    }


    async logout() {
        await auth.signOut();
        window.location.href = '/';
    }


    render() {
        if (this.state.loadPage) {
            return (
                <div id="instructor" className="sec-design" dir='rtl'>
                    {!this.state.spinner[0] ? "" :
                        <div id='fr'>
                            {this.state.spinner[1]}
                            <div className="sweet-loading">
                                <ClipLoader style={{
                                    backgroundColor: "rgba(255,255,255,0.85)",
                                    borderRadius: "25px"
                                }}
                                    size={120}
                                    color={"#123abc"}
                                />
                            </div>
                        </div>
                    }
                    <h2>  שלום למנהל {this.state.user.displayName}</h2>
                    <button id="UserApproval" className="btn btn-info" onClick={() => {
                        this.ChangePage("UserApproval")
                        return
                    }}>אישור משתמשים<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="mngRequestPurchase" className="btn btn-info" onClick={() => {
                        this.ChangePage("mngRequestPurchase")
                        return
                    }}>אישור דוחות ובקשות<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="BudgetSpreadshee" className="btn btn-info" onClick={() => {
                        this.ChangePage("Budget")
                        return
                    }}>תקציבי מחקר<span
                        className="fa fa-arrow-right"></span></button>
                    <button id="financialReports" className="btn btn-info" onClick={() => {
                        this.ChangePage("financialReports")
                        return
                    }}>דוחות כספיים<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="ChatResearcher" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "ChatM", this.state.user)
                    }}>
                        צ'אט לחוקר<span className="fa fa-arrow-right"></span>
                    </button>

                    <button id="ChatResearcher" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "ScientificReport", this.state.user)
                    }}>
                        דוחות מדעיים
                    </button>

                    <button id="ExpenseReporting1" className="btn btn-info" onClick={() => {
                        this.ChangePage("UpdatesFirebase")
                    }}>פעולות ועדכון<span
                        className="fa fa-arrow-right"></span></button>
                        
                    <button id="UpdateDetails" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "Profile", this.state.user)
                    }}>עדכון פרטים או סיסמא<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="logout" className="btn btn-info" onClick={() => {
                        signOut()
                    }}>התנתק
                    </button>
                </div>
            );
        } else {
            return (
                <div>
                    {!this.state.spinner[0] ? "" :
                        <div id='fr'>
                            {"טוען נתוני דף"}
                            <div className="sweet-loading">
                                <ClipLoader style={{
                                    backgroundColor: "rgba(255,255,255,0.85)",
                                    borderRadius: "25px"
                                }}
                                    size={120}
                                    color={"#123abc"}

                                />
                            </div>
                        </div>
                    }
                </div>)
        }
    }

    loadTempPage(path) {
        this.props.history.push({
            pathname: `/${path}`,
            data: this.state.user
        })
    }

    ChangePage(path) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/${path}`,
            data: this.state.user
        })
    }

    loadUser(page) {
        this.props.history.push({
            pathname: `/${page}/${this.state.user.id}`,
            data: this.state.user // your data array of objects
        })
    }

    notfound() {
        this.props.history.push({
            pathname: `/404`,
            data: this.state.user // your data array of objects
        })
    }

    getNewMessagesString() {
        return this.state.waitingNewMessages === 1 ? 'הודעה חדשה אחת' : `${this.state.waitingNewMessages} הודעות חדשות`
    }
}


export default Manager;