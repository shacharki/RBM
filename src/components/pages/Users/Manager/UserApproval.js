import React from 'react'
import Select from 'react-select'
import {db, CreateUser, DeleteUser, auth, getUser} from '../../../../firebase/firebase'
import Grid from "@material-ui/core/Grid";
import '../Manager/Manager.css';
import ClipLoader from "react-spinners/ClipLoader";


const options = [
]


class UserApproval extends React.Component {
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


    async componentDidMount() {
        var href =  window.location.href.split("/",5)
        // console.log(href)
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
                    this.render()
                    this.setState({loadPage:true})
                    this.loadSpinner(false,"")
                    this.loadSpinner(true,"טוען משתמשים להצגה")
                    const collection = await db.collection('waitforapproval').get()
                    const usersList = [];
                    collection.forEach(doc => {
                        const data = doc.data();
                        if (data)
                            usersList.push(data)
                    });
                    this.setState({users: usersList});

                    var nameData =  await db.collection("Data").get();
                    nameData.forEach(doc=>{
                        options.push({ value: doc.ref, label: doc.data().name })
                    })

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

    radio(e,index,user)
    {

        var researcher = document.getElementById("researcher"+index)
        var manager = document.getElementById("managers"+index)
        var tester = document.getElementById("testers"+index)


        user.type = e.target.value;


        if(e.target === researcher) {
            researcher.checked=true;
            manager.checked=false;
            tester.checked=false;

        }
        else if(e.target === manager) {
            researcher.checked=false;
            manager.checked=true;
            tester.checked=false;

        }
        else {
            researcher.checked=false;
            manager.checked=false;
            tester.checked=true;
        }
    }
    render() {
        if(this.state.loadPage) {
            if (this.state.page === 'menu')
                return (
                    <div>
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

                    </div>
                )
            if (this.state.users) {
                if (this.state.users.length === 0) {
                    return (
                        <div id="guideAttendReport" className="sec-design" dir="rtl">
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
                            <div id="name-group" className="form-group">
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        אין משתמשים חדשים
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <button id="feedback-button" className="btn btn-info" onClick={() => {
                                        this.BackPage()
                                    }}>חזרה לתפריט
                                    </button>
                                </Grid>
                            </div>
                        </div>
                    )
                }
                return (
                    <div id="guideAttendReport" className="sec-design" dir="rtl">
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
                        <div align="right">
                            <h2>אישור משתמשים</h2>
                        </div>
                        <div id="name-group" className="form-group">
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Grid container
                                          direction="row"
                                          justify="space-between"
                                          alignItems="center"
                                          spacing={2}>

                                        {this.state.users.map((user, index) => (
                                                <Grid item xs={12} key={index}>
                                                    {this.Card(user, index)}
                                                </Grid>
                                            )
                                        )}


                                    </Grid>
                                    <Grid item xs={12}>
                                        <button id="feedback-button" className="btn btn-info" onClick={() => {
                                            this.BackPage()
                                        }}>חזרה לתפריט
                                        </button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </div>

                    </div>
                );
            } else {
                return (
                    <div id="guideAttendReport" className="sec-design" dir="rtl">
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
                        <div id="name-group" className="form-group">
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    טוען משתמשים
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                )
            }
        }
        else {
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
                                    //   css={override}
                                            size={120}
                                            color={"#123abc"}

                                />
                            </div>
                        </div>
                    }
                </div>)
        }
    }




    Card(user,index) {
        return (
            <div className="Card"  dir="rtl">
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <b>שם מלא: </b>  {user.fname + " " + user.lname}<br/>
                        <b> אימייל: </b> {user.email}<br/>
                        <b> טלפון: </b>{user.phone}<br/>
                        {
                            (user.type === "researcher") ?
                                (<b> תפקיד: חוקר </b>):(user.type === "managers")?
                                (<b> תפקיד: מנהל </b>):(<b> תפקיד: בודק </b>)


                        }

                    </Grid>

                    <Grid item xs={3}>
                        <div>

                            <label>
                                <input id ={"researcher"+index} type="radio" value="researcher"  onClick={e => {
                                    this.radio(e,index,user)
                                }}/>
                                חוקר
                            </label>
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div>

                            <label>
                                <input id ={"managers"+index} type="radio" value="managers"  onClick={e => {
                                    this.radio(e,index,user)
                                }}/>
                                מנהל
                            </label>
                        </div>
                    </Grid>

                    <Grid item xs={12}>
                        {/*<div className="text-below-image">*/}
                        {/*    <label className="container">אישור בקשה<input type='checkbox'  onChange={e=>{*/}
                        {/*        user.approve = e.target.checked*/}
                        {/*    } }/></label>*/}
                        {/*</div>*/}

                    </Grid>

                    <Grid item xs={6}>
                        <button
                            style={{backgroundColor: "rgb(50,248,6)"}}
                            onClick={()=>{
                                CreateUser(user).then(()=>{
                                    var newUsers = []
                                    this.state.users.forEach((user,i)=>{
                                        if(index!==i)
                                            newUsers.push(user)
                                    })
                                    this.setState({users:newUsers})
                                })
                            }}>אישור בקשה </button>
                    </Grid>
                    <Grid item xs={6}>
                        <button
                            style={{backgroundColor: "rgb(248,6,6)"}}
                            onClick={()=>{
                                DeleteUser(user.uid).then(()=>{
                                    var newUsers = []
                                    this.state.users.forEach((user,i)=>{
                                        if(index!==i)
                                            newUsers.push(user)
                                    })
                                    this.setState({users:newUsers})
                                })
                            }}>דחיית בקשה</button>
                    </Grid>
                </Grid>




            </div>
        );
    }

    loadUser(page)
    {
        this.props.history.push({
            pathname: `/Temp${page}`,
            data: this.state.user // your data array of objects
        })
    }

    BackPage()
    {
        this.props.history.push({
            pathname: `/Manager/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export  default  UserApproval;