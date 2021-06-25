import  React, {Component} from "react";
import Grid from "@material-ui/core/Grid";
import Select from "react-select";
import {auth, db, getPathData, getUser} from "../../../../firebase/firebase";
import ClipLoader from "react-spinners/ClipLoader";
import { CSVLink } from "react-csv";
import {Button} from "@material-ui/core";
import 'classlist.js';
import TextField from "@material-ui/core/TextField";
import  { useRef } from 'react';
import { useReactToPrint} from 'react-to-print';
import { render } from "react-dom";
import ReactToPrint from 'react-to-print';

var sum =0
var csvData = [];
var csvTableData = [];

class mngRequestPurchase extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadPage:false,
            spinner: [true,'נא להמתין הדף נטען'],
            page:'menu',
            user: props.location,
            error:false,
            showreport:false,
            loading: true,
            rule:"Manager",
            prevDate:'',
            reports: [],
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
        this.approvResearcher = this.approvResearcher.bind(this)
        this.RequestPurchase = this.RequestPurchase.bind(this)
    }


    // async  GetAllData() {
    //     this.loadSpinner(true,"מיבא נתונים")
    //     var from = this.GetDates(this.state.dateFrom)
    //     var to = this.GetDates(this.state.dateTo)
    //
    //
    //     if(!this.state.dateFrom || !this.state.dateTo )
    //     {
    //         alert("נא למלא תאריך התחלה וסיום")
    //         this.loadSpinner(false,'')
    //         return
    //     }
    //
    //     var optionsAll=[]
    //
    //     var allData = await db.collection("Data")
    //         .orderBy('date').get()
    //
    //     var TeamcollectionAll = allData.docs.map( async function(doc) {
    //         // console.log("in 2")
    //         var RequestsAll = await db.collection("Data").doc().collection("Requests")
    //             .where('date','>=',from)
    //             .where('date','<=',to)
    //             .get()
    //
    //         if(!RequestsAll.empty)
    //         {
    //             var formsAll=[]
    //             RequestsAll.forEach(async function(doc){
    //                 if(doc.data().RequestResearcher)
    //                 {
    //                     var FormsResearcherAll = await getPathData(doc.data().RequestResearcher.path)
    //                     formsAll.push(FormsResearcherAll)
    //                 }
    //             })
    //             return [doc,RequestsAll,formsAll]
    //         }
    //
    //     })
    //     Promise.all(TeamcollectionAll).then(res => {
    //         res.forEach(item=>{
    //             // console.log("in 3")
    //             if(item)
    //                 optionsAll.push({ value: item, label:  item[0].data(), name: 'הצג הכל'})
    //         })
    //         this.setState({optionsAll:optionsAll})
    //         // console.log("in 4")
    //         this.loadSpinner(false,"")
    //     })
    // }

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
        // var allData = await db.collection("Data")
        //     .orderBy('date').get()
        //
        // console.log("allData",allData)

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
        alert("test")
    };

    createTableFile(forms,RequestResearcher)
    {
        RequestResearcher.map(report=>{
            // console.log(RequestResearcher)
            csvTableData.push([
                "מק'ט: ",
                report.form.q5,
                report.form.q50,
                report.form.q51,

                "תיאור הפריט: ",
                report.form.q6,
                report.form.q60,
                report.form.q61,

                "מחיר במט'ח: ",
                report.form.q7,
                report.form.q70,
                report.form.q71,

                "מחיר יח בש'ח: ",
                report.form.q8,
                report.form.q80,
                report.form.q81,

                "מס' יחידות: ",
                report.form.q9,
                report.form.q90,
                report.form.q91,

                "מחיר בש'ח: ",
                report.form.q10,
                report.form.q100,
                report.form.q101,
            ],)


        const data = [
            {id: this.report.form.q5, id1: 'Gob', id2: '2', id3: '', id4: '', id5:''},
            {id: this.report.form.q50, id1: 'Gob', id2: '2', id3: '', id4: '', id5:''},
            {id: this.report.form.q1, id1: 'Gob', id2: '2', id3: '', id4: '', id5:''},
        ];
        const columns = [{
            dataField: 'id',
            text: 'מק"ט'
        }, {
            dataField: 'id1',
            text: 'תיאור הפריט'
        }, {
            dataField: 'id2',
            text: 'מחיר במט"ח'
        },{
            dataField: 'id3',
            text: 'מחיר יח בש"ח'
        },{
            dataField: 'id4',
            text: 'מס יחידות'
        },{
            dataField: 'id5',
            text: 'מחיר בש"ח'
        },];
        return report;
        })
    }

    createCsvFile(forms,RequestResearcher)
    {
        var q5,q50,q51,q6,q60,q61,q7,q70,q71,q8,q80,q81,q9,q90,q91,q10,q100,q101
        // var url,link
        //
        // blob= new Blob([layout/images/imagg.jpg], {
        //     type: 'application/msword'
        // });
        // url = URL.createObjectURL(blob);
        // link.href = url;
        csvData = [
            [

                // "תאריך הבקשה: ",
                // "שם הספק: ",
                // "נייד: ",
                // "טופס הזמנה מס': ",
                // "מצורפת הצעת מחיר מס': ",
                // "מק'ט: ",
                // "תיאור הפריט: ",
                // "מחיר במט'ח: ",
                // "מחיר יח בש'ח: ",
                // "מס' יחידות: ",
                // "מחיר בש'ח: ",
                // "סה'כ כולל מע'מ: ",
                // "נא לתאם קבלת משלוח עם: ",
                // "מטרת הרכישה: ",
                // "תקציב המחקר: ",
                // "מס' המחקר: ",
                // "שם החוקר: ",
                // "חתימת החוקר: ",
                // "תאריך החשבונית: ",
                // "מס' חשבונית: ",
            ],
        ];

        RequestResearcher.map(report=>{
             console.log("report.form.signature",report.form.signature)

            csvData.push([
                // report.form.team,
                // report.form.name,
                "תאריך הבקשה: ",
                report.form.date,
                "",
                "שם הספק: ",
                report.form.q1,
                "נייד: ",
                report.form.q2,
                "טופס הזמנה מס': ",
                report.form.q3,
                "מצורפת הצעת מחיר מס': ",
                report.form.q4,

                "מק'ט: ",
                q5=report.form.q5,
                q50=report.form.q50,
                q51=report.form.q51,

                "תיאור הפריט: ",
                report.form.q6,
                report.form.q60,
                report.form.q61,

                "מחיר במט'ח: ",
                report.form.q7,
                report.form.q70,
                report.form.q71,

                "מחיר יח בש'ח: ",
                report.form.q8,
                report.form.q80,
                report.form.q81,

                "מס' יחידות: ",
                report.form.q9,
                report.form.q90,
                report.form.q91,

                "מחיר בש'ח: ",
                report.form.q10,
                report.form.q100,
                report.form.q101,
                "נא לתאם קבלת משלוח עם: ",
                report.form.q11,
                "מטרת הרכישה: ",
                report.form.q12,
                "תקציב המחקר: ",
                report.form.q13,
                "מס' המחקר: ",
                report.form.q14,
                "שם החוקר: ",
                report.form.q15,
                "חתימת החוקר: ",
                report.form.signature,
                // report.form.q16,
                "תאריך החשבונית: ",
                report.form.q17,
                "מס' חשבונית: ",
                report.form.q18,
                "נספחים: ",
                // report.form.RequestPurchase.link,



            ],)
            const data = [
                {id: q5, id1: 'Gob', id2: '2', id3: '', id4: '', id5:''},
                {id: q50, id1: 'Gob', id2: '2', id3: '', id4: '', id5:''},
                {id: q51, id1: 'Gob', id2: '2', id3: '', id4: '', id5:''},
            ];
            const columns = [{
                dataField: 'id',
                text: 'מק"ט'
            }, {
                dataField: 'id1',
                text: 'תיאור הפריט'
            }, {
                dataField: 'id2',
                text: 'מחיר במט"ח'
            },{
                dataField: 'id3',
                text: 'מחיר יח בש"ח'
            },{
                dataField: 'id4',
                text: 'מס יחידות'
            },{
                dataField: 'id5',
                text: 'מחיר בש"ח'
            },];
            return report
        })

    }

    async componentDidMount() {
        var href =  window.location.href.split("/",5)

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
    // async  GetReport() {
    //     //this.loadSpinner(true,"מיבא נתונים")
    //     let from = this.GetDates(this.state.dateFrom)
    //     let to = this.GetDates(this.state.dateTo)
    //
    //
    //     if(!this.state.dateFrom || !this.state.dateTo )
    //     {
    //         alert("נא למלא תאריך התחלה וסיום")
    //         this.loadSpinner(false,'')
    //         return
    //     }
    //     console.log("2 ")
    //
    //     let options=[]
    //     this.setState({options ,show:false})
    //     let managerReports = await db.collection("researcher").doc(this.state.teamName).collection("RequestPurchase")
    //         .where("date", "<=", to.toISOString().split('T')[0])
    //         .where("date", ">=", from.toISOString().split('T')[0])
    //         .get();
    //     const reportDocs = await Promise.all(managerReports.docs.map(doc => doc.data()));
    //     this.setState({reports: reportDocs})
    // }
    async  GetReport(form,index) {
        //this.loadSpinner(true,"מיבא נתונים")
        var requests = this.state.RequestResearcher[index].form
        var date1 =form.date.toDate()

        let from = this.GetDates(this.state.dateFrom)
        let to = this.GetDates(this.state.dateTo)
        var user = form.uid
         console.log("date1",date1)
        console.log("from",from)
        console.log("to",to)

        if(!this.state.dateFrom || !this.state.dateTo )
        {
            alert("נא למלא תאריך התחלה וסיום")
            this.loadSpinner(false,'')
            return
        }
        console.log("2 ")

        let options=[]
        this.setState({options ,show:false})

        let managerReports = await db.collection("researcher").doc(user).collection("RequestPurchase")
            .where("date", "===", date1.toISOString().split('T')[0])
            .get();
        const reportDocs = await Promise.all(managerReports.docs.map(doc => doc.data()));
        this.setState({reports: reportDocs})
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
                                </Grid>



                                <Grid container spacing={2}>

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
                                            <Grid item xs={12} key={index}>
                                                <hr/>

                                                {this.Requests(Form.data(),index)}
                                                <div>
                                                    <Button
                                                        type="submit"
                                                        fullWidth
                                                        variant="contained"

                                                        onClick={() => {
                                                            // console.log("this.Requests(Form.data(),index)",this.Requests(Form.data(),index))
                                                            // console.log("Form.data()",Form.data())
                                                            // console.log("index",index)
                                                            this.generate(Form.data(),index)

                                                        }}>
                                                        הורדת הבקשה
                                                    </Button>
                                                </div>
                                                <Grid item xs={5} hidden={!this.state.teamName}>
                                                    <label id="insert-student" className="btn btn-info" htmlFor="name"> &nbsp;</label>
                                                    <button id="viewReport" className="btn btn-info" onClick={() => this.GetReport(Form.data(),index)}>הצג נספחים<span
                                                        className="fa fa-arrow-right"></span></button>
                                                </Grid>
                                                <Grid item xs={12} hidden={this.state.reports.length < 1}>
                                                    <hr/>
                                                    {
                                                        this.state.reports.map(report => (
                                                            <a href={report.link}>{report.date+" " +report.nameR}<hr/></a>
                                                        ))
                                                    }
                                                </Grid>
                                            </Grid>



                                            // <Grid  item xs={12}  key={index}>
                                            //     <hr/>
                                            //     {this.Requests(Form.data(),index)}
                                            //     <CSVLink
                                            //
                                            //         data={csvData}
                                            //         filename={this.state.dateFrom+"-"+this.state.dateTo+"בקשה לרכישה.doc"}
                                            //         className="btn btn-primary"
                                            //         target="_blank"
                                            //     >
                                            //         <button>
                                            //             הורדת הבקשה לוורד
                                            //         </button>
                                            //     </CSVLink>
                                            // </Grid >

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
                                            size={120}
                                            color={"#123abc"}

                                />
                            </div>
                        </div>
                    }
                </div>)
        }
    }



    //
    // generate(from,index) {
    //     const doc = new docx.Document();
    //     const path = require('path');
    //     const fs = require('fs')
    //     const { promisify } = require('util');
    //     const data1={csvData}
    //     const data2 = this.Requests(from,index)
    //     const request = require('request@2.88.0');
    //    const express = require("@runkit/runkit/express-endpoint/1.0.0");
    //     const app = express(exports);
    //     const docx = require('docx@5.5.0');
    //
    //     const {
    //         Document,
    //         HorizontalPositionAlign,
    //         HorizontalPositionRelativeFrom,
    //         Media,
    //         Packer,
    //         Paragraph,
    //         VerticalPositionAlign,
    //         VerticalPositionRelativeFrom,
    //
    //         } = docx;
    //
    //     // const filePath = '../../../layout/images/logoUp.jpg';
    //     console.log("from",from)
    //     console.log("index",index)
    //     console.log("data1",data1)
    //     console.log("data2",data2)
    //     const download = (uri, filename, callback) => {
    //         request.head(uri, (err, res, body) => {
    //             request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    //         });
    //     };
    //
    //     const URLUp = 'https://drive.google.com/file/d/1CUIqx9uc4pHVxgnQAEQzybUTsXqhFd02/view?usp=sharing';
    //     const URLDown = 'https://drive.google.com/file/d/1iYQz7WDl0CkRMhSylwr3eVJTebIaXx0g/view?usp=sharing';
    //     const URL = 'https://raw.githubusercontent.com/dolanmiu/docx/ccd655ef8be3828f2c4b1feb3517a905f98409d9/demo/images/cat.jpg';
    //     app.get("/", (req, res) => {
    //         download(URL, 'cat.jpg', async () => {
    //             const doc = new Document();
    //
    //             const image1 = Media.addImage(doc, fs.readFileSync("./cat.jpg"));
    //             const image6 = Media.addImage(doc, fs.readFileSync("./cat.jpg"), 200, 200, {
    //                 floating: {
    //                     horizontalPosition: {
    //                         offset: 1014400,
    //                     },
    //                     verticalPosition: {
    //                         offset: 1014400,
    //                     },
    //                 },
    //             });
    //
    //             const image7 = Media.addImage(doc, fs.readFileSync("./cat.jpg"), 200, 200, {
    //                 floating: {
    //                     horizontalPosition: {
    //                         relative: HorizontalPositionRelativeFrom.PAGE,
    //                         align: HorizontalPositionAlign.RIGHT,
    //                     },
    //                     verticalPosition: {
    //                         relative: VerticalPositionRelativeFrom.PAGE,
    //                         align: VerticalPositionAlign.BOTTOM,
    //                     },
    //                 },
    //             });
    //
    //             doc.addSection({
    //                 children: [
    //                     new Paragraph("Hello World"),
    //                     new Paragraph(image1),
    //                     new Paragraph(image6),
    //                     new Paragraph(image7),
    //                 ],
    //             });
    //
    //             const b64string = await Packer.toBase64String(doc);
    //
    //             res.setHeader('Content-Disposition', 'attachment; filename=My Document.docx');
    //             res.send(Buffer.from(b64string, 'base64'));
    //         });
    //     })
    //
    //     try {
    //         const data = fs.readFileSync('../../../layout/images/logoUp.jpg', 'utf8')
    //         console.log("data",data)
    //     } catch (err) {
    //         console.error(err)
    //         console.log("err")
    //
    //     }
    //     var img = "../../../layout/images/logoUp.jpg"
    //
    //     doc.addSection({
    //         properties: {},
    //         headers: {
    //             default: new Header({
    //                 // children: [new Paragraph("Header text")],
    //                 children: [ new Paragraph(img),
    //                     new Paragraph(data1),
    //                     new Paragraph(data2)],
    //
    //             }),
    //         },
    //
    //         children: [
    //             new Paragraph({
    //                 children: [
    //                     new docx.TextRun("Hello World"),
    //                     new docx.TextRun({
    //                         text: "Foo Bar",
    //                         bold: true,
    //                     }),
    //
    //                 ],
    //
    //             }),
    //             new Paragraph({
    //                 children: [
    //                     new docx.TextRun({
    //                         text: "\tGithub is the best",
    //                         bold: true,
    //                     }),
    //
    //                 ],
    //
    //             }),
    //
    //         ],
    //         footers: {
    //             default: new Footer({
    //                 children: [new Paragraph("Footer text")],
    //             }),
    //         },
    //     });
    //
    //     docx.Packer.toBlob(doc).then(blob => {
    //         console.log(blob);
    //         saveAs(blob, "בקשה לרכישה.doc");
    //         console.log("Document created successfully");
    //
    //
    //     });
    // }
    generate(from,index){
        console.log("from",from)
        console.log("index",index)
        const data2 = this.Requests(from,index)
        console.log("data2",data2)

        class ComponentToPrint extends React.Component {
            render() {
                return (
                    <div style={{textAligh:'center'}}><br/>
                        <img  width="100%" src="http://www.up2me.co.il/imgs/25602256.jpg"/>
                        {/*<img width="100%"  src="http://www.up2me.co.il/imgs/22195825.jpg" />*/}


                    {/*// <div>*/}
                    {/*//     <div>*/}
                    {/*//         <img width="100%" src="http://www.up2me.co.il/imgs/22195825.jpg"/>*/}
                    {/*//     </div>*/}
                    {/*//*/}
                    {/*    <div style={{fontSize: "25px", 'position': 'fixed',*/}
                    {/*        'top': '50%',*/}
                    {/*        'left': '70%',*/}
                    {/*        'transform': 'translate(-50%, -50%)'}} content={() => this.Requests(from,index)}>*/}
                    {/*            {csvData}*/}
                    {/*    </div>*/}

                         <div style={{fontSize: "25px", 'position': 'absolute',
                            'top': '50%',
                             'left': '70%',
                             'transform': 'translate(-50%, -50%)'}} content={() => this.Requests(from,index)}>
                                 <p className="Table-header">{csvTableData}</p>
                         </div>
                         <img  width="100%" src="http://www.up2me.co.il/imgs/25602256.jpg"/>
                     </div>

                );
            }
        }
        const Example = () => {
            const componentRef = useRef();
            const handlePrint = useReactToPrint({
                content: () => componentRef.current,
            });

            return (
                <div>
                    <ComponentToPrint  ref={componentRef} />
                    <div style={{textAlign:'center'}}>
                        <button onClick={handlePrint}>הורדה</button>

                    </div>
                <div>
                    <button id="go-back" className="btn btn-info" onClick={()=>{this.BackPage()}}>חזור</button>

                </div>
                </div>

            );
        };
        render(<Example />, document.querySelector("#root"));

    }


    Requests(form,index)
    {
        var user = form.uid
        // console.log("form",form)
        //

        if(index>=this.state.RequestResearcher.length)
        {
            return
        }
        if(form && this.state.show) {
            var requests = this.state.RequestResearcher[index].form
            var date =form.date.toDate()
            var day = date.getDate()
            var month = date.getMonth()+1
            var year = date.getFullYear()
            if (day<10)
                day='0'+day
            if (month<10)
                month='0'+month

            console.log("date",date)

            return (
                <div id="name-group" className="form-group" dir="rtl">
                    <div className="report" id="report">
                        <div>
                            <div dir="rtl">
                                <h4> שם החוקר: {form.nameResearcher}</h4>
                                <h4> תאריך הבקשה: {day+'/'+month+"/"+year}</h4>
                                <h4><label id="Q1L" className="title-input"> שם הספק: {requests.q1?(requests.q1):('')}</label></h4>
                                <div id="name-group">
                                    <h4>  <label id="Q2L" className="title-input"> נייד: {requests.q2?(requests.q2):('')}</label>
                                    </h4>
                                </div>
                                <div id="name-group" >
                                    <h4><label id="Q3L" className="title-input"> טופס הזמנה מס': {requests.q3?(requests.q3):('')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q4L" className="title-input">מצורפת הצעת מחיר מס': {requests.q4?(requests.q4):('')}</label></h4>
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
                                            <h4> <label id="Q5L" className="title-input" htmlFor="name">{requests.q5?(requests.q5):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q6L" className="title-input" htmlFor="name">{requests.q6?(requests.q6):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q7L" className="title-input" htmlFor="name">{requests.q7?(requests.q7):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q8L" className="title-input" htmlFor="name"> {requests.q8?(requests.q8):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="insert-name" className="title-input" htmlFor="name"> {requests.q9?(requests.q9):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="insert-name" className="title-input" htmlFor="name"> {requests.q10?(requests.q10):('')}</label></h4>
                                        </div></td>

                                    </tr>

                                    <tr>
                                        <td><div id="name-group" >
                                            <h4> <label id="Q50L" className="title-input" htmlFor="name">{requests.q50?(requests.q50):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q60L" className="title-input" htmlFor="name">{requests.q60?(requests.q60):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q70L" className="title-input" htmlFor="name">{requests.q70?(requests.q70):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q80L" className="title-input" htmlFor="name"> {requests.q80?(requests.q80):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q90L" className="title-input" htmlFor="name"> {requests.q90?(requests.q90):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q100L" className="title-input" htmlFor="name"> {requests.q100?(requests.q100):('')}</label></h4>
                                        </div></td>

                                    </tr>

                                    <tr>
                                        <td><div id="name-group" >
                                            <h4> <label id="Q51L" className="title-input" htmlFor="name">{requests.q51?(requests.q51):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q61L" className="title-input" htmlFor="name">{requests.q61?(requests.q61):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q71L" className="title-input" htmlFor="name">{requests.q71?(requests.q71):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q81L" className="title-input" htmlFor="name"> {requests.q81?(requests.q81):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q91L" className="title-input" htmlFor="name"> {requests.q91?(requests.q91):('')}</label></h4>
                                        </div></td>

                                        <td><div id="name-group" >
                                            <h4> <label id="Q101L" className="title-input" htmlFor="name"> {requests.q101?(requests.q101):('')}</label></h4>
                                        </div></td>

                                    </tr>
                                </table>

                                <div id="name-group" >
                                    <h4> <label id="Q11L" className="title-input" htmlFor="name">סה"כ כולל מע"מ: {requests.q11?(requests.q11):('')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q12L" className="title-input" htmlFor="name">נא לתאם קבלת משלוח עם: {requests.q12?(requests.q12):('')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q13L" className="title-input" htmlFor="name">מטרת הרכישה:</label></h4>{requests.q13?(requests.q13):('')}
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q14L" className="title-input" htmlFor="name">תקציב המחקר: {requests.q14?(requests.q14):('')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q15L" className="title-input" htmlFor="name">מס' המחקר: {requests.q15?(requests.q15):('')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q16L" className="title-input" htmlFor="name">חתימת החוקר: {requests.q16?(requests.q16):('')}</label></h4>
                                </div>

                                <div id="name-group" >
                                    <h4> <label id="Q17L" className="title-input" htmlFor="name">תאריך החשבונית: {requests.q17?(requests.q17):('')}</label></h4>
                                </div>
                                <div id="name-group" >
                                    <h4> <label id="Q18L" className="title-input" htmlFor="name">מס' חשבונית: {requests.q18?(requests.q18):('')}</label></h4>
                                </div>

                                <Grid item xs={6}>
                                    <TextField
                                        inputProps={{style: {textAlign: 'center'}}}
                                        id="q17i"
                                        name="q17"
                                        type="tel"
                                        autoComplete="off"
                                        value={this.state.q17}
                                        onChange={(e) => {
                                            this.handleChange(e,year+'-'+month+"-"+day,user,sum)
                                            //console.log("auth.currentUser.uid",auth.currentUser.uid)
                                            if(sum==0)
                                                sum=1
                                        }}
                                        variant="standard"
                                        fullWidth
                                        label="תאריך החשבונית"
                                    />
                                </Grid>
                                <br/>


                                <Grid item xs={6} hidden={this.state.q17==''}>
                                    <TextField
                                        inputProps={{style: {textAlign: 'center'}}}
                                        id="q18i"
                                        name="q18"
                                        type="tel"
                                        autoComplete="off"
                                        value={this.state.q18}
                                        onChange={(e) => {
                                            this.handleChange(e,year+'-'+month+"-"+day,user,sum)
                                            if (sum==0)
                                                sum=2
                                        }}
                                        variant="standard"
                                        fullWidth
                                        label="מס' חשבונית"
                                    />
                                </Grid>
                                <button id="sendData" className="btn btn-info" onClick={() => {

                                    sum=0
                                    this.sendRequest(this.state.form,year+'-'+month+"-"+day,user)

                                }}>שמירת נתונים
                                </button>
                                {/*</Grid>*/}


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

    async handleChange(event,date,user,sum)
    {
        var form=''
        var user1 =form.uid
        var name = event.target.name;
        var value = event.target.value;
        var e = event.target
    //     console.log("user",user)
    //     console.log("user1",user1)
    //     console.log("value2",value)
    //     console.log("e2",e)
    //     console.log("this.state.q18",this.state.q18)
    //     console.log("this.state.q17",this.state.q17)

    if( (sum==0&&name === 'q17') || (sum==1&&name === 'q18') )
    {


        if(name === 'q17' && event.target.value!=='' )
        {


            this.loadSpinner(true,"טוען נתוני חוקר")
                // console.log("this.state.teamName",this.state.teamName)
                // console.log("auth.currentUser.uid",auth.currentUser.uid)

                var formResearcher = await db.collection("researcher").doc(user).collection("request").doc(date).get()

            //     console.log("formResearcher",formResearcher)
            // console.log("formResearcher.data()2",formResearcher.data())

            if(formResearcher.data())
            {
                this.setState({form:formResearcher.data().form})
                form = this.state.form
                form[name] = value;
                this.setState({form:form})

            }

        }
        else if(name === 'q18')
        {
            form = this.state.form
            form[name] = value;
            this.setState({form:form})
        }
    }
    else if((sum==0&&name === 'q18') || (sum==2&&name === 'q17')){
        if(name === 'q18' && event.target.value!=='' )
        {
            this.loadSpinner(true,"טוען נתוני חוקר")
            // console.log("this.state.teamName",this.state.teamName)
            // console.log("auth.currentUser.uid",auth.currentUser.uid)

            var formResearcher = await db.collection("researcher").doc(user).collection("request").doc(date).get()

            //     console.log("formResearcher",formResearcher)
            // console.log("formResearcher.data()2",formResearcher.data())

            if(formResearcher.data())
            {
                // console.log("222222222222")
                // console.log("formResearcher.data()",formResearcher.data())
                // console.log("formResearcher.data().form",formResearcher.data().form)
                this.setState({form:formResearcher.data().form})
                form = this.state.form
                form[name] = value;
                this.setState({form:form})

            }

        }
        else if(name === 'q17')
        {

            form = this.state.form
            form[name] = value;
            this.setState({form:form})
        }
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

    async sendRequest(form,date,user){
        // console.log("form2",form)
        // console.log("form.date2",form.date)
        // console.log("user2",user)

        this.loadSpinner(true,"שליחת הבקשה")
        var path = auth.currentUser.uid
        try{
            var researcher = await db.collection("researcher").doc(user)
            // console.log("form1",form)
            var newDate = await researcher.collection("request").doc(form.date);

            newDate.set({
                form: form,
                date:form.date
            }).then(async ()=>{
                await this.addDataToTeam(researcher,form.date,user);
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


    async addDataToTeam(researcher,date,user)
    {
        // console.log("researcher2",researcher)
        // console.log("date2",date)
        //console.log("user3",user)


        var formResearcher = (await researcher.collection('request').doc(date).get()).ref;
        try{
            var team = (await researcher.get()).data();
            //var name =(team.fname + " "+team.lname);
            var name=this.state.teamName

            var teamCollection = await db.collection("Data").doc(team.team.id)
            var newDate = await teamCollection.collection("Requests").doc(date)
            var doc =  await newDate.get()
            var {year,month,day} = this.parser(date)
            var fullDate = new Date()
            fullDate.setTime(0)
            fullDate.setFullYear(year,month-1,day)
            //
            // console.log("team.team.id",team.team.id)
            // console.log("teamCollection",teamCollection)
            // console.log("newDate",newDate)
            // console.log("fullDate",fullDate)
            // console.log("formResearcher",formResearcher)



            if(!doc.exists){

                // console.log("doc.exists",doc.exists)
                // console.log("doc",doc)

                newDate.set({
                    date:fullDate,
                    RequestResearcher: formResearcher,
                    nameResearcher: this.state.teamName,
                   // nameResearcher: team.fname + " "+team.lname,

                })
            }
            else {

                // console.log("doc.exists",doc.exists)
                // console.log("doc",doc)

                newDate.update({
                    date:fullDate,
                    RequestResearcher: formResearcher,
                })
            }
        }catch(error) {
            alert(error.message)
        }

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
