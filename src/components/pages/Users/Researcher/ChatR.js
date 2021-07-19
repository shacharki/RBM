import React from "react";
import { auth, db, getManager, getUser } from '../../../../firebase/firebase';
import './Researcher.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import ChatResearcher from "./ChatResearcher";
import Select from "react-select";
import getAllUsers from "../../../../firebase/getAllUsers";
import getUsersLists from "../../../../firebase/getAllUsers";
import getManagerOfCurrentResearcher from "../../../../firebase/getManagerOfCurrentResearcher";
import getAllManagers from "../../../../firebase/getAllManangers";


class ChatR extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPage: false,
            spinner: [true, 'נא להמתין הדף נטען'],
            options: [],
            selectedUserUid: ''
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

                await this.loadSelectOptions();
            }
            else {
                this.setState({
                    isLoad: true,
                })
                window.location.href = '/Login';
                return;

            }

            var teamName = await db.collection("researcher").doc(auth.currentUser.uid).get()
            this.loadSpinner(false, "")
            this.setState({ loadPage: true })
            this.render()

        })
    }

    async loadSelectOptions() {
        const users = await getUsersLists()
        const self = users.find(user => user.uid == auth.currentUser.uid);

        // Find all users of the current user.
        const selectOptions = users.filter(user => user.teamName == self.teamName).map(user => {
            return {
                label: `חוקר ${user.fname} ${user.lname}`,
                value: user.uid
            }
        })

        const managers = await getAllManagers()


        managers.forEach(manager => {
            selectOptions.push({
                label: `מנהל ${manager.fname} ${manager.lname}`,
                value: manager.uid
            })
        })

        this.setState({ options: selectOptions })
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
                        <Select placeholder={" בחר משתמש "} options={this.state.options} onChange={(e) => {
                            this.setState({ selectedUserUid: e.value })
                        }} required />
                    </Grid>
                    <Grid item xs={5}>
                        <ChatResearcher selectedUserUid={this.state.selectedUserUid} />
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
            pathname: `/Researcher/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export default ChatR;