import React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {auth, db, getUser, signOut} from '../../../../firebase/firebase'
import { RadioGroup ,FormControlLabel, Radio } from '@material-ui/core';
import './Researcher.css'
import ClipLoader from "react-spinners/ClipLoader";


class PurchaseRequest extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loadPage:false,
            spinner: [true,'נא להמתין הדף נטען'],
            isLoad:false,
            user: props.location,
            error:false,
            loading: true,
            page:'menu',
            rule:"researcher",
            date:'',
            form:{
                canUpdate : true,
            },
            searchTerm:"",
            searchResults:[],



            search: true,
            searchQuery: null,
            value1: [],
            options : [
                { key: 1, text: 'Choice 1', value: 1 },
                { key: 2, text: 'banana', value: 2 },
                { key: 3, text: 'kabuk', value: 3 },
            ]
        };

        this.handleChange1 = (e, { value }) => this.setState({ value })
        this.handleSearchChange1 = (e, { searchQuery }) => this.setState({ searchQuery })



        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.hendleSerch = this.hendleSerch.bind(this)
        this.hendleRadioButton = this.hendleRadioButton.bind(this)




    }


    async sendDataToFirebase(form)
    {
        this.loadSpinner(true,"שולח נתונים")
        var path = auth.currentUser.uid
        try{
            await db.collection("researcher").doc(path).collection("comes").doc(this.state.date).set({
                approved:true,
                form: form,
                date:this.state.date
            }).then(()=>{
                alert(" תודה, הטופס נשלח בהצלחה")
                window.location.reload(true);
            })

        }catch(error) {
            alert(error.message)
            this.loadSpinner(false)
        }


        this.loadSpinner(false)
    }

    getItem(item)
    {
        this.setState({searchTerm:item.item});
    }
    hendleSerch(event)
    {
        // this.setState({searchTerm:event.target.value})
        // this.hendleRes()
        const results = this.people.filter(person =>
            person.toLowerCase().includes(event.target.value)
        );
        this.setState({searchResults:results,searchTerm:event.target.value});

    }
    hendleRadioButton(event)
    {
        var RequestPurchase=''
        var form = this.state.form
        if(form.RequestPurchase)
            RequestPurchase= form.RequestPurchase
        else
            RequestPurchase={}
        RequestPurchase[event.target.name] = event.target.value;
        form.RequestPurchase=RequestPurchase
        this.setState({form:form})
    }

    async handleChange(event)
    {
        var form ="";
        var name = event.target.name;
        var value = event.target.value;
        if(name === 'date' && event.target.value!=='' )
        {
            var test = await db.collection("researcher").doc(auth.currentUser.uid).collection("comes").doc(event.target.value).get()
            if(test.exists && test.data().form) {
                alert("מילאת בקשה לתאריך הנוכחי נא לבחור תאריך אחר")
                form = this.state.form;
                this.setState({date:''})
            }
            else
            {
                this.setState({date:value})
            }
        }
        else
        {
            form = this.state.form
            form[name] = value;
            this.setState({form:form})
        }



    }

    handleSubmit(event)
    {
        this.sendDataToFirebase(this.state.form)


    }
    loadPage(event){
        this.setState({loading:event})
        //    this.render()
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

    loadSpinner(event,massage = ""){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }
    async  logout() {
        //מסך טעינה
        await auth.signOut();
        window.location.href = '/';
        //סיום מסך טעינה
    }


    chooseLayout(page)
    {
        this.setState({
            page:page,
        })
        this.render()
    }


    loadTempPage(page)
    {
        this.props.history.push({
            pathname: `/${page}`,
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

    render() {
        if(this.state.loadPage)
        {
            return (<div>


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

                <div id="attendreport" className="sec-design" dir='rtl'>
                    <h2>שלום {this.state.user.displayName} </h2>

                    <div id="name-group" className="form-group">
                        <label id="insert-student" className="title-input" htmlFor="name">תאריך הבקשה:</label>
                        <input type="date" className="form-control" id="insert-date" value={this.state.date} name="date"
                               onChange={this.handleChange}
                               required/>
                    </div>

                    <Grid item xs={6}>
                        <TextField
                            inputProps={{style: {textAlign: 'center'}}}
                            id="q1i"
                            name="q1"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q1i}
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
                        <label id="Q3L" className="title-input">טלפון המכון: 04-6123901. פקס: 04-6961930</label>
                        <br/>
                    </div>

                    <Grid item xs={6}>
                        <TextField
                            inputProps={{style: {textAlign: 'center'}}}
                            id="q4i"
                            name="q4"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q4i}
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
                            id="q5i"
                            name="q5"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q5i}
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
                            id="q6i"
                            name="q6"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q6i}
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
                            id="q7i"
                            name="q7"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q7i}
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
                        <label id="Q8L" className="title-input">תיאור הפריט:</label>
                        <input type="text" name="q8" id="q8i" placeholder={'התשובה שלך'}
                               value={this.state.form.q8 ? (this.state.form.q8) : ('')} onChange={(e) => {
                            this.handleChange(e)
                        }} required/>
                    </div>

                    <Grid item xs={6}>
                        <TextField
                            inputProps={{style: {textAlign: 'center'}}}
                            id="q9i"
                            name="q9"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q9i}
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
                            id="q10i"
                            name="q10"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q10i}
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
                            id="q11i"
                            name="q11"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q11i}
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
                            id="q22i"
                            name="q22"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q22i}
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
                        <label id="Q12L" className="title-input">המעבדה ממוקמת במבנה החדש של מכון שמיר למחקר (קומה 2), צמוד למכללת אוהלו</label>
                        <br/>
                    </div>

                    <div id="name-group">
                        <label id="Q13L" className="title-input">תנאי תשלום: שוטף + 30</label>
                        <br/>
                    </div>

                    <div id="name-group">
                        <label id="Q14L" className="title-input">נא לתאם את קבלת המשלוח עם:</label>
                        <input type="text" name="q14" id="q14i" placeholder={'התשובה שלך'}
                               value={this.state.form.q14 ? (this.state.form.q14) : ('')} onChange={(e) => {
                            this.handleChange(e)
                        }} required/>
                    </div>

                    <h4>לשימוש משרד המכון בלבד:</h4>

                    <Grid item xs={6}>
                        <TextField
                            inputProps={{style: {textAlign: 'center'}}}
                            id="q15i"
                            name="q15"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q15i}
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
                            id="q16i"
                            name="q16"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q16i}
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
                            id="q17i"
                            name="q17"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q17i}
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
                        <label id="Q18L" className="title-input">שם החוקר: {this.state.user.displayName}</label>
                        <br/>
                    </div>

                    <div id="name-group">
                        <label id="Q19L" className="title-input">חתימת החוקר:</label>
                        <input type="text" name="q19" id="q19i" placeholder={'התשובה שלך'}
                               value={this.state.form.q19 ? (this.state.form.q19) : ('')} onChange={(e) => {
                            this.handleChange(e)
                        }} required/>
                    </div>

                    <Grid item xs={6}>
                        <TextField
                            inputProps={{style: {textAlign: 'center'}}}
                            id="q20i"
                            name="q20"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q20i}
                            onChange={e => {
                                this.setState({q20i:e.target.value})
                            }}
                            variant="standard"
                            fullWidth
                            label="תאריך חשבונית"
                        />
                    </Grid>
                    <br/>

                    <Grid item xs={6}>
                        <TextField
                            inputProps={{style: {textAlign: 'center'}}}
                            id="q21i"
                            name="q21"
                            type="tel"
                            autoComplete="off"
                            value={this.state.q21i}
                            onChange={e => {
                                this.setState({q21i:e.target.value})
                            }}
                            variant="standard"
                            fullWidth
                            label="מס' חשבונית"
                        />
                    </Grid>
                    <br/>

                    {/*<button id="confirm-form" className="btn btn-info"  onClick={this.handleSubmit}>הצגת נוכחות</button>*/}
                    <button id="confirm-form" className="btn btn-info" onClick={this.handleSubmit}>שלח בקשה
                    </button>
                    <button id="feedback-button" className="btn btn-info" onClick={() => {
                        this.loadPage()
                        this.BackPage()
                    }}>חזרה לתפריט
                    </button>
                    <button id="logout" className="btn btn-info" onClick={() => {
                        signOut()
                    }}>התנתק
                    </button>

                    {/*<button id="go-back" className="btn btn-info" onClick={() => {*/}
                    {/*        this.chooseLayout("menu")*/}
                    {/*    }}>חזור*/}

                    {/*    </button>*/}

                </div>
            </div>);
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

    loadUser(page)
    {
        this.props.history.push({
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


export  default  PurchaseRequest;