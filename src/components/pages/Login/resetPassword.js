import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import '../Users/UserPage.css'
import {auth} from "../../../firebase/firebase";
import { NotificationManager } from "react-notifications";



class resetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email:'',
        };
    }


    sendEmail(){
        var emailAddress = this.state.email;
        console.log(emailAddress)
        auth.sendPasswordResetEmail(emailAddress).then(function() {
            NotificationManager.success("מייל נשלח בהצלחה")
        }).catch(function(error) {
            alert("המייל לא קיים")
        });
    }

    render() {
        return (
            <div id="instructor" className="sec-design" dir='rtl'>
                <h2>שלח מייל לאיפוס סיסמא</h2>
                <div id="instructor_menu" className="form-design" name="student_form">
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                autoFocus
                                value={this.state.fname}
                                onChange={e => {
                                    this.setState({email:e.target.value})
                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="אימייל"
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <div>
                                <Button id="registerBtn2"
                                    type="submit"
                                    fullWidth
                                    variant="contained"

                                    onClick={()=>{this.sendEmail()}}
                                >
                                    שלח
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

export  default  resetPassword;