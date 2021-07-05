import React from "react";
import { auth, db, GetFormDownload, getPathData, getUser, signOut } from '../../../../firebase/firebase';
import "./BudgetSpreadsheetComponent/spreadsheetStyles.css"
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import firebase from "firebase";
import { NextPage } from "../UserPage";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import Select from "react-select";
import BudgetSpreadsheet from "./BudgetSpreadsheetComponent/BudgetSpreadsheet";


const options = [
]


class Budget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPage: false,
            spinner: [true, 'נא להמתין הדף נטען'],

        };

    }

    loadSpinner(event, massage) {
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({ spinner: spinner })
    }

    loadPage(event) {
        this.setState({ loading: event })
    }


    async componentDidMount() {
        var href = window.location.href.split("/", 5)
        // console.log(href)
        auth.onAuthStateChanged(async user => {
            if (user) {

                // console.log("in1")
                var type = await getUser(user)
                // console.log(type)
                if (href[4] === user.uid && (href[3] === type || type === 'Tester')) {
                    // console.log("in2")
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })

                }
                else {
                    // console.log("in3")
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
            var teamName = await db.collection("Manager").doc(auth.currentUser.uid).get()
            this.loadSpinner(false, "")
            this.setState({ loadPage: true })
            this.render()

        })

    }

    render() {
        return (
            <div id="ReportScientific" className="sec-design1">


                {!this.state.spinner[0] ? "" :
                    <div id='fr'>
                        {this.state.spinner[1]}
                        <div className="sweet-loading">
                            <ClipLoader style={{
                                backgroundColor: "rgba(255,255,255,0.85)",
                            }}
                                size={220}
                                color={"#123abc"}

                            />
                        </div>
                    </div>
                }

                <BudgetSpreadsheet />

                <button id="go-back" className="btn btn-info" onClick={() => {
                    this.loadPage()
                    this.BackPage()
                }}>חזור לתפריט
                </button>


            </div>
        )
    }



    BackPage() {
        // Infer the user type from the url. 
        const userType = window.location.href.indexOf("Manager") == -1 ? "Researcher" : "Manager"

        this.props.history.push({
            pathname: `/${userType}/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export default Budget;