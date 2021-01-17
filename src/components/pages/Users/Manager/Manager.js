import React from "react";
import {auth, getUser, signOut} from '../../../../firebase/firebase'
import {NextPage} from "../UserPage";
import ClipLoader from "react-spinners/ClipLoader";
import './Manager.css'

class Manager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPage:false,
            spinner: [true,'נא להמתין הדף נטען'],
            isLoad:false,
            user: props.location,
            error:false,
            loading: true,
            rule:"Manager",
        };
    }


    loadPage(event){
        this.setState({loading:event})
    }

    async componentDidMount() {
        var href =  window.location.href.split("/",5)
        auth.onAuthStateChanged(async user=>{
            if(user)
            {


                var type = await getUser(user)
                if(type === "wait")
                {
                    alert('המנהל עדיין לא אישר את הבקשה')
                    window.location.href = '/Login';
                    return
                }


                if(href[4] === user.uid && (href[3] === type||type==='Tester'))
                {
                    await this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })
                    this.render()
                    this.setState({loadPage:true})
                    this.loadSpinner(false,"")
                    return
                }
                else
                {
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

    loadSpinner(event,massage = ""){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }


    async  logout() {
        //מסך טעינה
        await auth.signOut();
        window.location.href = '/';
        //סיום מסך טעינה
    }



    render() {
        if (this.state.loadPage)
        {
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

                    <button id="ReportsApproval" className="btn btn-info" onClick={() => {
                         //this.ChangePage("")
                        return
                    }}>אישור דוחות ובקשות<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="ResearchBudgets" className="btn btn-info" onClick={() => {
                        // this.ChangePage("")
                        return
                    }}>תקציבי מחקר<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="ExpenseReporting" className="btn btn-info" onClick={() => {
                        // this.ChangePage("")
                        return
                    }}>דיווח הוצאות<span
                        className="fa fa-arrow-right"></span></button>

                    <button id="financialReports" className="btn btn-info" onClick={() => {
                        // this.ChangePage("")
                        return
                    }}>דוחות כספיים<span
                            className="fa fa-arrow-right"></span></button>

                    <button id="ChatResearcher" className="btn btn-info" onClick={() => {
                        // NextPage(this.props, "", this.state.user)
                    }}>צ'אט לחוקר<span
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

    loadTempPage(path)
    {
        this.props.history.push({
            pathname: `/${path}`,
            data: this.state.user
        })
    }

    ChangePage(path)
    {
        this.props.history.push({
            pathname: `${this.props.location.pathname}/${path}`,
            data: this.state.user
        })

    }

    loadUser(page)
    {
        this.props.history.push({
            pathname: `/${page}/${this.state.user.id}`,
            data: this.state.user // your data array of objects
        })
    }

    notfound()
    {
        this.props.history.push({
            pathname: `/404`,
            data: this.state.user // your data array of objects
        })
    }
}


export  default  Manager;