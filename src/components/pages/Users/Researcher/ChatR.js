import React from "react";
import {auth, db, GetFormDownload, getPathData, getUser, signOut} from '../../../../firebase/firebase';
import './Researcher.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import firebase from "firebase";
import {NextPage} from "../UserPage";
import ChatResearcher from "./ChatResearcher";
import MyDropzone from "./DropzoneFiles.js";
import AcceptMaxFiles from "./DropzoneFiles.js";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import Select from "react-select";


const options = [
]


class ChatR extends React.Component {
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
        auth.onAuthStateChanged(async user=>{
            if(user)
            {

                var type = await getUser(user)
                if(href[4] === user.uid && (href[3] === type||type==='Tester'))
                {
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })

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
            var teamName = await db.collection("researcher").doc(auth.currentUser.uid).get()

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
                                borderRadius: "25px"
                            }}
                                        size={120}
                                        color={"#123abc"}

                            />
                        </div>
                    </div>
                }

                <Grid container spacing={2}>
                    <Grid item xs={8} >
                        <Select  placeholder={" בחר משתמש "} options={options} onChange={(e)=>{
                            this.setState({teamPath:(e.value).path,teamName:e.label})
                        }} required/>
                    </Grid>
                    <Grid item xs={5}

                    >
                        <ChatResearcher/>
                    </Grid>




                    <button id="go-back" className="btn btn-info" onClick={() => {
                        this.loadPage()
                        this.BackPage()
                    }}>חזור לתפריט
                    </button>
                </Grid>


            </div>
        )
    }






    BackPage()
    {
        this.props.history.push({
            pathname: `/Researcher/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export  default  ChatR;