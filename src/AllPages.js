import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import PageHome from './components/pages/PageHome/PageHome';
import SignUp from './components/pages/SignUp/SignUp';
import Login from './components/pages/Login/Login';
import resetPassword from './components/pages/Login/resetPassword';

import UserPage from "./components/pages/Users/UserPage";
import App2 from "./App2";

import Researcher from './components/pages/Users/Researcher/Researcher';
import RequestPurchase from "./components/pages/Users/Researcher/RequestPurchase";
import ScientificReport from "./components/pages/Users/Researcher/ScientificReport";
import ChatResearcher from "./components/pages/Users/Researcher/ChatResearcher";
import ChatR from "./components/pages/Users/Researcher/ChatR";
// import SearchReports from "./components/pages/Users/Researcher/ScientificReport/SearchReports";


import Managers from './components/pages/Users/Manager/Manager';
import mngRequestPurchase from "./components/pages/Users/Manager/ManagerRequestPurchase/mngRequestPurchase";
import UpdatesFirebase from "./components/pages/Users/Manager/UpdatesFirebase";
import financialReports from "./components/pages/Users/Manager/financialReports";
import ResearchBudgets from "./components/pages/Users/Manager/ResearchBudgets";
import ChatManager from "./components/pages/Users/Manager/ChatManager";
import ChatM from "./components/pages/Users/Manager/ChatM";

import BudgetSpreadsheet from "./components/pages/Users/Manager/BudgetSpreadsheetComponent/BudgetSpreadsheet";

import Budget from "./components/pages/Users/Manager/Budget";
import UserApproval from "./components/pages/Users/Manager/UserApproval";

import Profile from "./components/pages/Users/profile";
import Wait from "./components/pages/Users/await";
import notFound from "./404";
import ManageRequestPurchase from './components/pages/Users/Researcher/ManageRequestPurchase/ManageRequestPurchase';




function LoadPage() {
    return (
        <div>
            <Router>
                <Switch>
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
                    <Route exact path="/Researcher/:id/ChatResearcher" component={ChatResearcher} />
                    <Route exact path="/Researcher/:id/ChatR" component={ChatR} />
                    <Route exact path="/Researcher/:id/Budget" component={Budget} />

                    <Route exact path="/Manager/:id" component={Managers} />
                    <Route exact path="/Manager/:id/UserApproval" component={UserApproval} />
                    <Route exact path="/Manager/:id/profile" component={Profile} />
                    <Route exact path="/Manager/:id/mngRequestPurchase" component={mngRequestPurchase} />
                    <Route exact path="/Manager/:id/UpdatesFirebase" component={UpdatesFirebase} />
                    <Route exact path="/Manager/:id/financialReports" component={financialReports} />
                    <Route exact path="/Manager/:id/ResearchBudgets" component={ResearchBudgets} />
                    <Route exact path="/Manager/:id/ChatManager" component={ChatManager} />
                    <Route exact path="/Manager/:id/ChatM" component={ChatM} />
                    <Route exact path="/Manager/:id/ScientificReport" component={ScientificReport} />

                    <Route exact path="/Manager/:id/Budget" component={Budget} />
                    <Route exact path="/Manager/:id/BudgetSpreadsheet" component={BudgetSpreadsheet} />


                </Switch>
            </Router>
        </div>
    );
}

export default LoadPage;


{ <Route exact path='/home' exact component={PageHome} /> }
// {<Route exact path="/login/:id" component={Home} />}