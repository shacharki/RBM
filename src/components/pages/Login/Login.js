import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { Avatar, Button, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { auth } from "../../../firebase/firebase";
import './Login.css'
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { NotificationManager } from "react-notifications";



class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            email: '',
            password: '',
        };
    }

    async Canlogin() {
        if (this.state.email.length <= 0) {
            return NotificationManager.error("לא הוזן email", "", 1500)
        }
        if (this.state.password.length <= 0) {
            return NotificationManager.error("לא הוזנה סיסמה", "", 1500)
        }

        try {
            await auth.signInWithEmailAndPassword(this.state.email, this.state.password).then((user) => {
                this.props.history.push({
                    pathname: '/User',
                    data: user.user // your data array of objects
                })
                // props.history.push('/User')

            }).catch(function (error) {
                    NotificationManager.error("שם משתמש או סיסמה לא נכונים","", 1500)
                });


        } catch (error) {
            NotificationManager.error("חלה בעיה")
            console.log(error)
        }
    }



    render() {
        return (
            <div id="instructor" className="sec-design" dir='rtl'>

                <div id="instructor_menu" className="form-design" name="student_form">
                    <Grid container spacing={2}>
                        <Grid item xs={5}>
                            <Avatar style={{ style: { background: "black" } }}>
                                <LockOutlinedIcon />
                            </Avatar>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography component="h2" variant="h5">
                                התחברות
                            </Typography>
                        </Grid>
                        <Grid item xs={12} dir="ltr">
                            <TextField
                                inputProps={{ style: { textAlign: 'center' } }}
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="off"
                                autoFocus
                                value={this.state.email}
                                onChange={e => {
                                    this.setState({ email: e.target.value })
                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="Email"
                            />
                        </Grid>
                        <Grid item xs={12} dir="ltr">
                            <TextField
                                inputProps={{ style: { textAlign: 'center' } }}
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="off"
                                value={this.state.password}
                                onChange={e => {
                                    this.setState({ password: e.target.value })
                                }}
                                variant="standard"
                                required
                                fullWidth
                                label="סיסמה"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <div>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    id="LoginBtn"
                                    onClick={() => { this.Canlogin() }}>
                                    כניסה
                                </Button>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div>

                                <Button
                                    type="submit"
                                    style={{ style: { margin: '10px' } }}
                                    fullWidth
                                    variant="contained"
                                    id="registerBtn2"
                                    component={Link}
                                    to="/Signup">
                                    אין לך משתמש? הרשמה
                                </Button>
                            </div>
                        </Grid>
                        <Grid item xs={12}>
                            <div>

                                <Button
                                    type="submit"
                                    style={{ style: { margin: '10px' } }}
                                    fullWidth
                                    variant="contained"
                                    id="registerBtn1"
                                    component={Link}
                                    to="/resetPassword">
                                    שכחתי סיסמא
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

export default Login;