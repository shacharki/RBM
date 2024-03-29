import React, { Component } from "react";
import {db, CreateNewTeam, auth, getUser} from "../../../../firebase/firebase";
import Grid from "@material-ui/core/Grid";
import Select from "react-select";
import ClipLoader from "react-spinners/ClipLoader";
import {CSVLink} from "react-csv";


var options = []
var researchersOptions = []
var studentsOptions = []
var emptyresearchersOptions = []
var emptyStudentsOptions = []
var emptyTeamOptions = []
var TeamOptions = []
var csvresearchersData = []
var csvmanagersData = []
class UpdatesFirebase extends Component {

    constructor(props) {
        super(props);

        this.state =
            {
                loadPage:false,
                spinner: [true,'נא להמתין הדף נטען'],
                isLoaded:false,
                date:"",
                newTeamName:'',
                teamPath:"",
                teamName:"",
                replaceTeamName:false,
                delete:false,
                showresearchers:false,
                showStudents:false,
                showTeamWithoutresearcher:false,
                showresearcherWithoutTeam:false,
                showStudentWithoutTeam:false,
            }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    loadSpinner(event,massage){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }

    async handleChange(event)
    {

        var value = event.target.value;
        if(value === '')
            this.setState({newTeamName:value,replaceTeamName:false})
        else
            this.setState({newTeamName:value})
    }
    async deleteTeam(){


    }



    createCsvFile(users,type)
    {
        if(type ==='researcher')
        {
            csvresearchersData = [
                [
                    "שם פרטי",
                    "שם משפחה",
                    "ת.ז",
                    "טלפון",
                    "מייל",
                    "תפקיד",
                    "קבוצה",
                ],
            ];
            users.map(user=>{
                if(user)
                {
                    csvresearchersData.push([
                        user.data().fname,
                        user.data().lname,
                        user.data().ID,
                        user.data().phone.substr(0,3)+"-"+user.data().phone.substr(3,user.data().phone.length),
                        user.data().email,
                        user.data().type==='managers'?"מנהל":
                            user.data().type==='researcher'?"חוקר":"",
                        user.data().teamName,

                    ],)
                }
                return user
            })
        }
        else
        {
            csvmanagersData = [
                [
                    "שם פרטי",
                    "שם משפחה",
                    "ת.ז",
                    "טלפון",
                    "מייל",
                    "תפקיד",
                    "קבוצה",
                ],
            ];
            users.map(user=>{
                if(user) {
                    csvmanagersData.push([
                        user.data().fname,
                        user.data().lname,
                        user.data().ID,
                        user.data().phone.substr(0, 2) + "-" + user.data().phone.substr(3, user.data().phone.length),
                        user.data().email,
                        user.data().type==='managers'?"מנהל":
                            user.data().type==='researcher'?"חוקר":"",
                        user.data().teamName,

                    ],)
                }
                return user
            })

        }

    }


    render() {
        if(this.state.loadPage)
        {
            return(
                <div id="instactorReport" className="sec-design" dir='rtl'>

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
                        <Grid item xs={12}>
                            <input type="text" name="team" placeholder="שם משתמש חדש" onChange={this.handleChange}/>
                        </Grid>
                        <Grid item xs={6} >
                            <button onClick={async ()=>{
                                var newTeam= this.state.newTeamName
                                await CreateNewTeam(newTeam)
                                window.location.reload(true)
                            }}>צור משתמש חדש</button>
                        </Grid>
                        <Grid item xs={6}>
                            <button onClick={()=>{
                                if(this.state.newTeamName && this.state.newTeamName.length > 0)
                                    this.setState({replaceTeamName:true})
                                else
                                    alert("שם המשתמש החדש לא יכול להיות ריק")
                            }}>החלף שם למשתמש קיים </button>
                        </Grid>
                        <Grid item xs={8} hidden={!this.state.replaceTeamName}>
                            <Select  placeholder={" בחר משתמש להחלפת שם "} options={options} onChange={(e)=>{
                                // console.log(e.label,e.value);
                                this.setState({teamPath:e.value,teamName:e.label})
                            }} required/>
                        </Grid>
                        <Grid item xs={4} hidden={!this.state.replaceTeamName} >
                            <button onClick={async ()=>{

                                if(this.state.teamName !== this.state.newTeamName) {
                                    await this.setState({replaceTeamName: false})
                                    await this.state.teamPath.update({name:this.state.newTeamName})
                                    alert('בוצע שינוי שם בהצלחה')
                                    window.location.reload(true);

                                }
                                else
                                {
                                    alert("שם זהה לא ניתן לשנות")
                                }
                            }}>אישור החלפה</button>
                        </Grid>
                        <Grid item xs={12}>
                            <button onClick={()=>{
                                this.setState({delete:!this.state.delete})
                                this.deleteTeam()
                            }}>{this.state.delete?'הסתר מחיקת משתמש':'הצג מחיקת משתמש'} </button>
                        </Grid>
                        <Grid item xs={8} hidden={!this.state.delete}>
                            <Select  placeholder={" בחר משתמש "} options={options} onChange={(e)=>{
                                // console.log(e.label,e.value);
                                this.setState({teamPath:(e.value).path,teamName:e.label})
                            }} required/>
                        </Grid>
                        <Grid item xs={4} hidden={!this.state.delete} >
                            <button onClick={async ()=>{
                                // console.log(this.state.teamPath)
                                if(this.state.teamPath) {
                                    await this.setState({delete: false})
                                    var d = await db.doc(this.state.teamPath).get()
                                    if(d.data().researcher) {
                                        // console.log("team on researcher remove")
                                        await d.data().researcher.update({
                                            team: null,
                                            teamName: null
                                        })
                                    }


                                    var researcher = await  db.collection("researcher").where('teamName','==',this.state.teamName).get()
                                    researcher.docs.forEach(async student=>{
                                        researcher.ref.update({
                                            teamName: null,
                                            team:null
                                        })
                                    })

                                    await db.doc(this.state.teamPath).delete().then(function() {
                                        alert("המשתמש נמחק בהצלחה");
                                    }).catch(function(error) {
                                        console.error("Error removing document: ", error);
                                    });
                                    window.location.reload(true);

                                }
                                else
                                {
                                    // console.log("בחר חוקר")
                                }
                            }}>מחק</button>
                        </Grid>

                        <Grid item xs={12}>
                            <div className="text-below-image">
                                <button onClick={()=>{
                                    this.getAllUsers('researcher')
                                    this.setState({showresearchers:!this.state.showresearchers,researcherTeamName:null,researcherName:null})

                                }} >{this.state.showresearchers?'הסתר רשימת חוקרים':'הצג רשימת חוקרים'}</button>
                                {
                                    (this.state.showresearchers && this.state.researchers) ? (
                                        <div>
                                            <Grid item xs={12}>
                                                נמצאו:{this.state.researchers.length} חוקרים
                                                <Select placeholder={" מצא חוקר "} options={researchersOptions}
                                                        onChange={(e) => {
                                                            // console.log(e.label, e.value);
                                                            this.setState({researchers: [e.value]})
                                                        }}/>

                                            </Grid>
                                            <Grid item xs={12}>
                                                <CSVLink
                                                    data={csvresearchersData}
                                                    filename={"רשימת חוקרים.csv"}
                                                    className="btn btn-primary"
                                                    target="_blank"
                                                >
                                                    <button>
                                                        הורדת פרטי קשר חוקרים
                                                    </button>
                                                </CSVLink>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <CSVLink
                                                    data={csvresearchersData}
                                                    filename={"רשימת חוקרים.doc"}
                                                    className="btn btn-primary"
                                                    target="_blank"
                                                >
                                                    <button>
                                                         וורד הורדת פרטי קשר חוקרים
                                                    </button>
                                                </CSVLink>
                                            </Grid>
                                        </div> ) : ('')

                                }
                                {
                                    (!this.state.researchers || !this.state.showresearchers)?'':
                                        this.state.researchers.map((researcher,index) => (
                                            <Grid  item xs={12}  key={index}>
                                                <hr/>
                                                {this.card(researcher.data(),index)}
                                            </Grid >
                                        ))


                                }
                            </div>

                        </Grid>


                        <Grid item xs={12}>
                            <button id="feedback-button" className="btn btn-info" onClick={()=>{this.BackPage()}}>חזרה לתפריט</button>
                        </Grid>


                    </Grid>



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


    BackPage()
    {
        this.props.history.push({
            pathname: `/Manager/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

    async getAllUsers(user) {
        this.loadSpinner(true,"מיבא נתוני משתמשים")


        if ((user === 'researcher' && this.state.researchers && this.state.researchers > 1) ||
            (user === 'researchersEmpty' && this.state.researchersEmpty && this.state.researchersEmpty > 1) ||
            (user === 'teamEmpty' && this.state.TeamEmpty && this.state.TeamEmpty > 1) ||
            (user === 'Data' && this.state.Data && this.state.Data > 1)) {
            this.loadSpinner(false,"")
            return
        }
        // console.log(user)
        var temp = user
        if (user === 'researcher')
            researchersOptions = []
        else if (user === 'researchersEmpty') {
            emptyresearchersOptions = []
            temp = 'researcher'
        } else if (user === 'teamEmpty') {
            emptyTeamOptions = []
            temp = 'Data'
        } else if (user === 'Data') {
            TeamOptions = []
            temp = 'Data'
        }
        var allUsers = []
        await db.collection(temp).get().then(res => {
            res.forEach(res => {
                if (res.data().uid) {
                 if (user === 'researcher') {
                        allUsers.push(res)
                     researchersOptions.push({value: res, label: res.data().fname + ' ' + res.data().lname})

                    } else if (user === 'researchersEmpty' && !res.data().team) {
                        allUsers.push(res)
                        emptyresearchersOptions.push({value: res, label: res.data().fname + ' ' + res.data().lname})
                    }
                } else if (user === 'teamEmpty' && !res.data().researcher) {
                    allUsers.push(res)
                    emptyTeamOptions.push({value: res, label: res.name})

                } else if (user === 'Data' && res.data().researcher) {
                    allUsers.push(res)
                    TeamOptions.push({value: res, label: res.name})
                }
            })
        })
        if (user === 'researcher') {
            this.setState({researchers: allUsers})
            this.createCsvFile(allUsers,'researcher')
        }
        else if (user === 'researchersEmpty')
            this.setState({researchersEmpty: allUsers})
        else if (user === 'studentEmpty')
            this.setState({StudentEmpty: allUsers})
        else if (user === 'teamEmpty')
            this.setState({TeamEmpty: allUsers})
        else if (user === 'Data') {
            this.setState({Data: allUsers})
        }

        this.loadSpinner(false,"")
         console.log("all users",allUsers)
    }


    async handleSubmit(event)
    {
        this.loadSpinner(true,"מיבא נתונים")
        // console.log(this.state.teamPath)
        if(!this.state.date) {
            this.loadSpinner(false,"")
            return;
        }
        // console.log("in");
        var team = await db.collection("Data").doc(this.state.teamPath).get();
        // console.log(team)
        this.loadSpinner(false,"")
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
                    this.loadSpinner(true,"מיבא נתונים")
                    var nameTeams =  await db.collection("Data").get();
                    nameTeams.forEach(doc=>{
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


    async handleChangeDate(event)
    {
        var name = event.target.name;
        var value = event.target.value;
        if(name === 'date')
        {
            this.setState({date:value,viewStudent:false});
            this.state.date=value
        }
    }

    teamCard(team)
    {
        return(
            <div id="name-group" className="form-group" dir="rtl">
                <div className="report" id="report">
                    <div>
                        <h4> שם החוקר: {team.name} </h4>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Select  placeholder={" שיבוץ חוקר "} options={emptyresearchersOptions} onChange={(e)=>{
                                    // console.log(e.label,e.value);
                                    this.setState({emtpyresearcherTeamPath:e.value,emtpyresearcherTeamName:e.label})
                                }} />
                            </Grid>
                            <Grid item xs={4} hidden={!this.state.emtpyresearcherTeamPath}>


                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        )
    }

    card(user,index)
    {
        return(
            <div id="name-group" className="form-group" dir="rtl">
                <div className="report" id="report">
                    <div>

                        <h4> שם: {user.fname+' '+ user.lname} </h4>
                        <h4> טלפון: {user.phone}</h4>
                        <h4> אימייל: {user.email}</h4>
                        <h4> ת.ז: {user.ID}</h4>
                        <h4> חוקר: {user.teamName}</h4>
                        <Grid container spacing={2}>


                        </Grid>
                    </div>
                </div>
            </div>

        )
    }



    loadUser(page)
    {
        this.props.history.push({
            // pathname: `/${page}/${this.state.user.id}`,
            pathname: `/Temp${page}`,
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



export default UpdatesFirebase;
