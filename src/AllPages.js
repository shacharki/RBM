import React from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import PageHome from './components/pages/PageHome/PageHome';
//import SignUp from './components/pages/SignUp/signUp';
import Login from './components/pages/Login/Login';
import UserPage from "./components/pages/Users/UserPage";

//import resetPassword from './components/pages/Login/resetPassword';


function LoadPage() {
    return (
        <div>
            <Router>
                <Switch>
                    {/*<Route exact path="/">*/}
                    {/*    <Login />*/}
                    {/*</Route>*/}

                    <Route exact path="/" component={PageHome} />
                    <Route exact path="/Login" component={Login} />
                    <Route exact path="/User" component={UserPage} />

                    {/*<Route exact path="/SignUp" component={SignUp} />*/}


                </Switch>
            </Router>
        </div>
    );
}

export default LoadPage;


// {<Route exact path='/home' exact component={HomePage}/>}
// {<Route exact path="/login/:id" component={Home} />}