import React,{ Fragment } from "react";
import {auth, db, getUser} from '../../../../firebase/firebase';
import { Radio, RadioGroup} from "@material-ui/core";
import './Manager.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import TextField from "@material-ui/core/TextField";
import firebase from "firebase";
//import {storage} from "./firebase";

import ReactDOM from 'react-dom'
import SignatureCanvas from 'react-signature-canvas'

class ResearchBudgets extends React.Component {
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
        var user = firebase.auth().currentUser;

        var formResearcher = (await researcher.collection('request').doc(date).get()).ref;
        try{
            var team = (await researcher.get()).data();
            var name =(team.fname + " "+team.lname);

            var teamCollection = await db.collection("Data").doc(team.team.id)
            var newDate = await teamCollection.collection("Requests").doc(date)
            var doc =  await newDate.get()
            var {year,month,day} = this.parser(date)
            var fullDate = new Date()
            fullDate.setTime(0)
            fullDate.setFullYear(year,month-1,day)

            if(!doc.exists){
                newDate.set({
                    date:fullDate,
                    RequestResearcher: formResearcher,
                    nameResearcher: team.fname + " "+team.lname,
                    uid: user.uid

                })
            }
            else {
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
                    <h4>דו"ח תקציבי למחקר משרד המדע</h4>
                    <Grid item xs={5}>
                        <label id="insert-student" className="title-input" htmlFor="name">מתאריך </label>
                        <input type="date" className="form-control"  name="date"
                               onChange={(e)=>{
                                   this.setState({dateFrom:e.target.value,options:null,show:false,teamName:null})
                               }}
                               required/>
                    </Grid>
                    <Grid item xs={5}>
                        <label id="insert-student" className="title-input" htmlFor="name">עד תאריך </label>
                        <input type="date" className="form-control" id="insert-date" name="date"
                               onChange={(e)=>{
                                   this.setState({dateTo:e.target.value,options:null,show:false,teamName:null})
                               }}
                               required/>
                    </Grid>

                    <div dir="rtl">


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
                                label="שם הגוף המממן"
                            />
                        </Grid>


                        {/*<div id="name-group">*/}
                        {/*    <label id="QL" className="title-input">טלפון המכון: 04-6123901. פקס: 04-6961930</label>*/}
                        {/*    <br/>*/}
                        {/*</div>*/}

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
                                label="חוקר ראשי"
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
                                label="מס מחקר"
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
                                label="שם נושא המחקר"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q5i"
                                name="q5"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q5}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="סכום מחקר כולל"
                            />
                        </Grid>


                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q6i"
                                name="q6"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q6}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="סכום מחקר שנתי"
                            />
                        </Grid>



                        <h4>פירוט ההוצאות:</h4>
                        <h4>שנה 1:</h4>

                        <table border="1">

                            <tr>
                                <th>תאריך</th>
                                <th>כ"א/משכורת</th>
                                <th>נסיעות</th>
                                <th>ציוד אזיל</th>
                                <th>ציוד</th>
                                <th>מחשבים</th>
                                <th>ייעוץ</th>
                                <th>עריכה לשונית</th>
                                <th>סקרים</th>
                                <th>מיקור חוץ</th>
                                <th>דיווח</th>
                                <th>שונות</th>
                                <th>אסמכתא</th>
                                <th>פירוט</th>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q77" id="q77i" placeholder={''}
                                               value={this.state.form.q77 ? (this.state.form.q77) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q7" id="q7i" placeholder={''}
                                               value={this.state.form.q7 ? (this.state.form.q7) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q11" id="q11i" placeholder={''}
                                           value={this.state.form.q11 ? (this.state.form.q11) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q12" id="q12i" placeholder={''}
                                           value={this.state.form.q12 ? (this.state.form.q12) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q13" id="q13i" placeholder={''}
                                           value={this.state.form.q13 ? (this.state.form.q13) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q14" id="q14i" placeholder={''}
                                           value={this.state.form.q14 ? (this.state.form.q14) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q15" id="q15i" placeholder={''}
                                           value={this.state.form.q15 ? (this.state.form.q15) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q16" id="q16i" placeholder={''}
                                           value={this.state.form.q16 ? (this.state.form.q16) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q707" id="q707i" placeholder={''}
                                               value={this.state.form.q707 ? (this.state.form.q707) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q70" id="q70i" placeholder={''}
                                               value={this.state.form.q70 ? (this.state.form.q70) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q110" id="q110i" placeholder={''}
                                           value={this.state.form.q110 ? (this.state.form.q110) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q120" id="q120i" placeholder={''}
                                           value={this.state.form.q120 ? (this.state.form.q120) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q130" id="q130i" placeholder={''}
                                           value={this.state.form.q130 ? (this.state.form.q130) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q140" id="q140i" placeholder={''}
                                           value={this.state.form.q140 ? (this.state.form.q140) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q150" id="q150i" placeholder={''}
                                           value={this.state.form.q150 ? (this.state.form.q150) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q160" id="q160i" placeholder={''}
                                           value={this.state.form.q160 ? (this.state.form.q160) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q170" id="q170i" placeholder={''}
                                           value={this.state.form.q170 ? (this.state.form.q170) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q141" id="q141i" placeholder={''}
                                           value={this.state.form.q141 ? (this.state.form.q141) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q151" id="q151i" placeholder={''}
                                           value={this.state.form.q151 ? (this.state.form.q151) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q161" id="q161i" placeholder={''}
                                           value={this.state.form.q161 ? (this.state.form.q161) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q171" id="q171i" placeholder={''}
                                           value={this.state.form.q171 ? (this.state.form.q171) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                        </table>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q18i"
                                name="q18"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q18}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תנועות"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q19i"
                                name="q19"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q19}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תקציב שנתי"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q20i"
                                name="q20"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q20}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="יתרה נוכחית"
                            />
                        </Grid>
                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q20i"
                                name="q20"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q20}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="סה'כ יתרה"
                            />
                        </Grid>


                        <br/>

                        <h4>שנה 2:</h4>

                        <table border="2">

                            <tr>
                                <th>תאריך</th>
                                <th>כ"א/משכורת</th>
                                <th>נסיעות</th>
                                <th>ציוד אזיל</th>
                                <th>ציוד</th>
                                <th>מחשבים</th>
                                <th>ייעוץ</th>
                                <th>עריכה לשונית</th>
                                <th>סקרים</th>
                                <th>מיקור חוץ</th>
                                <th>דיווח</th>
                                <th>שונות</th>
                                <th>אסמכתא</th>
                                <th>פירוט</th>


                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q77" id="q77i" placeholder={''}
                                               value={this.state.form.q77 ? (this.state.form.q77) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q7" id="q7i" placeholder={''}
                                               value={this.state.form.q7 ? (this.state.form.q7) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q11" id="q11i" placeholder={''}
                                           value={this.state.form.q11 ? (this.state.form.q11) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q12" id="q12i" placeholder={''}
                                           value={this.state.form.q12 ? (this.state.form.q12) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q13" id="q13i" placeholder={''}
                                           value={this.state.form.q13 ? (this.state.form.q13) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q14" id="q14i" placeholder={''}
                                           value={this.state.form.q14 ? (this.state.form.q14) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q15" id="q15i" placeholder={''}
                                           value={this.state.form.q15 ? (this.state.form.q15) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q16" id="q16i" placeholder={''}
                                           value={this.state.form.q16 ? (this.state.form.q16) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q707" id="q707i" placeholder={''}
                                               value={this.state.form.q707 ? (this.state.form.q707) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q70" id="q70i" placeholder={''}
                                               value={this.state.form.q70 ? (this.state.form.q70) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q110" id="q110i" placeholder={''}
                                           value={this.state.form.q110 ? (this.state.form.q110) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q120" id="q120i" placeholder={''}
                                           value={this.state.form.q120 ? (this.state.form.q120) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q130" id="q130i" placeholder={''}
                                           value={this.state.form.q130 ? (this.state.form.q130) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q140" id="q140i" placeholder={''}
                                           value={this.state.form.q140 ? (this.state.form.q140) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q150" id="q150i" placeholder={''}
                                           value={this.state.form.q150 ? (this.state.form.q150) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q160" id="q160i" placeholder={''}
                                           value={this.state.form.q160 ? (this.state.form.q160) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q170" id="q170i" placeholder={''}
                                           value={this.state.form.q170 ? (this.state.form.q170) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q141" id="q141i" placeholder={''}
                                           value={this.state.form.q141 ? (this.state.form.q141) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q151" id="q151i" placeholder={''}
                                           value={this.state.form.q151 ? (this.state.form.q151) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q161" id="q161i" placeholder={''}
                                           value={this.state.form.q161 ? (this.state.form.q161) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q171" id="q171i" placeholder={''}
                                           value={this.state.form.q171 ? (this.state.form.q171) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                        </table>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q18i"
                                name="q18"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q18}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תנועות"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q19i"
                                name="q19"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q19}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תקציב שנתי"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q20i"
                                name="q20"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q20}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="יתרה נוכחית"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q20i"
                                name="q20"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q20}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="סה'כ יתרה"
                            />
                        </Grid>

                        <br/>

                        <h4>שנה 3:</h4>

                        <table border="3">

                            <tr>
                                <th>תאריך</th>
                                <th>כ"א/משכורת</th>
                                <th>נסיעות</th>
                                <th>ציוד אזיל</th>
                                <th>ציוד</th>
                                <th>מחשבים</th>
                                <th>ייעוץ</th>
                                <th>עריכה לשונית</th>
                                <th>סקרים</th>
                                <th>מיקור חוץ</th>
                                <th>דיווח</th>
                                <th>שונות</th>
                                <th>אסמכתא</th>
                                <th>פירוט</th>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q77" id="q77i" placeholder={''}
                                               value={this.state.form.q77 ? (this.state.form.q77) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q7" id="q7i" placeholder={''}
                                               value={this.state.form.q7 ? (this.state.form.q7) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q11" id="q11i" placeholder={''}
                                           value={this.state.form.q11 ? (this.state.form.q11) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q12" id="q12i" placeholder={''}
                                           value={this.state.form.q12 ? (this.state.form.q12) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q13" id="q13i" placeholder={''}
                                           value={this.state.form.q13 ? (this.state.form.q13) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q14" id="q14i" placeholder={''}
                                           value={this.state.form.q14 ? (this.state.form.q14) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q15" id="q15i" placeholder={''}
                                           value={this.state.form.q15 ? (this.state.form.q15) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q16" id="q16i" placeholder={''}
                                           value={this.state.form.q16 ? (this.state.form.q16) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q707" id="q707i" placeholder={''}
                                               value={this.state.form.q707 ? (this.state.form.q707) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q70" id="q70i" placeholder={''}
                                               value={this.state.form.q70 ? (this.state.form.q70) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q110" id="q110i" placeholder={''}
                                           value={this.state.form.q110 ? (this.state.form.q110) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q120" id="q120i" placeholder={''}
                                           value={this.state.form.q120 ? (this.state.form.q120) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q130" id="q130i" placeholder={''}
                                           value={this.state.form.q130 ? (this.state.form.q130) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q140" id="q140i" placeholder={''}
                                           value={this.state.form.q140 ? (this.state.form.q140) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q150" id="q150i" placeholder={''}
                                           value={this.state.form.q150 ? (this.state.form.q150) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q160" id="q160i" placeholder={''}
                                           value={this.state.form.q160 ? (this.state.form.q160) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q170" id="q170i" placeholder={''}
                                           value={this.state.form.q170 ? (this.state.form.q170) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q141" id="q141i" placeholder={''}
                                           value={this.state.form.q141 ? (this.state.form.q141) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q151" id="q151i" placeholder={''}
                                           value={this.state.form.q151 ? (this.state.form.q151) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q161" id="q161i" placeholder={''}
                                           value={this.state.form.q161 ? (this.state.form.q161) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q171" id="q171i" placeholder={''}
                                           value={this.state.form.q171 ? (this.state.form.q171) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q17" id="q17i" placeholder={''}
                                           value={this.state.form.q17 ? (this.state.form.q17) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                        </table>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q18i"
                                name="q18"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q18}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תנועות"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q19i"
                                name="q19"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q19}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תקציב שנתי"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q20i"
                                name="q20"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q20}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="יתרה נוכחית"
                            />
                        </Grid>

                        <br/>
                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q20i"
                                name="q20"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q20}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="סה'כ יתרה"
                            />
                        </Grid>

                        <br/>

                        <h4>אבני דרך:</h4>

                        <table border="2">

                            <tr>
                                <th>שנה</th>
                                <th>תיאור</th>
                                <th>תאריך</th>
                                <th>.ה. ח</th>
                                <th>סכום כולל תקורה 100%</th>
                                <th>תקורה 15%</th>
                                <th>בכום ללא תקורה 85%</th>
                                <th>סטטוס</th>



                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q77" id="q77i" placeholder={''}
                                               value={this.state.form.q77 ? (this.state.form.q77) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q7" id="q7i" placeholder={''}
                                               value={this.state.form.q7 ? (this.state.form.q7) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q11" id="q11i" placeholder={''}
                                           value={this.state.form.q11 ? (this.state.form.q11) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q12" id="q12i" placeholder={''}
                                           value={this.state.form.q12 ? (this.state.form.q12) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q13" id="q13i" placeholder={''}
                                           value={this.state.form.q13 ? (this.state.form.q13) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q707" id="q707i" placeholder={''}
                                               value={this.state.form.q707 ? (this.state.form.q707) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q70" id="q70i" placeholder={''}
                                               value={this.state.form.q70 ? (this.state.form.q70) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q110" id="q110i" placeholder={''}
                                           value={this.state.form.q110 ? (this.state.form.q110) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q120" id="q120i" placeholder={''}
                                           value={this.state.form.q120 ? (this.state.form.q120) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q130" id="q130i" placeholder={''}
                                           value={this.state.form.q130 ? (this.state.form.q130) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q717" id="q717i" placeholder={''}
                                               value={this.state.form.q717 ? (this.state.form.q717) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>
                            <tr>
                                <td>
                                    <h4>סה'כ:</h4>

                                </td>
                                <td>
                                    <div id="name-group">
                                        <input type="text" name="q71" id="q71i" placeholder={''}
                                               value={this.state.form.q71 ? (this.state.form.q71) : ('')} onChange={(e) => {
                                            this.handleChange(e)
                                        }} required/>
                                    </div>
                                </td>
                                <td>    <div id="name-group">
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
                                <td><div id="name-group">
                                    <input type="text" name="q111" id="q111i" placeholder={''}
                                           value={this.state.form.q111 ? (this.state.form.q111) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q121" id="q121i" placeholder={''}
                                           value={this.state.form.q121 ? (this.state.form.q121) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>
                                <td><div id="name-group">
                                    <input type="text" name="q131" id="q131i" placeholder={''}
                                           value={this.state.form.q131 ? (this.state.form.q131) : ('')} onChange={(e) => {
                                        this.handleChange(e)
                                    }} required/>
                                </div></td>

                            </tr>

                        </table>


                    </div>

                    <button id="sendData" className="btn btn-info" onClick={() => {
                        this.save();
                        this.sendRequest(this.state.form)
                    }}>שמירת שינויים
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
            pathname: `/Manager/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}



export  default  ResearchBudgets;
