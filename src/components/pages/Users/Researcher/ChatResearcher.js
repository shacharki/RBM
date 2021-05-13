import {ChatEngine} from "react-chat-engine";
import './Researcher.css'
import  React, {Component} from "react";

const ChatResearcher = ()=>{
    return(
        <ChatEngine height = "100vh" projectID = "602c6236-f326-43c1-9db1-314a8051ac06" userName="shachar" userSecret="123123"/>
    );
}

export default ChatResearcher;