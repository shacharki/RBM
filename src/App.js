// import logo from './logo.svg';
import React from 'react'
import './App.css';
import LoadPage from "./AllPages";

import {auth} from './firebase/firebase';
import {render} from "@testing-library/react";





function App() {
    return (
        <div>
            <LoadPage/>
        </div>
    );
}


export default App;
