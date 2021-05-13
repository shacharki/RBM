import React from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import PageHome from './components/pages/PageHome/PageHome';
import SignUp from './components/pages/SignUp/SignUp';
import Login from './components/pages/Login/Login';
import resetPassword from './components/pages/Login/resetPassword';

import UserPage from "./components/pages/Users/UserPage";
import App2 from "./App2";

import Researcher from './components/pages/Users/Researcher/Researcher';
 import RequestPurchase from "./components/pages/Users/Researcher/RequestPurchase";
import ScientificReport from "./components/pages/Users/Researcher/ScientificReport";
// import DropzoneFiles from "./components/pages/Users/Researcher/DropzoneFiles";


import Managers from './components/pages/Users/Manager/Manager';
import mngRequestPurchase from "./components/pages/Users/Manager/mngRequestPurchase";
import UpdatesFirebase from "./components/pages/Users/Manager/UpdatesFirebase";
import financialReports from "./components/pages/Users/Manager/financialReports";
import ResearchBudgets from "./components/pages/Users/Manager/ResearchBudgets";


import UserApproval from "./components/pages/Users/Manager/UserApproval";

import Profile from "./components/pages/Users/profile";
import Wait from "./components/pages/Users/await";
import notFound from "./404";




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
                    <Route exact path="/resetPassword" component={resetPassword} />


                    <Route exact path="/SignUp" component={SignUp} />
                    <Route exact path="/SignUp/:404" component={notFound} />

                    <Route exact path="/App2" component={App2} />

                    <Route exact path="/User" component={UserPage} />
                    <Route exact path="/User/:404" component={notFound} />

                    <Route exact path="/Researcher/:id" component={Researcher} />
                    <Route exact path="/Researcher/:id/profile" component={Profile} />
                    <Route exact path="/Researcher/:id/RequestPurchase" component={RequestPurchase} />
                    <Route exact path="/Researcher/:id/ScientificReport" component={ScientificReport} />
                    {/*<Route exact path="/Researcher/:id/DropzoneFiles" component={DropzoneFiles} />*/}



                    <Route exact path="/Manager/:id" component={Managers} />
                    {/*<Route exact path="/Manager/:id/:404" component={notFound} />*/}
                    <Route exact path="/Manager/:id/UserApproval" component={UserApproval} />
                    <Route exact path="/Manager/:id/profile" component={Profile} />
                    <Route exact path="/Manager/:id/mngRequestPurchase" component={mngRequestPurchase} />
                    <Route exact path="/Manager/:id/UpdatesFirebase" component={UpdatesFirebase} />
                    <Route exact path="/Manager/:id/financialReports" component={financialReports} />
                    <Route exact path="/Manager/:id/ResearchBudgets" component={ResearchBudgets} />



                </Switch>
            </Router>
        </div>
    );
}

export default LoadPage;


{<Route exact path='/home' exact component={PageHome}/>}
// {<Route exact path="/login/:id" component={Home} />}