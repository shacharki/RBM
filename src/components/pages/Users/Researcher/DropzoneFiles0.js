// //העלאת דוח מדעי של החוקר
// import React, {Component} from 'react';
// import firebase, {auth, db, storage} from "../../../../firebase/firebase";
// import Dropzone from 'react-dropzone';
//
//
//
// class DropzoneFiles extends Component {
//     constructor(props) {
//         super(props);
//         this.onDrop = (files) => {
//             this.setState({files})
//         };
//         this.state = {
//             teamPath:"",
//             report:false,
//             page:'menu',
//             files: [],
//             user: props.location,
//
//             maxFile:5,
//             date:"",
//             prevDate:'',
//             viewResearcher: false,
//             form : {
//                 date:"",
//                 team:"",
//                 name:"",
//             }
//         };
//         this.handleChangeDate = this.handleChangeDate.bind(this)
//         this.handleSubmit = this.handleSubmit.bind(this)
//         this.handleChange1 = this.handleChange1.bind(this)
//         this.approvResearcher = this.approvResearcher.bind(this)
//         this.dropzoneFiles = this.dropzoneFiles.bind(this)
//
//         this.dropzoneFiles = this.dropzoneFiles.bind(this)
//
//
//     }
//
//     async componentDidMount() {
//         auth.onAuthStateChanged(async user => {
//             if (user) {
//                 this.setState({user:user})
//             }
//         })
//     }
//
//
//     async upload(files,form)
//     {
//
//         if(files!==null && files!==undefined&& files.length<=0)
//             return;
//
//         var file = files[files.length-1]
//         var user =  this.state.user
//         var date = this.state.date
//         var metadata = {
//             customMetadata: {
//                 'user': user.uid,
//             }
//         };
//
//         var storageRef = storage.ref()
//         var uploadTask = storageRef.child('forms/' + file.key).put(file,metadata);
//         var path = user.uid
//
// // Listen for state changes, errors, and completion of the upload.
//         uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
//             (snapshot) => {
//                 // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
//                 var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//                 // console.log('Upload is ' + progress + '% done');
//                 switch (snapshot.state) {
//                     case firebase.storage.TaskState.PAUSED: // or 'paused'
//                         console.log('Upload is paused');
//                         break;
//                     case firebase.storage.TaskState.RUNNING: // or 'running'
//                         console.log('Upload is running');
//                         break;
//                 }
//             },
//             (error) => {
//                 // A full list of error codes is available at
//                 // https://firebase.google.com/docs/storage/web/handle-errors
//                 switch (error.code) {
//                     case 'storage/unauthorized':
//                         // User doesn't have permission to access the object
//                         break;
//                     case 'storage/canceled':
//                         // User canceled the upload
//                         break;
//
//                     // ...
//
//                     case 'storage/unknown':
//                         // Unknown error occurred, inspect error.serverResponse
//                         break;
//                 }
//             },
//             () => {
//                 // Upload completed successfully, now we can get the download URL
//                 uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
//                     // console.log('File available at', downloadURL);
//                     try{
//                         var researcher = db.collection("researcher").doc(path)
//                         // console.log("form1",form)
//                         var newDate = researcher.collection("ScientificReport").doc(this.state.date);
//                         // console.log("form.date",form.date)
//                         // console.log("form",form)
//
//                         newDate.set({
//                             //form: this.state,
//                             date:this.state.date,
//                         }).then(async ()=>{
//                             await this.addDataToTeam(researcher,this.state.date);
//                             alert("הטופס נשלח בהצלחה")
//
//                         })
//
//                     }catch(error) {
//                         console.log("err2")
//
//                         alert(error.message)
//                     }
//                     var researcher1 = db.collection("researcher").doc(user.uid).collection("ScientificReport").doc(this.state.date).set({
//                         name: file.key,
//                         time: new Date().toLocaleString(),
//                         date:this.state.date,
//                         link:downloadURL,
//
//                     }).then(()=>{
//                         // this.addDataToTeam(researcher,this.state.date);
//                         var newFiles = files.slice(0, files.length-1);
//                         console.log("upload end")
//                         this.upload(newFiles,form)
//                     }).catch((err)=>{
//                         storage.refFromURL(downloadURL).delete()
//                         var newFiles = files.slice(0, files.length-1);
//                         this.upload(newFiles,form)
//                     })
//
//
//
//                 });
//
//
//                 //         db.collection("researcher").doc(user.uid).collection("ScientificReport").add({
//                 //         name: file.key,
//                 //         time: new Date().toLocaleString(),
//                 //         date:this.state.date,
//                 //         link:downloadURL,
//                 //
//                 //     }).then(()=>{
//                 //         var newFiles = files.slice(0, files.length-1);
//                 //         console.log("upload end")
//                 //         this.upload(newFiles)
//                 //     }).catch((err)=>{
//                 //         storage.refFromURL(downloadURL).delete()
//                 //         var newFiles = files.slice(0, files.length-1);
//                 //         this.upload(newFiles)
//                 //     })
//                 //     console.log('file.key ' ,file.key);
//                 //     console.log('new Date().toLocaleString() ' ,new Date().toLocaleString());
//                 //     console.log('this.state.date ' ,this.state.date);
//                 //     console.log('downloadURL ' ,downloadURL);
//                 //
//                 //
//                 // });
//             }
//
//         );
//
//     }
//     approvResearcher(researcher)
//     {
//
//         var researchers =  this.state.researchers;
//         for(var i=0;i<researchers.length;i++)
//         {
//             if(researchers[i] === researcher)
//             {
//                 researchers[i].approv = !researchers[i].approv;
//                 this.setState({researchers:researchers})
//                 return
//             }
//         }
//     }
//     async handleSubmit(event)
//     {
//         if(!this.state.date) {
//             return;
//         }
//         if(this.state.date === this.state.prevDate) {
//             this.setState({viewResearcher: !this.state.viewResearcher});
//             return ;
//         }
//         this.loadSpinner(true,"מעדכן נתונים חדשים")
//         this.setState({prevDate:this.state.date});
//         // console.log("in");
//         var ScientificReport = (await db.collection("researcher").doc(auth.currentUser.uid).get()).data().type;
//         const collection = await db.collection('researcher').where("ScientificReport","==",ScientificReport).get()
//         const researchers = [];
//         const date = this.state.date
//         const collectionPromisesTeam = collection.docs.map( async function(doc) {
//             var ref =await db.collection("researcher").doc(doc.id).collection("ScientificReport").doc(date).get()
//             var user = await db.collection("researcher").doc(doc.id).get()
//             return [ref,user]
//
//         })
//
//         Promise.all(collectionPromisesTeam).then(res => {
//             // console.log("end prommis");
//             res.forEach(doc=>{
//                 var approv = false;
//                 var Request = ''
//                 if(doc[0].exists) {
//                     approv = true;
//                     Request = doc[0].data().dropzoneFiles;
//                 }
//                 var data = doc[1].data();
//                 var ref = doc[1].id;
//                 researchers.push({data,approv,ref,Request})
//             })
//             let i;
//             // console.log(researchers.length)
//             this.setState({viewResearcher: !this.state.viewResearcher});
//             for (i=0;i<researchers.length;i++)
//             {
//                 if(!this.state.researchers)
//                 {
//                     this.setState({researchers: researchers});
//                     this.loadSpinner(false)
//                     return
//                 }
//                 else if(researchers[i].approv!==this.state.researchers[i].approv)
//                 {
//                     this.setState({researchers: researchers});
//                     this.loadSpinner(false)
//                     return
//                 }
//
//             }
//             this.loadSpinner(false)
//         });
//
//
//     }
//     async handleChange(event)
//     {
//         var form=''
//
//         // var name = event.target.name;
//         var value = event.target.value;
//         //var e = event.target
//
//         console.log('form ' ,form);
//         console.log('value ' ,value);
//
//         return value
//
//     }
//     async handleChange1(event)
//     {
//         var form=''
//
//         var name = event.target.name;
//         var value = event.target.value;
//         var e = event.target
//         // console.log("name2",name)
//         // console.log("value2",value)
//         // console.log("e2",e)
//
//         if(name === 'date' && event.target.value!=='' )
//         {
//             // console.log("1111111111111")
//
//             this.loadSpinner(true,"טוען נתוני חוקר")
//             var formResearcher = await db.collection("researcher").doc(auth.currentUser.uid).collection("ScientificReport").doc(event.target.value).get()
//
//             if(formResearcher.data())
//             {
//                 // console.log("222222222222222")
//                 this.setState({form:formResearcher.data().form})
//             }
//             else
//             {
//                 // console.log("33333333333333")
//                 var researcherData= await db.collection("researcher").doc(auth.currentUser.uid).get()
//                 form ={}
//                 form[name] = value;
//                 form['name']=researcherData.data().fname+' '+researcherData.data().lname;
//                 // form['team']=researcherData.data().teamName
//                 this.setState({form:form})
//             }
//         }
//         else
//         {
//             // console.log("44444444444444")
//             form = this.state.form
//             form[name] = value;
//             this.setState({form:form})
//         }
//         this.loadSpinner(false)
//
//     }
//     async handleChangeDate(event)
//     {
//         var name = event.target.name;
//         var value = event.target.value;
//         if(name === 'date')
//         {
//             this.setState({date:value});
//             this.state.date=value
//         }
//         console.log('name ' ,name);
//         console.log('value ' ,value);
//     }
//     async addDataToTeam(researcher,date)
//     {
//         console.log("researcher2",researcher)
//         console.log("date",date)
//
//         var user = firebase.auth().currentUser;
//         console.log("user",user)
//
//         var formResearcher = ( researcher.collection('ScientificReport').doc(date).get()).ref;
//         console.log("aaaaaaaaaaaaaa")
//         console.log("formResearcher",formResearcher)
//
//         try{
//             // console.log("researcher",researcher)
//             //
//             // console.log("researcher.get()",researcher.get())
//             //
//             // console.log("researcher.get()).data()",researcher.get().data())
//             var team = (researcher.get()).data();
//             var name =(team.fname + " "+team.lname);
//             // console.log("name2",name)
//             // console.log("team2",team)
//             console.log("bbbbbbbbbbbbbb")
//
//             var teamCollection = db.collection("Data").doc(team.team.id)
//             // var Collection = await teamCollection.collection("Requests").doc(name)
//             var newDate = teamCollection.collection("ScientificReports").doc(date)
//             // var newDate = Collection.collection(date).doc();
//             var doc =   newDate.get()
//             var {year,month,day} = this.parser(date)
//             var fullDate = new Date()
//             fullDate.setTime(0)
//             fullDate.setFullYear(year,month-1,day)
//
//             // console.log("team.team.id",team.team.id)
//             // console.log("teamCollection",teamCollection)
//             // console.log("newDate",newDate)
//             // console.log("fullDate",fullDate)
//             // console.log("formResearcher",formResearcher)
//
//             // var temp = newDate.set({
//             //     date:fullDate,
//             //     RequestResearcher: formResearcher,
//             //     nameResearcher: team.fname + " "+team.lname,
//             //
//             // })
//             //
//             // // db.collection("Data").doc().set({name})
//             // await db.collection("Data").doc().collection(name).set(temp).then(()=>{
//             //         alert("הדוח נוסף")
//             //         return true;
//             //     }
//             // ).catch((e)=>{
//             //     alert("הדוח לא הוסף")
//             //     return false;
//             // })
//
//
//             if(!doc.exists){
//                 console.log("cccccccccccccc")
//
//                 // console.log("doc.exists",doc.exists)
//                 // console.log("doc",doc)
//
//                 newDate.set({
//                     date:fullDate,
//                     RequestResearcher: formResearcher,
//                     nameResearcher: team.fname + " "+team.lname,
//                     uid: user.uid
//
//                 })
//             }
//             else {
//
//                 // console.log("doc.exists",doc.exists)
//                 // console.log("doc",doc)
//                 console.log("ddddddddddddddddddddddd")
//
//                 newDate.update({
//                     date:fullDate,
//                     RequestResearcher: formResearcher,
//                     uid: user.uid
//
//                 })
//             }
//         }catch(error) {
//             alert(error.message)
//             console.log("22222222222222")
//         }
//         console.log("eeeeeeeeeeeeeeeee")
//
//     }
//     dropzoneFiles(event,researcher)
//     {
//         var researchers = this.state.researchers;
//         // console.log(event.target.value);
//         for(var i=0;i<researchers.length;i++)
//         {
//             if(researchers[i] === researcher)
//             {
//                 researchers[i].Request = event.target.value
//                 this.setState({researchers: researchers})
//                 return
//             }
//         }
//     }
//     render() {
//         const files = this.state.files.map(file => (
//             <li key={file.name}>
//                 {file.name}
//                 {/*{console.log(file)}*/}
//             </li>
//         ));
//
//         return (
//
//             <Dropzone onDrop={this.onDrop}>
//                 {({getRootProps, getInputProps}) => (
//
//                     <section className="container">
//
//                         <div {...getRootProps({className: 'dropzone'})}>
//
//                             <div style={{backgroundColor: "#a0a0a0", width: 400, height: 170,textAlign: 'center', padding: '100px 0px 0px 0px'}}>
//
//                                 יש לגרור לכאן את הקבצים
//                                 <br/>
//                                 <br/>
//                                 או ללחוץ כאן
//
//                                 <input {...getInputProps()} />
//                             </div>
//                         </div>
//                         <aside>
//                             {
//
//                                 files.length <= 0 ?
//                                     <h4></h4>:
//                                     <div>
//                                         {
//                                             this.state.maxFile!=undefined && files.length > this.state.maxFile?
//                                                 <h4> מספר הקבצים המקסימלי להעלאה הוא {this.state.maxFile}</h4>:
//                                                 <div>
//                                                     <h4> מספר הקבצים להעלאה - {files.length}</h4>
//                                                     <ul>{files}</ul>
//                                                     <label id="date" className="title-input">הכנס את תאריך הדוח:</label>
//                                                     <input type="date" className="form-control" id="insert-date" name="date" onChange={this.handleChangeDate} required/>
//
//                                                     <button onClick={()=>{
//                                                         this.upload(files,this.state.form)
//                                                     }}>העלה קבצים</button>
//                                                 </div>
//                                         }
//
//                                     </div>
//                             }
//
//
//                         </aside>
//                     </section>
//                 )}
//             </Dropzone>
//
//         );
//     }
// }
//
//
// export default  DropzoneFiles ;
