import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import Select from "react-select";
import { auth, db, getPathData, getUser } from "../../../../../firebase/firebase";
import ClipLoader from "react-spinners/ClipLoader";
import { CSVLink } from "react-csv";
import 'classlist.js';
import TextField from "@material-ui/core/TextField";
import { render } from "react-dom";
import ReactToPrint from 'react-to-print';
import ErrorBoundry from '../../../general/ErrorBoundry'
import DisplayPurchaseRequests from "./DisplayPurchaseRequests";
import NotificationManager from 'react-notifications'

var sum = 0
var csvData = [];
var csvTableData = [];

class mngRequestPurchase extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadPage: false,
            spinner: [true, 'נא להמתין הדף נטען'],
            page: 'menu',
            user: props.location,
            error: false,
            showreport: false,
            loading: true,
            rule: "Manager",
            prevDate: '',
            viewResearcher: false,
            date: "",
            form: {
                date: "",
                team: "",
                name: "",
            },
            dateTo: new Date().toISOString().split('T')[0],
            dateFrom: new Date(Date.now() - 60 * 60 * 24 * 30 * 3).toISOString().split('T')[0]
        };


        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.approvResearcher = this.approvResearcher.bind(this)
        this.RequestPurchase = this.RequestPurchase.bind(this)
    }

    async GetData() {
        this.loadSpinner(true, "מיבא נתונים")
        var from = this.GetDates(this.state.dateFrom)
        var to = this.GetDates(this.state.dateTo)

        if (!this.state.dateFrom || !this.state.dateTo) {
            NotificationManager.warning("נא למלא תאריך התחלה וסיום")
            return this.loadSpinner(false, '')
        }

        var options = []
        this.setState({ options: options, show: false })

        var nameData = await db.collection("Data")
            .orderBy('name', 'asc')
            .get()

        var Teamcollection = nameData.docs.map(async function (doc) {
            var Requests = await db.collection("Data").doc(doc.id).collection("Requests")
                .where('date', '>=', from)
                .where('date', '<=', to)
                .get()

            if (!Requests.empty) {
                var forms = []
                Requests.forEach(async function (doc) {
                    if (doc.data().RequestResearcher) {
                        var FormsResearcher = await getPathData(doc.data().RequestResearcher.path)

                        if (FormsResearcher !== undefined) {
                            forms.push(FormsResearcher)
                        }
                    }
                })
                return [doc, Requests, forms]
            }

        })

        Promise.all(Teamcollection).then(res => {
            res.forEach(item => {
                if (item)
                    options.push({ value: item, label: item[0].data().name })
            })
            this.setState({ options: options })
            this.loadSpinner(false, "")
        })
    }

    createTableFile(forms, RequestResearcher) {
        RequestResearcher.map(report => {
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
            ])


            const data = [
                { id: this.report.form.q5, id1: 'Gob', id2: '2', id3: '', id4: '', id5: '' },
                { id: this.report.form.q50, id1: 'Gob', id2: '2', id3: '', id4: '', id5: '' },
                { id: this.report.form.q1, id1: 'Gob', id2: '2', id3: '', id4: '', id5: '' },
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
            }, {
                dataField: 'id3',
                text: 'מחיר יח בש"ח'
            }, {
                dataField: 'id4',
                text: 'מס יחידות'
            }, {
                dataField: 'id5',
                text: 'מחיר בש"ח'
            },];
            return report;
        })
    }

    createCsvFile(forms, RequestResearcher) {
        var q5, q50, q51, q6, q60, q61, q7, q70, q71, q8, q80, q81, q9, q90, q91, q10, q100, q101
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

        RequestResearcher.map(report => {
            csvData.push([
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
                q5 = report.form.q5,
                q50 = report.form.q50,
                q51 = report.form.q51,

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
                report.form.q16,
                "תאריך החשבונית: ",
                report.form.q17,
                "מס' חשבונית: ",
                report.form.q18,



            ])
            const data = [
                { id: q5, id1: 'Gob', id2: '2', id3: '', id4: '', id5: '' },
                { id: q50, id1: 'Gob', id2: '2', id3: '', id4: '', id5: '' },
                { id: q51, id1: 'Gob', id2: '2', id3: '', id4: '', id5: '' },
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
            }, {
                dataField: 'id3',
                text: 'מחיר יח בש"ח'
            }, {
                dataField: 'id4',
                text: 'מס יחידות'
            }, {
                dataField: 'id5',
                text: 'מחיר בש"ח'
            },];
            return report
        })

    }

    async componentDidMount() {
        var href = window.location.href.split("/", 5)

        auth.onAuthStateChanged(async user => {
            if (user) {

                var type = await getUser(user)
                if (href[4] === user.uid && (href[3] === type || type === 'Tester')) {
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })
                    this.render()
                    this.setState({ loadPage: true })
                    this.loadSpinner(false, "")
                    return
                }
                else {
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


    loadSpinner(event, massage) {
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({ spinner: spinner })
    }

    render() {
        if (this.state.loadPage) {
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
                    <div id="studentFeedback" className="feedback-design" dir='rtl'>
                        <div id="studentFeedback" className="form-design" name="student_form" method="POST">
                            <div id="name-group" className="form-group">

                                <Grid container spacing={2}>
                                    <Grid item xs={5}>
                                        <label id="insert-student" className="title-input" htmlFor="name">מתאריך </label>
                                        <input type="date" className="form-control" name="date" defaultValue={this.state.dateFrom}
                                            onChange={(e) => {
                                                this.setState({ dateFrom: e.target.value, options: null, show: false, teamName: null })
                                            }}
                                            required />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <label id="insert-student" className="title-input" htmlFor="name">עד תאריך </label>
                                        <input type="date" className="form-control" id="insert-date" name="date" defaultValue={this.state.dateTo}
                                            onChange={(e) => {
                                                this.setState({ dateTo: e.target.value, options: null, show: false, teamName: null })
                                            }}
                                            required />
                                    </Grid>


                                    <Grid item xs={2}>
                                        <label id="insert-student" className="title-input" htmlFor="name"> &nbsp;</label>
                                        <button id="viewReport" className="btn btn-info" onClick={() => {
                                            this.GetData()
                                        }}>מצא בקשות<span
                                            className="fa fa-arrow-right"></span></button>
                                    </Grid>

                                    <Grid item xs={6} hidden={!this.state.options}>
                                        <Select id='select' placeholder={" בחר חוקר "} options={this.state.options} onChange={(e) => {
                                            this.setState({ team: e.value, teamName: e.label })
                                        }} required />
                                    </Grid>
                                    <Grid item xs={3} hidden={!this.state.options}>
                                        <label id="insert-student" className="title-input" htmlFor="name"> &nbsp;</label>
                                        {
                                            !this.state.teamName ? "לא נבחר חוקר" : this.state.teamName
                                        }

                                    </Grid>
                                    <Grid item xs={3} hidden={!this.state.teamName}>
                                        <button id="viewReport" className="btn btn-info" onClick={() => {
                                            this.setState({ show: !this.state.show, forms: this.state.team[1].docs, RequestResearcher: this.state.team[2] })

                                            this.createCsvFile(this.state.team[1].docs, this.state.team[2])
                                        }}>{!this.state.show ? ("הצג בקשות לרכישה") : ("הסתר בקשות לרכישה")}<span
                                            className="fa fa-arrow-right"></span></button>
                                    </Grid>

                                </Grid>
                            </div>
                            {this.state.forms ? (

                                <Grid item xs={12} hidden={!this.state.show} >

                                    <CSVLink
                                        data={csvData}
                                        filename={this.state.dateFrom + "-" + this.state.dateTo + "בקשות לרכישה.csv"}
                                        className="btn btn-primary"
                                        target="_blank">
                                        <button>
                                            הורדת הבקשות בתאריכים שנבחרו לאקסל
                                        </button>
                                    </CSVLink>

                                    <div className="reports-list-container">
                                        {

                                            this.state.forms.map((form, index) => (
                                                <Grid item xs={12} key={index}>
                                                    <hr />
                                                    {this.Requests(form.data(), index, form.id)}
                                                </Grid>
                                            ))
                                        }

                                    </div>

                                </Grid >
                            ) : (<div></div>)}
                            <button id="go-back" className="btn btn-info" onClick={() => { this.BackPage() }}>חזור</button>
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

    generate(from, index) {
        const Data = this.Requests(from, index)


        class ComponentToPrint extends React.PureComponent {
            render() {
                return (
                    <ErrorBoundry>
                        <ReactToPrint
                            trigger={() => {
                                return <a href="#">Print To PDF</a>
                            }}
                            content={() => this.componentRef} />
                        <div ref={value => this.componentRef = value}>
                            <h1>Hello!</h1>
                        </div>
                    </ErrorBoundry>
                );
            }
        }

        render(<ComponentToPrint />, document.querySelector("#root"))
    }


    /**
     * Generate the component that displays the form to the user.
     * @param { any } form The form data to display.
     * @param { number } formIndex The index of the form.
     * @param { string } formDocumentId The id of the document in firestore. 
     * @returns { JSX.Element }
     */
    Requests(form, formIndex, formDocumentId) {
        var user = form.uid

        if (formIndex >= this.state.RequestResearcher.length) {
            return
        }
        if (form && this.state.show) {
            var requests = this.state.RequestResearcher[formIndex].form
            var date = form.date.toDate()
            var day = date.getDate()
            var month = date.getMonth() + 1
            var year = date.getFullYear()
            if (day < 10)
                day = '0' + day
            if (month < 10)
                month = '0' + month

            return (
                <div id="name-group" className="form-group" dir="rtl">
                    <div className="report" id="report">
                        <div>
                            <div dir="rtl">

                                <ReactToPrint
                                    trigger={() => {
                                        return <button>הדפס בקשה</button>
                                    }}
                                    content={() => this.toPrintRef} />

                                <div ref={value => this.toPrintRef = value}>
                                    <DisplayPurchaseRequests form={form} index={formIndex} requests={requests} />
                                </div>

                                <Grid item xs={6}>
                                    <TextField
                                        inputProps={{ style: { textAlign: 'center' } }}
                                        id="q17i"
                                        name="q17"
                                        type="tel"
                                        autoComplete="off"
                                        value={this.state.q17}
                                        onChange={(e) => {
                                            this.handleChange(e, year + '-' + month + "-" + day, user, sum)
                                            if (sum == 0)
                                                sum = 1
                                        }}
                                        variant="standard"
                                        fullWidth
                                        label="תאריך החשבונית"
                                    />
                                </Grid>
                                <br />

                                <Grid item xs={6} hidden={this.state.q17 == ''}>
                                    <TextField
                                        inputProps={{ style: { textAlign: 'center' } }}
                                        id="q18i"
                                        name="q18"
                                        type="tel"
                                        autoComplete="off"
                                        value={this.state.q18}
                                        onChange={(e) => {
                                            this.handleChange(e, year + '-' + month + "-" + day, user, sum)
                                            if (sum == 0)
                                                sum = 2
                                        }}
                                        variant="standard"
                                        fullWidth
                                        label="מס' חשבונית"
                                    />
                                </Grid>
                                <button id="sendData" className="btn btn-info" onClick={() => {
                                    sum = 0
                                    this.sendRequest(this.state.form, year + '-' + month + "-" + day, user)
                                }}>שמירת נתונים
                                </button>

                                <button onClick={async () => {
                                    this.loadSpinner(true, 'מוחק בקשה')
                                    try {
                                        await this.deletePurchaseRequest(formDocumentId)

                                        var forms = Array.from(this.state.forms)
                                        forms.splice(formIndex, 1)

                                        this.setState({ forms: forms })

                                    } catch (err) { }


                                    this.loadSpinner(false, '')
                                }}>מחק בקשה</button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else
            return (<div></div>)
    }

    parser(date) {
        var year = ''
        var month = ''
        var day = ''
        var j = 0;
        for (var i = 0; i < date.length; i++) {
            if (j === 0 && date[i] !== '-') {
                year += date[i]
            }
            else if (j === 1 && date[i] !== '-') {
                month += date[i]
            }
            else if (j === 2 && date[i] !== '-') {
                day += date[i]
            }
            else
                j++

        }
        year = parseInt(year)
        month = parseInt(month)
        day = parseInt(day)
        return { year, month, day }
    }

    async handleChange(event, date, user, sum) {
        var form = ''
        var user1 = form.uid
        var name = event.target.name;
        var value = event.target.value;
        var e = event.target

        if ((sum == 0 && name === 'q17') || (sum == 1 && name === 'q18')) {


            if (name === 'q17' && event.target.value !== '') {


                this.loadSpinner(true, "טוען נתוני חוקר")

                var formResearcher = await db.collection("researcher").doc(user).collection("request").doc(date).get()

                if (formResearcher.data()) {
                    this.setState({ form: formResearcher.data().form })
                    form = this.state.form
                    form[name] = value;
                    this.setState({ form: form })

                }

            }
            else if (name === 'q18') {
                form = this.state.form
                form[name] = value;
                this.setState({ form: form })
            }
        }
        else if ((sum == 0 && name === 'q18') || (sum == 2 && name === 'q17')) {
            if (name === 'q18' && event.target.value !== '') {
                this.loadSpinner(true, "טוען נתוני חוקר")

                var formResearcher = await db.collection("researcher").doc(user).collection("request").doc(date).get()

                if (formResearcher.data()) {
                    this.setState({ form: formResearcher.data().form })
                    form = this.state.form
                    form[name] = value;
                    this.setState({ form: form })

                }

            }
            else if (name === 'q17') {

                form = this.state.form
                form[name] = value;
                this.setState({ form: form })
            }
        }
        this.loadSpinner(false)
    }


    async handleSubmit(event) {
        if (!this.state.date) {
            return;
        }
        if (this.state.date === this.state.prevDate) {
            this.setState({ viewResearcher: !this.state.viewResearcher });
            return;
        }
        this.loadSpinner(true, "מעדכן נתונים חדשים")
        this.setState({ prevDate: this.state.date });

        var request = (await db.collection("researcher").doc(auth.currentUser.uid).get()).data().type;
        const collection = await db.collection('researcher').where("request", "==", request).get()
        const researchers = [];
        const date = this.state.date
        const collectionPromisesTeam = collection.docs.map(async function (doc) {
            var ref = await db.collection("researcher").doc(doc.id).collection("request").doc(date).get()
            var user = await db.collection("researcher").doc(doc.id).get()
            return [ref, user]

        })

        Promise.all(collectionPromisesTeam).then(res => {
            res.forEach(doc => {
                var approv = false;
                var Request = ''
                if (doc[0].exists) {
                    approv = true;
                    Request = doc[0].data().RequestPurchase;
                }
                var data = doc[1].data();
                var ref = doc[1].id;
                researchers.push({ data, approv, ref, Request })
            })

            let i;
            this.setState({ viewResearcher: !this.state.viewResearcher });
            for (i = 0; i < researchers.length; i++) {
                if (!this.state.researchers) {
                    this.setState({ researchers: researchers });
                    this.loadSpinner(false)
                    return
                }
                else if (researchers[i].approv !== this.state.researchers[i].approv) {
                    this.setState({ researchers: researchers });
                    this.loadSpinner(false)
                    return
                }

            }
            this.loadSpinner(false)
        });


    }
    loadPage(event) {
        this.setState({ loading: event })
    }
    async sendRequest(form, date, user) {
        this.loadSpinner(true, "שליחת הבקשה")
        var path = auth.currentUser.uid
        try {
            var researcher = await db.collection("researcher").doc(user)
            var newDate = await researcher.collection("request").doc(form.date);

            newDate.set({
                form: form,
                date: form.date
            }).then(async () => {
                await this.addDataToTeam(researcher, form.date, user);
                NotificationManager.success("הטופס נשלח בהצלחה")
                this.loadSpinner(false)
                window.location.reload(true);

            })

        } catch (error) {
            console.log("err2")

            NotificationManager.error(error.message)
            this.loadSpinner(false)
        }
    }
    async addDataToTeam(researcher, date, user) {

        var formResearcher = (await researcher.collection('request').doc(date).get()).ref;
        try {
            var team = (await researcher.get()).data();
            var name = this.state.teamName

            var teamCollection = await db.collection("Data").doc(team.team.id)
            var newDate = await teamCollection.collection("Requests").doc(date)
            var doc = await newDate.get()
            var { year, month, day } = this.parser(date)
            var fullDate = new Date()
            fullDate.setTime(0)
            fullDate.setFullYear(year, month - 1, day)

            if (!doc.exists) {

                newDate.set({
                    date: fullDate,
                    RequestResearcher: formResearcher,
                    nameResearcher: this.state.teamName,
                })
            }
            else {
                newDate.update({
                    date: fullDate,
                    RequestResearcher: formResearcher,
                })
            }
        } catch (error) {
            NotificationManager.error(error.message)
        }

    }
    approvResearcher(researcher) {

        var researchers = this.state.researchers;
        for (var i = 0; i < researchers.length; i++) {
            if (researchers[i] === researcher) {
                researchers[i].approv = !researchers[i].approv;
                this.setState({ researchers: researchers })
                return
            }
        }
    }
    RequestPurchase(event, researcher) {
        var researchers = this.state.researchers;

        for (var i = 0; i < researchers.length; i++) {
            if (researchers[i] === researcher) {
                researchers[i].Request = event.target.value
                this.setState({ researchers: researchers })
                return
            }
        }
    }
    GetDates(date) {
        date = this.parser(date)
        var parsDate = new Date()
        parsDate.setTime(0)
        parsDate.setFullYear(date["year"], date["month"] - 1, date["day"])

        return parsDate;


    }
    loadUser(page) {
        this.props.history.push({
            // pathname: `/${page}/${this.state.user.id}`,
            pathname: `/Temp${page}`,
            data: this.state.user // your data array of objects
        })
    }
    BackPage() {
        this.props.history.push({
            pathname: `/Manager/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }
    notfound() {
        this.props.history.push({
            pathname: `/404`,
            data: this.state.user // your data array of objects
        })
    }

    async deletePurchaseRequest(documentId) {
        const [teamDataDoc] = this.state.team;

        const documentToDelete = await db.collection('Data')
            .doc(teamDataDoc.id)
            .collection('Requests')
            .doc(documentId)

        try {
            await documentToDelete.delete()
        } catch (error) {
            return NotificationManager.error(error.message)
        }


        NotificationManager.success('הבקשה נמחקה מהמערכת')
    }
}





export default mngRequestPurchase;
