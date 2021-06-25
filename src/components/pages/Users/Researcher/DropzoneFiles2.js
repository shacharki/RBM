//העלאת קבצי בקשה לרכישה
import React, {Component} from 'react';
import firebase, {auth, db, storage} from "../../../../firebase/firebase";
import Dropzone from 'react-dropzone';
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

class DropzoneFiles2 extends Component {
    constructor() {
        super();
        this.onDrop = (files) => {
            this.setState({files})
        };
        this.state = {
            teamPath:"",
            files: [],
            report:false,
            maxFile:5,
            date:"",
            nameR:"",
        };
        this.handleChangeDate = this.handleChangeDate.bind(this)
        this.handleChangeNameR = this.handleChangeNameR.bind(this)

    }
    async componentDidMount() {
        auth.onAuthStateChanged(async user => {
            if (user) {
                this.setState({user:user})
            }
        })
    }



    async upload(files)
    {

        if(files!==null && files!==undefined&& files.length<=0)
            return;
        var nameR = this.state.nameR
        var date = this.state.date

        var file = files[files.length-1]
        var user =  this.state.user
        var metadata = {
            customMetadata: {
                'user': user.uid,
            }
        };

        var storageRef = storage.ref()




        var uploadTask = storageRef.child('forms/' + file.key).put(file,metadata);
        var path = auth.currentUser.uid


// Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    // ...

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    // console.log('File available at', downloadURL);
                    var formGuide = db.collection("researcher").doc(user.uid).collection("RequestPurchase").doc(this.state.date).set({
                        name: file.key,
                        time: new Date().toLocaleString(),
                        link:downloadURL,
                        nameR:this.state.nameR,
                        date:this.state.date,

                    }).then(()=>{
                        var newFiles = files.slice(0, files.length-1);
                        console.log("upload end")
                        this.upload(newFiles)
                    }).catch((err)=>{
                        storage.refFromURL(downloadURL).delete()
                        var newFiles = files.slice(0, files.length-1);
                        this.upload(newFiles)
                    })


                });
            }

        );

    }

    async handleChange(event)
    {
        var form=''

        // var name = event.target.name;
        var value = event.target.value;
        //var e = event.target

        console.log('form ' ,form);
        console.log('value ' ,value);

        return value

    }
    async handleChangeDate(event)
    {
        var name = event.target.name;
        var value = event.target.value;
        if(name === 'date')
        {
            this.setState({date:value});
            this.state.date=value
        }
        console.log('name ' ,name);
        console.log('value ' ,value);
    }
    async handleChangeNameR(event)
    {
        var name = event.target.name;
        var value = event.target.value;


        if(name === 'q1')
        {
            this.setState({nameR:value});
            this.state.nameR=value
        }

    }

    render() {
        const files = this.state.files.map(file => (
            <li key={file.name}>
                {file.name}
                {/*{console.log(file)}*/}
            </li>
        ));

        return (
            <Dropzone onDrop={this.onDrop}>
                {({getRootProps, getInputProps}) => (
                    <section className="container">
                        <div {...getRootProps({className: 'dropzone'})}>

                            <div style={{backgroundColor: "#a0a0a0", width: 400, height: 170,textAlign: 'center', padding: '100px 0px 0px 0px'}}>

                                יש לגרור לכאן את הקבצים
                                <br/>
                                <br/>
                                או ללחוץ כאן

                                <input {...getInputProps()} />
                            </div>
                        </div>
                        <aside>
                            {

                                files.length <= 0 ?
                                    <h4></h4>:
                                    <div>
                                        {
                                            this.state.maxFile!=undefined && files.length > this.state.maxFile?
                                                <h4> מספר הקבצים המקסימלי להעלאה הוא {this.state.maxFile}</h4>:
                                                <div>
                                                    <h4> מספר הקבצים להעלאה - {files.length}</h4>
                                                    <ul>{files}</ul>
                                                    <label id="date" className="title-input">הכנס את תאריך הבקשה:</label>
                                                    <input type="date" className="form-control" id="insert-date" name="date" onChange={this.handleChangeDate} required/>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            inputProps={{style: {textAlign: 'center'}}}
                                                            id="q1i"
                                                            name="q1"
                                                            type="tel"
                                                            autoComplete="off"
                                                            onChange={(e) => {
                                                                this.handleChangeNameR(e)
                                                            }}
                                                            variant="standard"
                                                            fullWidth
                                                            label="שם המחקר"
                                                        />
                                                    </Grid>
                                                    <button onClick={()=>{
                                                        this.upload(files)
                                                    }}>העלה קבצים</button>
                                                </div>
                                        }

                                    </div>
                            }


                        </aside>
                    </section>
                )}
            </Dropzone>
        );
    }
}


export default  DropzoneFiles2 ;
