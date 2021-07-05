// import logo from './logo.svg';
import React from 'react'
import './App.css';
import LoadPage from "./AllPages";
import { NotificationContainer } from 'react-notifications'
import 'react-notifications/lib/notifications.css';




function App() {
    return (
        <div>
            <LoadPage/>
            <NotificationContainer />
        </div>
    );
}


export default App;
