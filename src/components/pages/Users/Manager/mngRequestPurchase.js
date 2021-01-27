import  React, {Component} from "react";
import Grid from "@material-ui/core/Grid";
import Select from "react-select";
import {auth, db, getPathData, getUser} from "../../../../firebase/firebase";
import ClipLoader from "react-spinners/ClipLoader";
import { CSVLink } from "react-csv";



var csvData = [];


class mngRequestPurchase extends Component {

    constructor(props) {
        super(props);
        this.state =
            {
                isLoaded:false,
                show:false,
                loadPage:false,
                spinner: [true,'נא להמתין הדף נטען'],
            }
    }




    async  GetData() {
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
        var nameData = await db.collection("Data")
            .orderBy('name','asc')
            .get()



        // console.log("in 1")
        var Teamcollection = nameData.docs.map( async function(doc) {
            // console.log("in 2")
            var Requests = await db.collection("Data").doc(doc.id).collection("Requests")
                .where('date','>=',from)
                .where('date','<=',to)
                .get()

            if(!Requests.empty)
            {
                var forms=[]
                Requests.forEach(async function(doc){
                    if(doc.data().RequestResearcher)
                    {
                        var FormsResearcher = await getPathData(doc.data().RequestResearcher.path)
                        forms.push(FormsResearcher)
                    }
                })
                return [doc,Requests,forms]
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


    createCsvFile(forms,RequestResearcher)
    {
        csvData = [
            [
                "",
                "שם החוקר",
                "תאריך הבקשה",
                "שם הספק",
                "נייד",
                "טופס הזמנה מס'",
                "מצורפת הצעת מחיר מס'",
                "מק'ט",
                "תיאור הפריט",
                "מחיר במט'ח",
                "מחיר בש'ח",
                "מס' יחידות",
                "סה'כ כולל מע'מ",
                "נא לתאם קבלת משלוח עם",
                "מטרת הרכישה",
                "תקציב המחקר",
                "מס' המחקר",
                "חתימת החוקר",
                "תאריך החשבונית",
                "מס' חשבונית",
            ],
        ];

        RequestResearcher.map(report=>{
            // console.log(RequestResearcher)
            csvData.push([
                report.form.team,
                report.form.name,
                report.form.date,
                report.form.q1,
                report.form.q2,
                report.form.q3,
                report.form.q4,
                report.form.q5,
                report.form.q6,
                report.form.q7,
                report.form.q8,
                report.form.q9,
                report.form.q10,
                report.form.q11,
                report.form.q12,
                report.form.q13,
                report.form.q14,
                report.form.q15,
                report.form.q16,
                report.form.q17,




            ],)
            return report
        })

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


    loadSpinner(event,massage){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }

    render() {
        if(this.state.loadPage){
            return(
                <div>
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
                    <div id="studentFeedback" className="feedback-design" dir='rtl'>
                        <div id="studentFeedback" className="form-design" name="student_form" method="POST">
                            <div id="name-group" className="form-group">

                                <Grid container spacing={2}>
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
                                            this.GetData()
                                        }}>מצא בקשות<span
                                            className="fa fa-arrow-right"></span></button>
                                    </Grid>

                                    <Grid item xs={6} hidden={!this.state.options}>
                                        <Select id = 'select'  placeholder={" בחר קטגוריה "} options={this.state.options} onChange={(e)=>{
                                            // console.log(e.label,e.value);
                                            this.setState({team:e.value,teamName:e.label})
                                        }} required/>
                                    </Grid>
                                    <Grid item xs={3} hidden={!this.state.options}>
                                        <label id="insert-student" className="title-input" htmlFor="name"> &nbsp;</label>
                                        {
                                            !this.state.teamName?"לא נבחרה קטגוריה": this.state.teamName
                                        }

                                    </Grid>
                                    <Grid item xs={3}  hidden={!this.state.teamName}>
                                        <button id="viewReport" className="btn btn-info" onClick={()=>{
                                            this.setState({show:!this.state.show, forms:this.state.team[1].docs, RequestResearcher:this.state.team[2]})
                                            this.createCsvFile(this.state.team[1].docs, this.state.team[2])
                                        }}>{!this.state.show?("הצג בקשות לרכישה"):("הסתר בקשות לרכישה")}<span
                                            className="fa fa-arrow-right"></span></button>
                                    </Grid>

                                </Grid>
                            </div>
                            {this.state.forms?(
                                <Grid  item xs={12} hidden={!this.state.show} >

                                    <CSVLink
                                        data={csvData}
                                        filename={this.state.dateFrom+"-"+this.state.dateTo+"בקשות לרכישה.csv"}
                                        className="btn btn-primary"
                                        target="_blank"
                                    >
                                        <button>
                                            הורדת כל הבקשות לרכישה בתאריכים הנבחרים
                                        </button>
                                    </CSVLink>
                                    {
                                        this.state.forms.map((Form,index) => (
                                            <Grid  item xs={12}  key={index}>
                                                <hr/>
                                                {this.Requests(Form.data(),index)}
                                            </Grid >
                                        ))
                                    }
                                </Grid >
                            ):(<div></div>)}
                            <button id="go-back" className="btn btn-info" onClick={()=>{this.BackPage()}}>חזור</button>
                        </div>
                    </div>
                </div>
            )
        } else {
            // console.log(this.state.spinner)
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

    Requests(form,index)
    {
        // console.log(csvData)
        //  console.log("this.state",this.state)
        // console.log("this.state.RequestResearcher",this.state.RequestResearcher)

        if(index>=this.state.RequestResearcher.length)
        {
            return
        }
        // console.log(this.state.show)
        if(form && this.state.show) {
            // console.log(form)
            var requests = this.state.RequestResearcher[index].form
            var date =form.date.toDate()
            var day = date.getDate()
            var month = date.getMonth()+1
            var year = date.getFullYear()
            // console.log(RequestResearcher)
            return (
                <div id="name-group" className="form-group" dir="rtl">
                    <div className="report" id="report">
                        <div>
                            <div dir="rtl">
                                <h4> שם החוקר: {form.nameGuide}</h4>
                                <h4> תאריך הבקשה: {day+'/'+month+"/"+year}</h4>
                                <h4> שם הספק: {requests.q1}</h4>
                                <div id="name-group">
                                    <h4>  <label id="Q2L" className="title-input"> נייד: {requests.q2?(requests.q2):('לא נכתבה תשובה לשאלה זו')}</label>
                                    </h4>
                                </div>
                                <div id="name-group" >
                                    <h4><label id="Q3L" className="title-input"> טופס הזמנה מס': {requests.q3?(requests.q3):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q4L" className="title-input">מצורפת הצעת מחיר מס': {requests.q4?(requests.q4):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q5L" className="title-input">מק"ט: {requests.q5?(requests.q5):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q6L" className="title-input">תיאור הפריט:</label></h4>
                                    {requests.q6?(requests.q6):('לא נכתבה תשובה לשאלה זו')}
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q7L" className="title-input" htmlFor="name">מחיר במט"ח: {requests.q7?(requests.q7):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q8L" className="title-input" htmlFor="name">מחיר בש"ח: {requests.q8?(requests.q8):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="insert-name" className="title-input" htmlFor="name">מס' יחידות: {requests.q9?(requests.q9):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q10L" className="title-input" htmlFor="name">סה"כ כולל מע"מ: {requests.q10?(requests.q10):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q11L" className="title-input" htmlFor="name">נא לתאם קבלת משלוח עם: {requests.q11?(requests.q11):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q12L" className="title-input" htmlFor="name">מטרת הרכישה:</label></h4>
                                    {requests.q12?(requests.q12):('לא נכתבה תשובה לשאלה זו')}
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q13L" className="title-input" htmlFor="name">תקציב המחקר: {requests.q13?(requests.q13):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q14L" className="title-input" htmlFor="name">מס' המחקר: {requests.q14?(requests.q14):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q15L" className="title-input" htmlFor="name">חתימת החוקר: {requests.q15?(requests.q15):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q16L" className="title-input" htmlFor="name">תאריך החשבונית: {requests.q16?(requests.q16):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q17L" className="title-input" htmlFor="name">מס' חשבונית: {requests.q17?(requests.q17):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else
            return (<div></div>)
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

        // var toDate = this.parser(to)
        // to = new Date()
        // to.setFullYear(toDate["year"],toDate["month"]-1,toDate["day"]+1)
        // if(fromDate["year"]>toDate["year"]){
        //     alert("התאריך מ גדול מהתאירך עד")
        //     return
        // }
        // if(fromDate["year"]===toDate["year"] && fromDate["month"]>toDate["month"]){
        //     alert("התאריך מ גדול מהתאירך עד")
        //     return
        // }
        // if(fromDate["year"]===toDate["year"] && fromDate["month"]===toDate["month"] && fromDate["day"]>toDate["day"]){
        //     alert("התאריך מ גדול מהתאירך עד")
        //     return
        // }

    }

    loadUser(page)
    {
        this.props.history.push({
            // pathname: `/${page}/${this.state.user.id}`,
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

    notfound()
    {
        this.props.history.push({
            pathname: `/404`,
            data: this.state.user // your data array of objects
        })
    }
}



export default mngRequestPurchase;
