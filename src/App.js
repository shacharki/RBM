import logo from './logo.svg';
import './App.css';
import {auth} from './firebase/firebase';





function App() {
  console.log(auth.currentUser)
var a = auth.currentUser.email;
    return (
      <div>
    <h1>
      שלום
       {a}
       סוף בדיקה
    </h1>
          <button onClick={()=>{register()}}>register</button>
          <button onClick={()=>{login()}}>login</button>
      </div>
  );

    function register()
    {
       auth.createUserWithEmailAndPassword("shachar0528@gmail.com", "0528312sh").then(res=>{
           if(res)
           {
               console.log("sucsses")
               console.log("you register")
           }
           else
           {
               console.log( "empty")
           }
       }).catch(err=>{
           console.log(err)
       })
    }
    function login()
    {
        auth.signInWithEmailAndPassword("shachar0528@gmail.com", "0528312sh").then(res=>{
            if(res)
            {
                console.log("sucsses")
            }
            else
            {
                console.log( "empty")
            }
        }).catch(err=>{
            console.log(err)
        })
    }
}


export default App;
