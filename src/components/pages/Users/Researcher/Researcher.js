import React from "react";
import { auth, db, GetFormDownload, getUser, signOut } from '../../../../firebase/firebase'
import { NextPage } from "../UserPage";
import ClipLoader from "react-spinners/ClipLoader";
import './Researcher.css'
import { NotificationManager } from "react-notifications";

class Researcher extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadPage: false,
            user: props.location,
            spinner: [true, 'נא להמתין הדף נטען'],
            lastRecivedMessageDate: new Date(),
            unreadMessages: 0
        };
    }

    loadSpinner(event, massage = "") {
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({ spinner: spinner })
    }

    async componentDidMount() {
        var href = window.location.href.split("/", 5)
        // console.log(href)
        auth.onAuthStateChanged(async user => {
            if (user) {

                var type = await getUser(user)
                if (type === "wait") {
                    alert('המנהל עדיין לא אישר את הבקשה')
                    window.location.href = '/Login';
                    return
                }
                if (href[4] === user.uid && (href[3] === type || type === 'Tester')) {
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })
                    this.loadSpinner(false, "")
                    this.setState({ loadPage: true })
                    this.render()

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
                                    NextPage({ ...this.props, selectedUserUid: msg.uid }, "ChatR", this.state.user)
                                })
                            this.setState({ unreadMessages: this.state.unreadMessages + 1 })
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


    loadTempPage(page) {
        this.props.history.push({
            pathname: `/${page}`,
            data: this.state.user // your data array of objects
        })
    }

    async logout() {
        //מסך טעינה
        await auth.signOut();
        window.location.href = '/';
        //סיום מסך טעינה
    }

    chooseLayout(page) {
        this.setState({
            page: page,
        })
        this.render()
    }

    render() {
        if (this.state.loadPage) {
            return (
                <div id="instructor" className="sec-design" dir="rtl">

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
                    <h2> שלום לחוקר {this.state.user.displayName}</h2>
                    <button id="RequestPurchase" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "RequestPurchase", this.state.user)
                    }}>בקשה לרכישה<span
                        className="fa fa-arrow-right"></span></button>
                    {/*<button id="BalanceMode" className="btn btn-info" onClick={() => {*/}
                    {/*}}>מצב הוצאות ויתרה<span className="fa fa-arrow-right"></span></button>*/}

                    <button id="RequestPurchase" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "Budget", this.state.user)
                    }}>מצב הוצאות ויתרה<span className="fa fa-arrow-right"></span></button>

                    <button id="repor-button" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "ScientificReport", this.state.user)
                    }}>דוחות מדעים<span
                        className="fa fa-arrow-right"></span>
                    </button>

                    <button id="ChatR" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "ChatR", this.state.user)
                    }}>
                        <p> {this.state.unreadMessages} הודעות חדשות</p>
                        <p>צ'אט למנהל</p>
                        <span className="fa fa-arrow-right"></span>
                    </button>

                    <button id="repor-button" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "Profile", this.state.user)
                    }}>עדכון פרטים או סיסמא<span
                        className="fa fa-arrow-right"></span></button>
                    <button id="logout" className="btn btn-info" onClick={() => {
                        signOut()
                    }}>התנתק
                    </button>
                </div>
            )
        }
        else
            return (<div> {!this.state.spinner[0] ? "" :
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
            }</div>)
    }

    loadUser(page) {
        this.props.history.push({
            pathname: `/${page}/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

    notfound() {
        this.props.history.push({
            pathname: `/404`,
            data: this.state.user // your data array of objects
        })
    }

    ChangePage(path) {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/${path}`,
            data: this.state.user
        })
    }
}


export default Researcher;
