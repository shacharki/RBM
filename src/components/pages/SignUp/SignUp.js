import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "react-select";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import {db, RegisterUser,CreateNewUser} from "../../../firebase/firebase";
import './SignUp.css'
// import {getAllUsers} from "src/components/pages/Users/Manager/UpdatesFirebase.js"

// var researchersOptions = []
// var emptyresearchersOptions = []
// var emptyTeamOptions = []
// var TeamOptions = []


const options = [
]
let op = false

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fname:'',
            lname:'',
            email:'',
            ID: '',
            phone:'',
            team:'',
            teamName:'',
            type:'',
            password:'',

        };


    }

    async  GetTeams() {
        // console.log("בדיקה")

        // var temp =await getAllUsers('teamEmpty')
        // // this.setState({showTeamWithoutGuide:!this.state.showTeamWithoutGuide})
        // this.setState({TeamEmpty:[e.value]})

        if (!op) {
            op=true
            var nameTeams = await db.collection("Data")
                .orderBy('name','asc')
                .get()
             console.log("nameTeams",nameTeams)

            nameTeams.forEach(doc => {
                options.push({value: doc.ref, label: doc.data().name})
            })
            console.log("options",options)

        }
    }

    async onRegister() {
        try {

            if(!this.state.fname||!this.state.lname||!this.state.email||!this.state.team||!this.state.phone) {
                alert("נא למלא את כל השדות החובה")
                return
            }
            await this.setState({approve:false})
            // console.log("this.state.email"+this.state.email)
            var newUser = await CreateNewUser(this.state.email,this.state.phone,this.state.password)

            this.setState({uid:newUser.user.uid})

            await RegisterUser(newUser.user,this.state)

            alert("ההרשמה בוצעה בהצלחה נא להמתין לאישור מנהל")
            this.props.history.push({
                pathname: `/`,
            })
        } catch(error) {
            alert(error.message)
        }
    }

    //
    // async getAllUsers(user) {
    //     this.loadSpinner(true,"מיבא נתוני משתמשים")
    //     // console.log("this.state",this.state)
    //     // console.log("this.state.researchers",this.state.researchers)
    //     // console.log("this.state.researchersEmpty",this.state.researchersEmpty)
    //     // console.log("this.state.Data",this.state.Data)
    //     // console.log("this.state.TeamEmpty",this.state.TeamEmpty)
    //
    //     if ((user === 'researcher' && this.state.researchers && this.state.researchers > 1) ||
    //         (user === 'researchersEmpty' && this.state.researchersEmpty && this.state.researchersEmpty > 1) ||
    //         (user === 'teamEmpty' && this.state.TeamEmpty && this.state.TeamEmpty > 1) ||
    //         (user === 'Data' && this.state.Data && this.state.Data > 1)) {
    //         this.loadSpinner(false,"")
    //         return
    //     }
    //     // console.log(user)
    //     var temp = user
    //     if (user === 'researcher')
    //         researchersOptions = []
    //     else if (user === 'researchersEmpty') {
    //         emptyresearchersOptions = []
    //         temp = 'researcher'
    //     } else if (user === 'teamEmpty') {
    //         emptyTeamOptions = []
    //         temp = 'Data'
    //     } else if (user === 'Data') {
    //         TeamOptions = []
    //         temp = 'Data'
    //     }
    //     var allUsers = []
    //     await db.collection(temp).get().then(res => {
    //         res.forEach(res => {
    //             if (res.data().uid) {
    //                 if (user === 'researcher') {
    //                     allUsers.push(res)
    //                     researchersOptions.push({value: res, label: res.data().fname + ' ' + res.data().lname})
    //
    //                 } else if (user === 'researchersEmpty' && !res.data().team) {
    //                     allUsers.push(res)
    //                     emptyresearchersOptions.push({value: res, label: res.data().fname + ' ' + res.data().lname})
    //                 }
    //             } else if (user === 'teamEmpty' && !res.data().researcher) {
    //                 allUsers.push(res)
    //                 emptyTeamOptions.push({value: res, label: res.name})
    //
    //             } else if (user === 'Data' && res.data().researcher) {
    //                 allUsers.push(res)
    //                 TeamOptions.push({value: res, label: res.name})
    //             }
    //         })
    //     })
    //     if (user === 'researcher') {
    //         this.setState({researchers: allUsers})
    //         this.createCsvFile(allUsers,'researcher')
    //     }
    //     else if (user === 'researchersEmpty')
    //         this.setState({researchersEmpty: allUsers})
    //     else if (user === 'studentEmpty')
    //         this.setState({StudentEmpty: allUsers})
    //     else if (user === 'teamEmpty')
    //         this.setState({TeamEmpty: allUsers})
    //     else if (user === 'Data') {
    //         this.setState({Data: allUsers})
    //     }
    //
    //     this.loadSpinner(false,"")
    //     console.log("all users",allUsers)
    // }




    render() {
        return (
            <div id="instructor" className="sec-design" dir='rtl'>
                <h2>טופס הרשמה</h2>
                <div id="instructor_menu" className="form-design" name="student_form">
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="fname"
                                name="fname"
                                type="string"
                                autoComplete="off"
                                autoFocus
                                value={this.state.fname}
                                onChange={e => {
                                    this.setState({fname:e.target.value})
                                    this.GetTeams()

                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="שם פרטי"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="lname"
                                name="lname"
                                type="string"
                                autoComplete="off"
                                value={this.state.lname}
                                onChange={e => {
                                    this.setState({lname:e.target.value})
                                    this.GetTeams()

                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="שם משפחה"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="off"
                                value={this.state.phone}
                                onChange={e => {
                                    this.setState({phone:e.target.value})
                                    // this.setState({password:e.target.value})
                                    this.GetTeams()


                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="פלאפון"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="ID"
                                name="ID"
                                type="tel"
                                autoComplete="off"
                                value={this.state.ID}
                                onChange={e => {
                                    this.setState({ID:e.target.value})
                                    this.GetTeams()

                                }}
                                variant="standard"
                                fullWidth
                                label="תעודת זהות"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                value={this.state.email}
                                onChange={e => {
                                    this.setState({email:e.target.value})
                                    this.GetTeams()

                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="Email"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <div>

                                <label>
                                    <input type="radio" value="researcher" checked={this.state.type==='researcher'}  onChange={e =>
                                        this.setState({type:e.target.value})}/>
                                    חוקר
                                </label>
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div>

                                <label>
                                    <input type="radio" value="managers" checked={this.state.type==='managers'} onChange={e =>
                                        this.setState({type:e.target.value})}/>
                                    מנהל
                                </label>
                            </div>
                        </Grid>

                        <Grid item xs={12} hidden={options.length<=0}>
                            <Select  placeholder={" בחר שם " }options={options}  onChange={e=>{
                                // console.log(e.label,e.value);
                                this.setState({team:e.value,teamName:e.label})
                            }} required/>
                        </Grid>


                        <Grid item xs={12}>
                            <div>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    id="registerBtn"
                                    onClick={()=>{this.onRegister()}}
                                    register="true">

                                    הרשמה
                                </Button>
                            </div>
                        </Grid>


                        <Grid item xs={12}>
                            <div>

                                <Button
                                    type="submit"
                                    style={{style: {margin: '10px'}}}
                                    fullWidth
                                    variant="contained"
                                    id="LoginBtn"
                                    component={Link}
                                    to="/Login">
                                    כבר יש לך משתמש? התחברות
                                </Button>
                            </div>
                        </Grid>

                        <Grid item xs={12}>
                            <div>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    id="HomeBtn"
                                    component={Link}
                                    to="/">
                                    חזרה לעמוד הראשי
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>

            </div>
        )
    }
}

export  default  SignUp;