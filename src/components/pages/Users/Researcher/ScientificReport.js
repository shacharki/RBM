import React from "react";
import {auth, db, GetFormDownload, getPathData, getUser, signOut} from '../../../../firebase/firebase';
import './Researcher.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import firebase from "firebase";
import {NextPage} from "../UserPage";
import DropzoneFiles from "./DropzoneFiles";
import MyDropzone from "./DropzoneFiles.js";
import AcceptMaxFiles from "./DropzoneFiles.js";
import {Button} from "@material-ui/core";
import {Link} from "react-router-dom";
import Select from "react-select";


const options = [
]
var csvData = [];


class ScientificReport extends React.Component {
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

    loadPage(event){
        this.setState({loading:event})
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
                        //   css={override}
                                size={120}
                                color={"#123abc"}

                        />
                    </div>
                </div>
    }

                    <Grid container spacing={2}>
                        <button id="ReportScientific" className="btn btn-info" onClick={async ()=>{
                            var file = await GetFormDownload()
                            const link = document.createElement('a');
                            link.href = file
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);


                        }}>הורדת טופס דוח מדעי למילוי<span
                            className="fa fa-arrow-right"></span></button>

                        <label id="insert-student" className="title-input" htmlFor="name">:העלאת דוח </label>
                        {/*<label id="date" className="title-input">הכנס את תאריך הדוח:</label>*/}
                        {/*<input type="date" id="insert-date" name="date" onChange={(e) => this.handleChange(e)}*/}
                        {/*       required/>*/}
                        <Grid item xs={5}
                              container
                              direction="column"
                              justify="flex-start"
                              alignItems="flex-start"
                        >
                            <DropzoneFiles/>
                        </Grid>

                        <label id="insert-student" className="title-input" htmlFor="name">:חיפוש דוחות </label>

                        <Grid container spacing={2} >
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


                            <Grid item xs={2} hidden={!this.state.dateTo || !this.state.dateFrom}>
                                <label id="insert-student" className="title-input" htmlFor="name"> &nbsp;</label>
                                <button id="viewReport" className="btn btn-info" onClick={()=>{
                                    this.GetTeams()
                                }}>מצא דוחות<span
                                    className="fa fa-arrow-right"></span></button>
                            </Grid>

                            {/*<Grid item xs={6} hidden={!this.state.options}>*/}
                            {/*    <Select id = 'select'  placeholder={" בחר קבוצה "} options={this.state.options} onChange={(e)=>{*/}
                            {/*        // console.log(e.label,e.value);*/}
                            {/*        this.setState({team:e.value,teamName:e.label})*/}
                            {/*    }} required/>*/}
                            {/*</Grid>*/}
                            {/*<Grid item xs={3} hidden={!this.state.options}>*/}
                            {/*    <label id="insert-student" className="title-input" htmlFor="name"> &nbsp;</label>*/}
                            {/*    {*/}
                            {/*        !this.state.teamName?"לא נבחרה קבוצה": this.state.teamName*/}
                            {/*    }*/}

                            {/*</Grid>*/}
                            {/*<Grid item xs={3}  hidden={!this.state.options}>*/}
                            {/*    <button id="viewReport" className="btn btn-info" onClick={()=>{*/}
                            {/*        this.setState({show:!this.state.show, forms:this.state.team[1].docs, reportGuide:this.state.team[2]})*/}
                            {/*        this.createCsvFile(this.state.team[1].docs, this.state.team[2])*/}
                            {/*    }}>{!this.state.show?("הצג דוחות"):("הסתר דוחות")}<span*/}
                            {/*        className="fa fa-arrow-right"></span></button>*/}
                            {/*</Grid>*/}

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

    async handleChange(event)
    {
        var form=''

        var name = event.target.name;
        var value = event.target.value;
        var e = event.target
        if(name === 'date' && event.target.value!=='' )
        {
            this.loadSpinner(true,"טוען נתונים")

            var formGuide = await db.collection("researcher").doc(auth.currentUser.uid).collection("ScientificReport").doc(event.target.value).get()

            if(formGuide.data() && formGuide.data().locked) {
                alert("הדוח לתאריך קיים נא לבחור תאריך אחר")
                document.getElementById(e.id).value=''
                form = this.state.form;
                // console.log(name);

                form[name] = '';
                this.setState({form:form})

            }
            else if(formGuide.data())
            {
                this.setState({form:formGuide.data().form})

            }
            // else
            // {
            //     var guideData= await db.collection("researcher").doc(auth.currentUser.uid).get()
            //     form ={}
            //     form[name] = value;
            //     form['name']=guideData.data().fname+' '+guideData.data().lname;
            //     form['team']=guideData.data().teamName
            //     this.setState({form:form})
            // }
        }
        else
        {
            form = this.state.form
            form[name] = value;
            this.setState({form:form})
        }
        this.loadSpinner(false)



    }

    async  GetTeams() {
        this.loadSpinner(true,"מיבא נתונים")
        var from = this.GetDates(this.state.dateFrom)
        var to = this.GetDates(this.state.dateTo)

        if(!this.state.dateFrom || !this.state.dateTo )
        {
            alert("נא למלא תאריך התחלה וסיום")
            this.loadSpinner(false,'')
            return
        }

        var options=[]
        this.setState({options:options,show:false})

        var nameTeams = await db.collection("researcher").doc(auth.currentUser.uid).collection("ScientificReport")
            .orderBy('TeamName','asc')
            .get()



        // console.log("in 1")
        var Teamcollection = nameTeams.docs.map( async function(doc) {
            // console.log("in 2")
            var dates = await db.collection("researcher").doc(doc.id).collection("ScientificReport")
                .where('date','>=',from)
                .where('date','<=',to)
                .get()

            if(!dates.empty)
            {
                var forms=[]
                dates.forEach(async function(doc){
                    console.log("doc.data() ",doc.data())
                    console.log("doc.data().reportGuide.path ",doc.data().reportGuide.path)

                    if(doc.data())
                    {
                        var FormsGuide = await getPathData(doc.data().reportGuide.path)
                        forms.push(FormsGuide)
                    }
                })
                return [doc,dates,forms]
            }

        })

        Promise.all(Teamcollection).then(res => {
            res.forEach(item=>{
                // console.log("in 3")
                if(item)
                    options.push({ value: item, label:  item[0].data().name})
            })
            this.setState({options:options})
            // console.log("in 4")
            this.loadSpinner(false,"")
        })

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

    GetDates(date)
    {
        // if(this.state.forms || this.state.show)
        //     return

        date = this.parser(date)
        var parsDate = new Date()
        parsDate.setTime(0)
        parsDate.setFullYear(date["year"],date["month"]-1,date["day"])

        return parsDate;
    }

    createCsvFile(forms,reportGuide)
    {
        csvData = [
            [
                "שם קבוצה",
                "שם המדריך",
                "תאריך המפגש",

            ],
        ];

        reportGuide.map(report=>{
            // console.log(reportGuide)
            csvData.push([
                report.form.team,
                report.form.name,
                report.form.date,


            ],)
            return report
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

export  default  ScientificReport;