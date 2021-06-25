import React from "react";
import {auth, db, GetFormDownload, getPathData, getUser, signOut} from '../../../../firebase/firebase';
import "./spreadsheetStyles.css"
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import firebase from "firebase";
import {NextPage} from "../UserPage";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import Select from "react-select";
import BudgetSpreadsheet from "./BudgetSpreadsheet";


const options = [
]


class Budget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPage:false,
            spinner: [true,'נא להמתין הדף נטען'],

        };

    }

    loadSpinner(event,massage){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }

    loadPage(event){
        this.setState({loading:event})
    }


    async componentDidMount() {
        var href =  window.location.href.split("/",5)
        // console.log(href)
        auth.onAuthStateChanged(async user=>{
            if(user)
            {

                // console.log("in1")
                var type = await getUser(user)
                // console.log(type)
                if(href[4] === user.uid && (href[3] === type||type==='Tester'))
                {
                    // console.log("in2")
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })

                }
                else
                {
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
            // console.log("in4")
            var teamName = await db.collection("Manager").doc(auth.currentUser.uid).get()
            // if(!teamName.data().teamName)
            // {
            //     alert("אינך משוייכ/ת לקבוצה יש לפנות למנהל")
            //     this.loadSpinner(false)
            //     this.BackPage()
            // }
            this.loadSpinner(false,"")
            this.setState({loadPage:true})
            this.render()

        })

    }

    render() {
        return (
            <div id="ReportScientific" className="sec-design">

                {!this.state.spinner[0] ? "" :
                    <div id='fr'>
                        {this.state.spinner[1]}
                        <div className="sweet-loading">
                            <ClipLoader style={{
                                backgroundColor: "rgba(255,255,255,0.85)",
                                borderRadius: "40px"
                            }}
                                //   css={override}
                                        size={220}
                                        color={"#123abc"}

                            />
                        </div>
                    </div>
                }


                    {/*<Grid item xs={18}*/}
                    {/*    // container*/}
                    {/*    // direction="column"*/}
                    {/*    // justify="flex-start"*/}
                    {/*    // alignItems="flex-start"*/}
                    {/*>*/}
                        <BudgetSpreadsheet/>
                    {/*</Grid>*/}




                    <button id="go-back" className="btn btn-info" onClick={() => {
                        this.loadPage()
                        this.BackPage()
                    }}>חזור לתפריט
                    </button>


            </div>
        )
    }






    BackPage()
    {
        this.props.history.push({
            pathname: `/Manager/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export  default  Budget;