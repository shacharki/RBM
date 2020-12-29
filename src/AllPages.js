import React from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import PageHome from './components/pages/PageHome/PageHome';
import SignUp from './components/pages/SignUp/SignUp';
import Login from './components/pages/Login/Login';
import UserPage from "./components/pages/Users/UserPage";
import App2 from "./App2";

import Researcher from './components/pages/Users/Researcher/Researcher';
import Managers from './components/pages/Users/Manager/Manager';
import Wait from "./components/pages/Users/await";
import notFound from "./404";


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
                    <Route exact path="/wait/:id" component={Wait} />
                    <Route exact path="/Login" component={Login} />
                    <Route exact path="/Login/:404" component={notFound} />

                    <Route exact path="/SignUp" component={SignUp} />
                    <Route exact path="/SignUp/:404" component={notFound} />

                    <Route exact path="/App2" component={App2} />

                    <Route exact path="/User" component={UserPage} />
                    <Route exact path="/User/:404" component={notFound} />

                    <Route exact path="/Researcher/:id" component={Researcher} />
                    <Route exact path="/Researcher/:id/:404" component={notFound} />

                    <Route exact path="/Manager/:id" component={Managers} />
                    <Route exact path="/Manager/:id/:404" component={notFound} />



                </Switch>
            </Router>
        </div>
    );
}

export default LoadPage;


{<Route exact path='/home' exact component={PageHome}/>}
// {<Route exact path="/login/:id" component={Home} />}