import React, { Component } from "react";
import { auth, db, GetFormDownload, getPathData, getUser, signOut } from '../../../../firebase/firebase';
import './Researcher.css'
import Grid from "@material-ui/core/Grid";
import ClipLoader from "react-spinners/ClipLoader";
import DropzoneFiles from "./DropzoneFiles";
import inferUserTypeFromUrl from "../../../../firebase/inferUserTypeFromUrl";
import getUsersLists from "../../../../firebase/getAllUsers";
import Select from 'react-select'
import NotificationManager from "react-notifications/lib/NotificationManager";

const options = [
]
let csvData = [];


class ScientificReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: props.location,
            loadPage: false,
            page: 'menu',
            error: false,
            showreport: false,
            loading: true,
            rule: "Reasearcher",
            viewResearcher: false,
            reports: [],
            spinner: [true, 'נא להמתין הדף נטען'],
            date: "",
            prevDate: '',
            form: {
                date: "",
                team: "",
                name: "",
            },
            dateFrom: this.getInitialDateFrom(),
            dateTo: new Date().toISOString().split('T')[0],
            userReportsUid: undefined, // The uid of the user to find reports for.
            managerResearcherSelectOptions: []
        };
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.approvResearcher = this.approvResearcher.bind(this)
        this.RequestPurchase = this.RequestPurchase.bind(this)
    }

    loadSpinner(event, massage) {
        let spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({ spinner: spinner })
    }

    loadPage(event) {
        this.setState({ loading: event })
    }

    getInitialDateFrom() {
        var date = new Date()
        date.setMonth(date.getMonth() - 1);

        return date.toISOString().split("T")[0]
    }

    async componentDidMount() {
        let href = window.location.href.split("/", 5)

        auth.onAuthStateChanged(async user => {
            if (user) {
                let type = await getUser(user)

                this.setSelectedUser();

                if (href[4] === user.uid && (href[3] === type || type === 'Tester')) {
                    this.setState({
                        isLoad: true,
                        user: user,
                        type: type
                    })

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
            let teamName = await db.collection("researcher").doc(auth.currentUser.uid).get()
            this.loadSpinner(false, "")
            this.setState({ loadPage: true })
            this.render()

        })

    }

    async setSelectedUser() {
        const userType = inferUserTypeFromUrl();

        if (userType === 'Researcher') {
            return this.setState({ userReportsUid: auth.currentUser.uid })
        }

        // Load the options for the user select component.

        const researchers = await getUsersLists()

        const userSelectOptions = researchers.map(value => {
            return {
                label: `${value.fname} ${value.lname}`,
                value: value.uid
            }
        })

        this.setState({ managerResearcherSelectOptions: userSelectOptions })
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

        let request = (await db.collection("researcher").doc(auth.currentUser.uid).get()).data().type;
        const collection = await db.collection('researcher').where("ScientificReport", "==", request).get()
        const researchers = [];
        const date = this.state.date
        const collectionPromisesTeam = collection.docs.map(async function (doc) {
            let ref = await db.collection("researcher").doc(doc.id).collection("ScientificReport").doc(date).get()
            let user = await db.collection("researcher").doc(doc.id).get()
            return [ref, user]

        })

        Promise.all(collectionPromisesTeam).then(res => {
            res.forEach(doc => {
                let approv = false;
                let Request = ''
                if (doc[0].exists) {
                    approv = true;
                    Request = doc[0].data().RequestPurchase;
                }
                let data = doc[1].data();
                let ref = doc[1].id;
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
    RequestPurchase(event, researcher) {
        let researchers = this.state.researchers;
        // console.log(event.target.value);
        for (let i = 0; i < researchers.length; i++) {
            if (researchers[i] === researcher) {
                researchers[i].Request = event.target.value
                this.setState({ researchers: researchers })
                return
            }
        }
    }
    approvResearcher(researcher) {

        let researchers = this.state.researchers;
        for (let i = 0; i < researchers.length; i++) {
            if (researchers[i] === researcher) {
                researchers[i].approv = !researchers[i].approv;
                this.setState({ researchers: researchers })
                return
            }
        }
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
                                size={120}
                                color={"#123abc"}

                            />
                        </div>
                    </div>
                }

                <Grid container spacing={2}>
                    <button id="ReportScientific" className="btn btn-info" onClick={async () => {
                        let file = await GetFormDownload()
                        const link = document.createElement('a');
                        link.href = file
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);


                    }}>הורדת טופס דוח מדעי למילוי<span
                        className="fa fa-arrow-right"></span></button>

                    <label id="insert-student" className="title-input" htmlFor="name">:העלאת דוח </label>
                    <Grid item xs={5}
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start">
                        <DropzoneFiles />
                    </Grid>

                    <Grid item xs={12}>

                        <label id="insert-student" className="title-input" htmlFor="name">:חיפוש דוחות </label>

                        <div hidden={inferUserTypeFromUrl() === 'Researcher'}>
                            <Select options={this.state.managerResearcherSelectOptions} placeholder={"בחר חוקר"} onChange={({ label, value }) => {
                                console.log({label, value})
                                this.setState({ userReportsUid: value })
                            }} />
                        </div>

                        <Grid container spacing={2} >
                            <Grid item xs={5}>
                                <label id="insert-student" className="title-input" htmlFor="name">עד תאריך </label>
                                <input type="date" className="form-control" id="insert-date" name="date" defaultValue={this.state.dateTo}
                                    onChange={(e) => {
                                        this.setState({ dateTo: e.target.value, options: null, show: false, teamName: null })
                                    }}
                                    required />
                            </Grid>

                            <Grid item xs={5}>
                                <label id="insert-student" className="title-input" htmlFor="name">מתאריך </label>
                                <input type="date" className="form-control" name="date" defaultValue={this.state.dateFrom}
                                    onChange={(e) => {
                                        this.setState({ dateFrom: e.target.value, options: null, show: false, teamName: null })
                                    }}
                                    required />
                            </Grid>


                            <Grid item xs={2} hidden={!this.state.dateTo || !this.state.dateFrom}>
                                <label id="insert-student" className="btn btn-info" htmlFor="name"> &nbsp;</label>
                                <button id="viewReport" className="btn btn-info" onClick={() => this.GetReport()}>מצא דוחות<span
                                    className="fa fa-arrow-right"></span></button>
                            </Grid>



                        </Grid>



                        <Grid item xs={12} hidden={this.state.reports.length < 1}>
                            <hr />
                            {
                                this.state.reports.map(report => (
                                    <a href={report.link}>{report.date + " " + report.nameR}<hr /></a>
                                ))
                            }
                        </Grid>
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

    async handleChange(event) {
        let form = ''

        let name = event.target.name;
        let value = event.target.value;
        let e = event.target
        if (name === 'date' && event.target.value !== '') {
            this.loadSpinner(true, "טוען נתונים")

            let formGuide = await db.collection("researcher").doc(auth.currentUser.uid).collection("ScientificReport").doc(event.target.value).get()

            if (formGuide.data() && formGuide.data().locked) {
                alert("הדוח לתאריך קיים נא לבחור תאריך אחר")
                document.getElementById(e.id).value = ''
                form = this.state.form;
                // console.log(name);

                form[name] = '';
                this.setState({ form: form })

            }
            else if (formGuide.data()) {
                this.setState({ form: formGuide.data().form })

            }

        }
        else {
            form = this.state.form
            form[name] = value;
            this.setState({ form: form })
        }
        this.loadSpinner(false)



    }

    async GetReport() {
        if(!this.state.userReportsUid) {
            return inferUserTypeFromUrl() == 'Researcher' ? NotificationManager.error("בבקשה התחבר למערכת") : NotificationManager.error("בבקשה בחר חוקר")
        }

        this.loadSpinner(true, "מיבא נתונים")
        let from = this.GetDates(this.state.dateFrom)
        let to = this.GetDates(this.state.dateTo)


        if (!this.state.dateFrom || !this.state.dateTo) {
            alert("נא למלא תאריך התחלה וסיום")
            this.loadSpinner(false, '')
            return
        }

        let options = []
        this.setState({ options, show: false })

        let researcherReports = await db.collection("researcher").doc(this.state.userReportsUid).collection("ScientificReport")
            .where("date", "<=", to.toISOString().split('T')[0])
            .where("date", ">=", from.toISOString().split('T')[0])
            .get();
        const reportDocs = await Promise.all(researcherReports.docs.map(doc => doc.data()));

        this.setState({ reports: reportDocs })

        this.loadSpinner(false, "")

        if(reportDocs.length == 0) {
            return NotificationManager.warning('לא נמצאו דוחות')
        }

        NotificationManager.success("הדוחות נטענו בהצלחה")

    }

    parser(date) {
        let year = ''
        let month = ''
        let day = ''
        let j = 0;
        for (let i = 0; i < date.length; i++) {
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

    GetDates(date) {
        date = this.parser(date)
        let parsDate = new Date()
        parsDate.setTime(0)
        parsDate.setFullYear(date["year"], date["month"] - 1, date["day"])

        return parsDate;
    }



    BackPage() {
        const userType = inferUserTypeFromUrl();

        this.props.history.push({
            pathname: `/${userType}/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

}

export default ScientificReport;