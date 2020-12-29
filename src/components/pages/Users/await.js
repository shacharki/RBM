import React from "react";


class Wait extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: props.location,
        };
    }


    loadPage(event){
        this.setState({loading:event})
    }

    async componentDidMount() {
        alert('המנהל עדיין לא אישר את הבקשה')
        window.location.href = '/Login';
        return
    }

    render() {

        return (
            <div className="sec-design">
            </div>

        );
    }

}


export  default  Wait;