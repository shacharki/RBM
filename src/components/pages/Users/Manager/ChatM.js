import React from "react";
import { auth, db, GetFormDownload, getPathData, getUser, signOut } from '../../../../firebase/firebase';
import './Manager.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import Select from "react-select";
import ChatManager from "./ChatManager";
import getAllUsers from "../../../../firebase/getAllUsers";

class ChatR extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPage: false,
            spinner: [true, 'נא להמתין הדף נטען'],
            researchersList: [],
            selectedUserUid: ''
        };

    }



    async getManagerObject() {
        const result = await db.collection("managers").doc(auth.currentUser.uid).get();
        return result.data();
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

                var type = await getUser(user)
                if (href[4] === user.uid && (href[3] === type || type === 'Tester')) {
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })

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

            var teamName = this.getManagerObject();

            this.loadSpinner(false, "")
            this.setState({ loadPage: true })
            this.render()

        })

        // Get all of the researchers of the current teamm and add them to the list of researchers.
        getAllUsers().then(async users => {
            const manager = await this.getManagerObject();

            var list = users.filter(doc => doc.teamName === manager.teamName).map(doc => {
                return {
                    label: `${doc.fname} ${doc.lname}`,
                    value: doc.uid
                }
            })

            this.setState({
                researchersList: list
            })
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
                        <Select placeholder={" בחר משתמש "} options={this.state.researchersList} onChange={(e) => {
                            this.setState({ selectedUserUid: e.value })
                        }} required />
                    </Grid>
                    <Grid item xs={5}>
                        <ChatManager selectedUserUid={this.state.selectedUserUid} />
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






    BackPage() {
        this.props.history.push({
            pathname: `/Manager/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export default ChatR;