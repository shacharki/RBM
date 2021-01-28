import React from "react";
import {auth, db, getUser} from '../../../../firebase/firebase';
import { Radio, RadioGroup} from "@material-ui/core";
import './Researcher.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import TextField from "@material-ui/core/TextField";


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

    async handleChange(event)
    {
        var form=''

        var name = event.target.name;
        var value = event.target.value;
        var e = event.target
        if(name === 'date' && event.target.value!=='' )
        {
            this.loadSpinner(true,"טוען נתוני חוקר")

            var formResearcher = await db.collection("researcher").doc(auth.currentUser.uid).collection("request").doc(event.target.value).get()
            // console.log("formResearcher.data ",formResearcher.data())
            // if(formResearcher.data() && formResearcher.data().locked) {
            //     alert("הבקשה לתאריך הנוכחי נחתם נא לבחור תאריך אחר")
            //     document.getElementById(e.id).value=''
            //     form = this.state.form;
            //     // console.log(name);
            //
            //     form[name] = '';
            //     this.setState({form:form})
            //
            // }
            if(formResearcher.data())
            {
                this.setState({form:formResearcher.data().form})
            }
            else
            {
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
        // console.log("form",form)
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
                date:form.date
            }).then(async ()=>{
                await this.addDataToTeam(researcher,form.date);
                alert("הטופס נשלח בהצלחה ניתן לשנות פרטים עד לחתימת המנהל")
                this.loadSpinner(false)
                window.location.reload(true);

            })

        }catch(error) {
            alert(error.message)
            this.loadSpinner(false)
        }
    }
    async addDataToTeam(researcher,date)
    {

        var formResearcher = (await researcher.collection('request').doc(date).get()).ref;
        try{
            var team = (await researcher.get()).data();
            var name =(team.fname + " "+team.lname);

            var teamCollection = await db.collection("Data").doc(team.team.id)
            // var Collection = await teamCollection.collection("Requests").doc(name)
            var newDate = await teamCollection.collection("Requests").doc(date)
            // var newDate = Collection.collection(date).doc();
            var doc =  await newDate.get()
            var {year,month,day} = this.parser(date)
            var fullDate = new Date()
            fullDate.setTime(0)
            fullDate.setFullYear(year,month-1,day)

            console.log("team.team.id",team.team.id)
            console.log("teamCollection",teamCollection)
            console.log("newDate",newDate)
            console.log("fullDate",fullDate)
            console.log("formResearcher",formResearcher)

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
                console.log("1111")
                console.log("doc.exists",doc.exists)
                console.log("doc",doc)

                newDate.set({
                    date:fullDate,
                    RequestResearcher: formResearcher,
                    nameResearcher: team.fname + " "+team.lname,

                })
            }
            else {
                console.log("2222")
                console.log("doc.exists",doc.exists)
                console.log("doc",doc)

                newDate.update({
                    date:fullDate,
                    RequestResearcher: formResearcher,
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
                                label="מק'ט:"
                            />
                        </Grid>
                        <br/>

                        <div id="name-group">
                            <label id="Q6L" className="title-input">תיאור הפריט:</label>
                            <input type="text" name="q6" id="q6i" placeholder={'התשובה שלך'}
                                   value={this.state.form.q6 ? (this.state.form.q6) : ('')} onChange={(e) => {
                                this.handleChange(e)
                            }} required/>
                        </div>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q7i"
                                name="q7"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q7}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מחיר במט'ח"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q8i"
                                name="q8"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q8}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מחיר בש'ח"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q9i"
                                name="q9"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q9}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מס יחידות"
                            />
                        </Grid>
                        <br/>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q10i"
                                name="q10"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q10}
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

                        <div id="name-group">
                            <label id="Q11L" className="title-input">נא לתאם את קבלת המשלוח עם:</label>
                            <input type="text" name="q11" id="q11i" placeholder={'התשובה שלך'}
                                   value={this.state.form.q11 ? (this.state.form.q11) : ('')} onChange={(e) => {
                                this.handleChange(e)
                            }} required/>
                        </div>

                        <h4>לשימוש משרד המכון בלבד:</h4>

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
                                label="מטרת הרכישה"
                            />
                        </Grid>
                        <br/>

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
                                label="תקציב המחקר"
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
                                label="מס' מחקר"
                            />
                        </Grid>
                        <br/>

                        <div id="name-group">
                            <label id="QL" className="title-input">שם החוקר: {this.state.user.displayName}</label>
                            <br/>
                        </div>

                        <div id="name-group">
                            <label id="Q15L" className="title-input">חתימת החוקר:</label>
                            <input type="text" name="q15" id="q15i" placeholder={'התשובה שלך'}
                                   value={this.state.form.q15 ? (this.state.form.q15) : ('')} onChange={(e) => {
                                this.handleChange(e)
                            }} required/>
                        </div>

                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q16i"
                                name="q16"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q16}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="תאריך החשבונית"
                            />
                        </Grid>
                        <br/>


                        <Grid item xs={6}>
                            <TextField
                                inputProps={{style: {textAlign: 'center'}}}
                                id="q17i"
                                name="q17"
                                type="tel"
                                autoComplete="off"
                                value={this.state.q17}
                                onChange={(e) => {
                                    this.handleChange(e)
                                }}
                                variant="standard"
                                fullWidth
                                label="מס' חשבונית"
                            />
                        </Grid>
                        <br/>

                    </div>

                    <button id="sendData" className="btn btn-info" onClick={() => {
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