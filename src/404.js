import React from "react";


export function BackPage(prop,data)
{
    window.location.href = '/User';
}

class notFound extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        var href=window.location.href.split('/')
        if(href[3]!=='404')
            window.location.href='/404'

    }


    render() {
        return(
            <div id="instructor" className="sec-design" dir="rtl">
                <h2>דף זה לא קיים</h2>
                <button id="feedback-button" className="btn btn-info" onClick={()=>{BackPage(this.props,this.state.user)}}>חזרה לדף הראשי</button>

            </div>
        )


    }
}


export  default  notFound;