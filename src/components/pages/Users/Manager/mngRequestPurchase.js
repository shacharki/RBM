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


    async Word( element ) {

        var html, link, blob, url, css;

        css = (
            '<style>' +
            '@page WordSection1{size: 841.95pt 595.35pt;mso-page-orientation: landscape;}' +
            'div.WordSection1 {page: WordSection1;}' +
            '</style>'
        );

        html = element.innerHTML;
        blob = new Blob(['\ufeff', css + html], {
            type: 'application/msword'
        });
        url = URL.createObjectURL(blob);
        link = document.createElement('A');
        link.href = url;
        link.download = 'Document';  // default name without extension
        document.body.appendChild(link);
        if (navigator.msSaveOrOpenBlob ) navigator.msSaveOrOpenBlob( blob, 'Document.doc'); // IE10-11
        else link.click();  // other browsers
        document.body.removeChild(link);
    };

    createCsvFile(forms,RequestResearcher)
    {
        // var url,link
        //
        // blob= new Blob([layout/images/imagg.jpg], {
        //     type: 'application/msword'
        // });
        // url = URL.createObjectURL(blob);
        // link.href = url;
        csvData = [
            [
                "",
                "תאריך הבקשה",
                "שם הספק",
                "נייד",
                "טופס הזמנה מס'",
                "מצורפת הצעת מחיר מס'",
                "מק'ט",
                "תיאור הפריט",
                "מחיר במט'ח",
                "מחיר יח בש'ח",
                "מס' יחידות",
                "מחיר בש'ח",
                "סה'כ כולל מע'מ",
                "נא לתאם קבלת משלוח עם",
                "מטרת הרכישה",
                "תקציב המחקר",
                "מס' המחקר",
                "שם החוקר",
                "חתימת החוקר",
                "תאריך החשבונית",
                "מס' חשבונית",
            ],
        ];

        RequestResearcher.map(report=>{
            // console.log(RequestResearcher)
            csvData.push([
                // report.form.team,
                // report.form.name,
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
                report.form.q50,
                report.form.q60,
                report.form.q70,
                report.form.q80,
                report.form.q90,
                report.form.q100,
                report.form.q51,
                report.form.q61,
                report.form.q71,
                report.form.q81,
                report.form.q91,
                report.form.q101,
                report.form.q11,
                report.form.q12,
                report.form.q13,
                report.form.q14,
                report.form.q15,
                report.form.q16,
                report.form.q17,
                report.form.q18,



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
                                        <Select id = 'select'  placeholder={" בחר חוקר "} options={this.state.options} onChange={(e)=>{
                                            // console.log(e.label,e.value);
                                            this.setState({team:e.value,teamName:e.label})
                                        }} required/>
                                    </Grid>
                                    <Grid item xs={3} hidden={!this.state.options}>
                                        <label id="insert-student" className="title-input" htmlFor="name"> &nbsp;</label>
                                        {
                                            !this.state.teamName?"לא נבחר חוקר": this.state.teamName
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
                                // <Grid  item xs={12} hidden={!this.state.show} >
                                //
                                //     <CSVLink
                                //         data={csvData}
                                //         filename={this.state.dateFrom+"-"+this.state.dateTo+"בקשות לרכישה.csv"}
                                //         className="btn btn-primary"
                                //         target="_blank"
                                //     >
                                //         <button>
                                //             הורדת כל הבקשות לרכישה בתאריכים הנבחרים
                                //         </button>
                                //     </CSVLink>
                                //     {
                                //         this.state.forms.map((Form,index) => (
                                //             <Grid  item xs={12}  key={index}>
                                //                 <hr/>
                                //                 {this.Requests(Form.data(),index)}
                                //             </Grid >
                                //         ))
                                //     }
                                // </Grid >
                                <Grid  item xs={12} hidden={!this.state.show} >

                                    <CSVLink
                                        data={csvData}
                                        filename={this.state.dateFrom+"-"+this.state.dateTo+"בקשות לרכישה.csv"}
                                        className="btn btn-primary"
                                        target="_blank"
                                    >
                                        <button>
                                              הורדת הבקשות בתאריכים שנבחרו לאקסל
                                        </button>
                                    </CSVLink>
                                    {
                                        this.state.forms.map((Form,index) => (
                                            <Grid  item xs={12}  key={index}>
                                                <hr/>
                                                {this.Requests(Form.data(),index)}
                                                <CSVLink

                                                    data={csvData}
                                                    filename={this.state.dateFrom+"-"+this.state.dateTo+"בקשה לרכישה.doc"}
                                                    className="btn btn-primary"
                                                    target="_blank"
                                                >
                                                    <button>
                                                        הורדת הבקשה לוורד
                                                    </button>
                                                </CSVLink>
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
                                <h4> שם החוקר: {form.nameResearcher}</h4>
                                <h4> תאריך הבקשה: {day+'/'+month+"/"+year}</h4>
                                <h4><label id="Q1L" className="title-input"> שם הספק: {requests.q1?(requests.q1):('לא נכתבה תשובה לשאלה זו')}</label></h4>
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
                                        <td><div id="name-group" >
                                            <h4> <label id="Q5L" className="title-input" htmlFor="name">{requests.q5?(requests.q5):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q6L" className="title-input" htmlFor="name">{requests.q6?(requests.q6):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q7L" className="title-input" htmlFor="name">{requests.q7?(requests.q7):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q8L" className="title-input" htmlFor="name"> {requests.q8?(requests.q8):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="insert-name" className="title-input" htmlFor="name"> {requests.q9?(requests.q9):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="insert-name" className="title-input" htmlFor="name"> {requests.q10?(requests.q10):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                    </tr>

                                    <tr>
                                        <td><div id="name-group" >
                                            <h4> <label id="Q50L" className="title-input" htmlFor="name">{requests.q50?(requests.q50):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q60L" className="title-input" htmlFor="name">{requests.q60?(requests.q60):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q70L" className="title-input" htmlFor="name">{requests.q70?(requests.q70):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q80L" className="title-input" htmlFor="name"> {requests.q80?(requests.q80):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q90L" className="title-input" htmlFor="name"> {requests.q90?(requests.q90):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q100L" className="title-input" htmlFor="name"> {requests.q100?(requests.q100):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                    </tr>

                                    <tr>
                                        <td><div id="name-group" >
                                            <h4> <label id="Q51L" className="title-input" htmlFor="name">{requests.q51?(requests.q51):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q61L" className="title-input" htmlFor="name">{requests.q61?(requests.q61):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q71L" className="title-input" htmlFor="name">{requests.q71?(requests.q71):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q81L" className="title-input" htmlFor="name"> {requests.q81?(requests.q81):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q91L" className="title-input" htmlFor="name"> {requests.q91?(requests.q91):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q101L" className="title-input" htmlFor="name"> {requests.q101?(requests.q101):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                        </div></td>

                                    </tr>
                                </table>

                                <div id="name-group" >
                                    <h4> <label id="Q11L" className="title-input" htmlFor="name">סה"כ כולל מע"מ: {requests.q11?(requests.q11):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q12L" className="title-input" htmlFor="name">נא לתאם קבלת משלוח עם: {requests.q12?(requests.q12):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q13L" className="title-input" htmlFor="name">מטרת הרכישה:</label></h4>{requests.q13?(requests.q13):('לא נכתבה תשובה לשאלה זו')}
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q14L" className="title-input" htmlFor="name">תקציב המחקר: {requests.q14?(requests.q14):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q15L" className="title-input" htmlFor="name">מס' המחקר: {requests.q15?(requests.q15):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q16L" className="title-input" htmlFor="name">חתימת החוקר: {requests.q16?(requests.q16):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q17L" className="title-input" htmlFor="name">תאריך החשבונית: {requests.q17?(requests.q17):('לא נכתבה תשובה לשאלה זו')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q18L" className="title-input" htmlFor="name">מס' חשבונית: {requests.q18?(requests.q18):('לא נכתבה תשובה לשאלה זו')}</label></h4>
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
