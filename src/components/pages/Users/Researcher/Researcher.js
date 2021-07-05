import React from "react";
import { auth, GetFormDownload, getUser, signOut } from '../../../../firebase/firebase'
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

                    <button id="BalanceMode" className="btn btn-info" onClick={() => {
                    }}>מצב הוצאות ויתרה<span
                        className="fa fa-arrow-right"></span></button>
                    <button id="BudgetSpreadshee" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "Budget", this.state.user)
                    }}>תקציבי מחקר<span className="fa fa-arrow-right"></span></button>
                    <button id="repor-button" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "ScientificReport", this.state.user)
                    }}>דוחות מדעים<span
                        className="fa fa-arrow-right"></span></button>
                    <button id="ChatR" className="btn btn-info" onClick={() => {
                        NextPage(this.props, "ChatR", this.state.user)
                    }}>צ'אט למנהל<span
                        className="fa fa-arrow-right"></span></button>

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
                            //   css={override}
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
