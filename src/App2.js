// import logo from './logo.svg';
import './App.css';
import {auth} from './firebase/firebase';
import {render} from "@testing-library/react";





function App2() {
    // var  a=auth.currentUser.email
    console.log(auth.currentUser)
    var a = '';
    if(auth.currentUser)
        a=auth.currentUser.email;
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
        auth.createUserWithEmailAndPassword("s@gmail.com", "123123").then(res=>{
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
        auth.signInWithEmailAndPassword("s@gmail.com", "123123").then(res=>{
            if(res)
            {
                console.log("sucsses")
                App2();
                return ;
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


export default App2;