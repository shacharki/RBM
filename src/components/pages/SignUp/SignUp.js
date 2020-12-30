import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "react-select";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import {db, RegisterUser,CreateNewUser} from "../../../firebase/firebase";
import './SignUp.css'


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
            type:'',
        };


    }


    // async  GetTeams() {
    //     // console.log("בדיקה")
    //
    //     if (!op) {
    //         op=true
    //         var nameTeams = await db.collection("Teams")
    //             .orderBy('name','asc')
    //             .get()
    //         // console.log(nameTeams)
    //         nameTeams.forEach(doc => {
    //             options.push({value: doc.ref, label: doc.data().name})
    //         })
    //         // console.log(options)
    //
    //     }
    // }

    async onRegister() {
        try {
            // await firebase.register(fname, email, password)

            console.log(this.state)
            if(!this.state.fname||!this.state.lname||!this.state.email||!this.state.phone) {
                alert("נא למלא את כל השדות החובה")
                return
            }
            await this.setState({approve:false})
            console.log("this.state.email"+this.state.email)
            console.log("this.state.phone"+this.state.phone)
            var newUser = await CreateNewUser(this.state.email,this.state.phone)
            console.log("this.state.email"+this.state.email)

            this.setState({uid:newUser.user.uid})
            console.log("newUser.user.uid"+newUser.user.uid)
            console.log("this.state"+this.state)

            await RegisterUser(newUser.user,this.state)
            console.log("newUser.user.uid"+newUser.user.uid)

            console.log("this.state"+this.state)

            // await DeleteUser(email)
            alert("ההרשמה בוצעה בהצלחה נא להמתין לאישור מנהל")
            this.props.history.push({
                pathname: `/`,
            })
        } catch(error) {
            alert(error.message)
        }
    }




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
                                    // this.GetTeams()
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
                                    // this.GetTeams()
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
                                    // this.GetTeams()
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
                                    // this.GetTeams()
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
                                    // this.GetTeams()
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
                        {/*<Grid item xs={12} hidden={options.length<=0}>*/}
                        {/*    <Select  placeholder={" בחר קבוצה " }options={options} onChange={e=>{*/}
                        {/*        // console.log(e.label,e.value);*/}
                        {/*        this.setState({team:e.value,teamName:e.label})*/}
                        {/*    }} required/>*/}
                        {/*</Grid>*/}

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