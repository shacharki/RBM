import React,{ Fragment } from "react";
import {auth, db, getUser} from '../../../../firebase/firebase';
import { Radio, RadioGroup} from "@material-ui/core";
import './Researcher.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import TextField from "@material-ui/core/TextField";
import firebase from "firebase";
//import {storage} from "./firebase";

import ReactDOM from 'react-dom'
import SignatureCanvas from 'react-signature-canvas'
import DropzoneFiles2 from "../Researcher/DropzoneFiles2";

class RequestPurchase extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadPage:false,
            spinner: [true,'נא להמתין הדף נטען'],
            page:'menu',
            user: props.location,
            error:false,
            loading: true,
            rule:"Manager",
            prevDate:'',
            imgUrl: "",

            viewResearcher: false,
            date:"",
            form : {
                date:"",
                team:"",
                name:"",
            }
        };


        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        // this.handleChangeDate = this.handleChangeDate.bind(this)
        this.approvResearcher = this.approvResearcher.bind(this)

        this.RequestPurchase = this.RequestPurchase.bind(this)


    }

    parser(date)
    {
        var year=''
        var month = ''
        var day = ''
        var j=0;
        for(var i =0; i<date.length; i++)
        {
            if(j===0 && date[i]!=='-')
            {
                year+=date[i]
            }
            else if(j===1 && date[i]!=='-')
            {
                month+=date[i]
            }
            else if(j===2 && date[i]!=='-')
            {
                day+=date[i]
            }
            else
                j++

        }
        year = parseInt(year)
        month=parseInt(month)
        day= parseInt(day)
        return {year,month,day}
    }

    loadSpinner(event,massage = ""){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }
    save() {
        const imgUrl = this.canvas.toDataURL("image/png");
        console.log(imgUrl)
        var form = this.state.form
        form["signature"] = imgUrl;
        this.setState({form:form})
        this.setState({ imgUrl: imgUrl });

    }
    reset() {
        this.canvas.clear();
    }
    canvas = {
        clear: () => {},
        toDataURL: (param) => {
            return "";
        },
    };
    async handleChange(event)
    {
        var form=''

        var name = event.target.name;
        var value = event.target.value;
        var e = event.target
        // console.log("name2",name)
        // console.log("value2",value)
        // console.log("e2",e)

        if(name === 'date' && event.target.value!=='' )
        {
            // console.log("1111111111111")

            this.loadSpinner(true,"טוען נתוני חוקר")
            var formResearcher = await db.collection("researcher").doc(auth.currentUser.uid).collection("request").doc(event.target.value).get()

            if(formResearcher.data())
            {
                // console.log("222222222222222")
                this.setState({form:formResearcher.data().form})
            }
            else
            {
                // console.log("33333333333333")
                var researcherData= await db.collection("researcher").doc(auth.currentUser.uid).get()
                form ={}
                form[name] = value;
                form['name']=researcherData.data().fname+' '+researcherData.data().lname;
                // form['team']=researcherData.data().teamName
                this.setState({form:form})
            }
        }
        else
        {
            // console.log("44444444444444")
            form = this.state.form
            form[name] = value;
            this.setState({form:form})
        }
        this.loadSpinner(false)

    }


    async handleSubmit(event)
    {
        if(!this.state.date) {
            return;
        }
        if(this.state.date === this.state.prevDate) {
            this.setState({viewResearcher: !this.state.viewResearcher});
            return ;
        }
        this.loadSpinner(true,"מעדכן נתונים חדשים")
        this.setState({prevDate:this.state.date});
        // console.log("in");
        var request = (await db.collection("researcher").doc(auth.currentUser.uid).get()).data().type;
        const collection = await db.collection('researcher').where("request","==",request).get()
        const researchers = [];
        const date = this.state.date
        const collectionPromisesTeam = collection.docs.map( async function(doc) {
            var ref =await db.collection("researcher").doc(doc.id).collection("request").doc(date).get()
            var user = await db.collection("researcher").doc(doc.id).get()
            return [ref,user]

        })

        Promise.all(collectionPromisesTeam).then(res => {
            // console.log("end prommis");
            res.forEach(doc=>{
                var approv = false;
                var Request = ''
                if(doc[0].exists) {
                    approv = true;
                    Request = doc[0].data().RequestPurchase;
                }
                var data = doc[1].data();
                var ref = doc[1].id;
                researchers.push({data,approv,ref,Request})
            })
            let i;
            // console.log(researchers.length)
            this.setState({viewResearcher: !this.state.viewResearcher});
            for (i=0;i<researchers.length;i++)
            {
                if(!this.state.researchers)
                {
                    this.setState({researchers: researchers});
                    this.loadSpinner(false)
                    return
                }
                else if(researchers[i].approv!==this.state.researchers[i].approv)
                {
                    this.setState({researchers: researchers});
                    this.loadSpinner(false)
                    return
                }

            }
            this.loadSpinner(false)
        });


    }
    loadPage(event){
        this.setState({loading:event})
    }

    async sendRequest(form){
        console.log("form2",form)
        console.log("form.date2",form.date)

        this.loadSpinner(true,"שליחת הבקשה")
        var path = auth.currentUser.uid
        try{
            var researcher = await db.collection("researcher").doc(path)
            // console.log("form1",form)
            var newDate = await researcher.collection("request").doc(form.date);
            // console.log("form.date",form.date)
            // console.log("form",form)

            newDate.set({
                form: form,
                date:form.date,
            }).then(async ()=>{
                await this.addDataToTeam(researcher,form.date);
                alert("הטופס נשלח בהצלחה")
                this.loadSpinner(false)
                window.location.reload(true);

            })

        }catch(error) {
            console.log("err2")

            alert(error.message)
            this.loadSpinner(false)
        }
    }
    async addDataToTeam(researcher,date)
    {
        console.log("researcher2",researcher)
        console.log("date2",date)

        var user = firebase.auth().currentUser;

        var formResearcher = (await researcher.collection('request').doc(date).get()).ref;
        try{
            var team = (await researcher.get()).data();
            var name =(team.fname + " "+team.lname);
            // console.log("name2",name)
            // console.log("team2",team)

            var teamCollection = await db.collection("Data").doc(team.team.id)
            // var Collection = await teamCollection.collection("Requests").doc(name)
            var newDate = await teamCollection.collection("Requests").doc(date)
            // var newDate = Collection.collection(date).doc();
            var doc =  await newDate.get()
            var {year,month,day} = this.parser(date)
            var fullDate = new Date()
            fullDate.setTime(0)
            fullDate.setFullYear(year,month-1,day)

            // console.log("team.team.id",team.team.id)
            // console.log("teamCollection",teamCollection)
            // console.log("newDate",newDate)
            // console.log("fullDate",fullDate)
            // console.log("formResearcher",formResearcher)

            // var temp = newDate.set({
            //     date:fullDate,
            //     RequestResearcher: formResearcher,
            //     nameResearcher: team.fname + " "+team.lname,
            //
            // })
            //
            // // db.collection("Data").doc().set({name})
            // await db.collection("Data").doc().collection(name).set(temp).then(()=>{
            //         alert("הדוח נוסף")
            //         return true;
            //     }
            // ).catch((e)=>{
            //     alert("הדוח לא הוסף")
            //     return false;
            // })


            if(!doc.exists){

                // console.log("doc.exists",doc.exists)
                // console.log("doc",doc)

                newDate.set({
                    date:fullDate,
                    RequestResearcher: formResearcher,
                    nameResearcher: team.fname + " "+team.lname,
                    uid: user.uid

                })
            }
            else {

                // console.log("doc.exists",doc.exists)
                // console.log("doc",doc)

                newDate.update({
                    date:fullDate,
                    RequestResearcher: formResearcher,
                    uid: user.uid

                })
            }
        }catch(error) {
            alert(error.message)
        }

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
            var teamName = await db.collection("researcher").doc(auth.currentUser.uid).get()
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

    approvResearcher(researcher)
    {

        var researchers =  this.state.researchers;
        for(var i=0;i<researchers.length;i++)
        {
            if(researchers[i] === researcher)
            {
                researchers[i].approv = !researchers[i].approv;
                this.setState({researchers:researchers})
                return
            }
        }
    }

    RequestPurchase(event,researcher)
    {
        var researchers = this.state.researchers;
        // console.log(event.target.value);
        for(var i=0;i<researchers.length;i++)
        {
            if(researchers[i] === researcher)
            {
                researchers[i].Request = event.target.value
                this.setState({researchers: researchers})
                return
            }
        }
    }




    render() {
        if(this.state.loadPage) {
            return (
                <div id="ResearcherRequest" className="sec-design">

                    {!this.state.spinner[0] ? "" :
                        <div id='fr'>
                            {this.state.spinner[1]}
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
                    <div dir="rtl">
                        <label id="date" className="title-input">תאריך הבקשה:</label>
                        <input type="date" id="insert-date" name="date" onChange={(e) => this.handleChange(e)}
                               required/>

                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q1i"
                                name="q1"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q1}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="שם הספק"
                            />
                        </Grid>

                        <h4>המזמין: מכון שמיר למחקר - ע"ר</h4>

                        <div id="name-group">
                            <label id="QL" className="title-input">טלפון המכון: 04-6123901. פקס: 04-6961930</label>
                            <br/>
                        </div>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q2i"
                                name="q2"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q2}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="נייד"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q3i"
                                name="q3"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q3}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="טופס הזמנה מס'"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q4i"
                                name="q4"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q4}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מצורפת הצעת מחיר מס':"
                            />
                        </Grid>

                        <h4>פירוט ההצעה:</h4>
                        <table border="1">

                            <tr>
                                <th>מק"ט</th>
                                <th>תיאור הפריט</th>
                                <th>מחיר במט"ח</th>
                                <th>מחיר יח' בש"ח</th>
                                <th>מס' יחידות</th>
                                <th>מחיר בש"ח</th>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q5" id="q5i" placeholder={''}
                                               value={this.state.form.q5 ? (this.state.form.q5) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
                                    <input type="text" name="q6" id="q6i" placeholder={''}
                                           value={this.state.form.q6 ? (this.state.form.q6) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q7" id="q7i" placeholder={''}
                                           value={this.state.form.q7 ? (this.state.form.q7) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q8" id="q8i" placeholder={''}
                                           value={this.state.form.q8 ? (this.state.form.q8) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q9" id="q9i" placeholder={''}
                                           value={this.state.form.q9 ? (this.state.form.q9) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q10" id="q10i" placeholder={''}
                                           value={this.state.form.q10 ? (this.state.form.q10) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q50" id="q50i" placeholder={''}
                                               value={this.state.form.q50 ? (this.state.form.q50) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
                                    <input type="text" name="q60" id="q60i" placeholder={''}
                                           value={this.state.form.q60 ? (this.state.form.q60) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q70" id="q70i" placeholder={''}
                                           value={this.state.form.q70 ? (this.state.form.q70) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q80" id="q80i" placeholder={''}
                                           value={this.state.form.q80 ? (this.state.form.q80) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q90" id="q90i" placeholder={''}
                                           value={this.state.form.q90 ? (this.state.form.q90) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q100" id="q100i" placeholder={''}
                                           value={this.state.form.q100 ? (this.state.form.q100) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q51" id="q51i" placeholder={''}
                                               value={this.state.form.q51 ? (this.state.form.q51) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
                                    <input type="text" name="q61" id="q61i" placeholder={''}
                                           value={this.state.form.q61 ? (this.state.form.q61) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q71" id="q71i" placeholder={''}
                                           value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q81" id="q81i" placeholder={''}
                                           value={this.state.form.q81 ? (this.state.form.q81) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q91" id="q91i" placeholder={''}
                                           value={this.state.form.q91 ? (this.state.form.q91) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q101" id="q101i" placeholder={''}
                                           value={this.state.form.q101 ? (this.state.form.q101) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                                <br/>

                            </tr>
                        </table>

                        {/*<div id="name-group">*/}
                        {/*    <label id="Q102L" className="title-input">סה"כ כולל מע"מ: </label>*/}
                        {/*    <input type="text" name="q102" id="q102i" placeholder={'התשובה שלך'}*/}
                        {/*           value={this.state.form.q102 ? (this.state.form.q102) : ('')} onChange={(e) => {*/}
                        {/*        this.handleChange(e)*/}
                        {/*    }} required/>*/}
                        {/*</div>*/}
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q11i"
                                name="q11"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q11}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="סה'כ כולל מע'מ"
                            />
                        </Grid>
                        <br/>

                        <h4>אבקש לספק לנו את המוצרים הבאים:</h4>

                        <div id="name-group">
                            <label id="QL" className="title-input">המעבדה ממוקמת במבנה החדש של מכון שמיר למחקר (קומה 2), צמוד למכללת אוהלו</label>
                            <br/>
                        </div>

                        <div id="name-group">
                            <label id="QL" className="title-input">תנאי תשלום: שוטף + 30</label>
                            <br/>
                        </div>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q12i"
                                name="q12"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q12}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="נא לתאם את קבלת המשלוח עם"
                            />
                        </Grid>
                        <br/>

                        <h4>לשימוש משרד המכון בלבד:</h4>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q13i"
                                name="q13"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q13}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מטרת הרכישה"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q14i"
                                name="q14"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q14}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תקציב המחקר"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q15i"
                                name="q15"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q15}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מס' מחקר"
                            />
                        </Grid>
                        <br/>

                        <div id="name-group">
                            <label id="QL" className="title-input">שם החוקר: {this.state.user.displayName}</label>
                            <br/>
                        </div>

                        {/*<Grid item xs={6}>*/}
                        {/*    <TextField*/}
                        {/*        inputProps={{style: {textAlign: 'center'}}}*/}
                        {/*        id="q16i"*/}
                        {/*        name="q16"*/}
                        {/*        type="tel"*/}
                        {/*        autoComplete="off"*/}
                        {/*        value={this.state.q16}*/}
                        {/*        onChange={(e) => {*/}
                        {/*            this.handleChange(e)*/}
                        {/*        }}*/}
                        {/*        variant="standard"*/}
                        {/*        fullWidth*/}
                        {/*        label="חתימת החוקר"*/}
                        {/*    />*/}
                        {/*</Grid>*/}
                        <br/>


                        <Fragment>
                            <div className="main">
                                <p>חתימת החוקר</p>
                                <div style={{backgroundColor: "#a0a0a0", width: 400,
                                    height: 200,}}>
                                    <SignatureCanvas

                                        penColor="green"
                                        canvasProps={{
                                            width: 400,
                                            height: 200,
                                            className: "write-name-canvas",
                                        }}
                                        ref={(ref) => {
                                            this.canvas = ref;
                                        }}
                                        id="q16i"
                                        name="q16"
                                        autoComplete="off"
                                        value={this.state.q16}
                                        onChange={(e) => {
                                            this.handleChange(e)
                                        }}
                                        variant="standard"
                                        fullWidth
                                        label="חתימת החוקר"
                                    />
                                </div>
                                <div>
                                    <img
                                        className="write-name-img"
                                        src={
                                            this.state.imgUrl === ""
                                                ? (this.state.imgUrl = "")
                                                : this.state.imgUrl
                                        }
                                    />

                                </div>

                                <div className="write-name-operation">
                                    <button onClick={() => this.reset()}>Reset</button>
                                    <button onClick={() => this.save()}>Save</button>
                                </div>
                            </div>
                        </Fragment>


                        <br/>

                    </div>
                    <div>
                    <p>העלאת נספחי הבקשה</p>

                    <Grid item xs={5}
                          container
                          direction="column"
                          justify="flex-start"
                          alignItems="flex-start"
                    >
                        <DropzoneFiles2/>
                    </Grid>
                    </div>


                    <button id="sendData" className="btn btn-info" onClick={() => {
                        this.save();
                        this.sendRequest(this.state.form)
                    }}>שלח בקשה
                    </button>
                    <button id="go-back" className="btn btn-info" onClick={() => {
                        this.loadPage()
                        this.BackPage()
                    }}>חזור לתפריט
                    </button>
                </div>
            )
        }
        else
            return (<div> {!this.state.spinner[0] ? "" :
                <div id='fr'>
                    {this.state.spinner[1]}
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
            }</div>)
    }

    notfound()
    {
        this.props.history.push({
            pathname: `/404`,
            data: this.state.user // your data array of objects
        })
    }
    BackPage()
    {
        this.props.history.push({
            pathname: `/Researcher/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}



export  default  RequestPurchase;
