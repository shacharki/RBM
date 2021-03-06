import React from "react";
import {auth, getUser} from '../../../firebase/firebase'
import {Button} from "@material-ui/core";


import ClipLoader from "react-spinners/ClipLoader";



export function BackPage(prop,data)
{
    console.log("BackPage_data: "+data)

    prop.history.push({
        pathname: `${prop.history.goBack()}`,
        data: data,
    })

}
export function NextPage(prop,path,data)
{
    prop.history.push({
        pathname: `${prop.location.pathname}/${path}`,
        data: data,
    })
}


class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: [true,'נא להמתין הדף נטען'],
            loadPage:false,
            isLoad:false,
            user: props.location,
            error:false,
            loading: true,
            rule:"Manager",
        };
    }


    loadPage(event){
        this.setState({loading:event})
        //    this.render()
    }

    async componentDidMount() {
        auth.onAuthStateChanged(async user=>{

            if(user)
            {

                // console.log(user)
                var type =await getUser(user)
                await this.setState({
                    isLoad: true,
                    user: user,
                    type: type
                })


                if(type!=='Tester')
                {

                        this.loadUser(type)
                }

                this.setState({loadPage:true})
                this.loadSpinner(false,"")
                this.render()
                return

            }
            else {
                this.setState({
                    isLoad: true,
                })
                window.location.href = '/Login';
                return;

            }

        })

    }

    async  logout() {
        //מסך טעינה
        await auth.signOut();
        window.location.href = '/';
        //סיום מסך טעינה
    }

    render() {

        if (this.state.loadPage) {
            return (
                <div className="sec-design">
                    {!this.state.user.email ? (null) : (
                        <div>
                            {this.userPage()}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="secondary"
                                onClick={this.logout}>
                                Logout
                            </Button>

                            <button onClick={() => this.loadUser("Researcher")}>Enter Researcher</button>
                            <button onClick={() => this.loadUser("Manager")}>Enter Manager</button>

                            <button onClick={() => this.loadPage(true)}>loading page</button>
                            <button onClick={() => this.loadPage(false)}>unloading page</button>

                            {!this.state.loading ? "" :
                                <div className="sweet-loading">
                                    <ClipLoader style={{
                                        backgroundColor: "rgba(255,255,255,0.85)",
                                        borderRadius: "25px"
                                    }}
                                                size={150}
                                                color={"#123abc"}

                                    />
                                </div>
                            }

                        </div>
                    )}
                </div>
            );
        }
        else
            return (<div> {!this.state.spinner[0] ? "" :
                <div id='fr'>
                    {this.state.spinner[1]}
                    <div className="sweet-loading">
                        <ClipLoader style={{
                            backgroundColor: "rgba(255,255,255,0.85)",
                            borderRadius: "25px"
                        }}
                                    size={120}
                                    color={"#123abc"}

                        />
                    </div>
                </div>
            }</div>)
    }

    loadUser(page)
    {
        this.props.history.push({

            pathname: `/${page}/${this.state.user.uid}`,
            data: this.state.user // your data array of objects
        })
    }

    loadTempPage(page)
    {
        this.props.history.push({
            pathname: `/${page}`,
            data: this.state.user // your data array of objects
        })
    }

    loadSpinner(event,massage = ""){
        var spinner = []
        spinner.push(event)
        spinner.push(massage)
        this.setState({spinner:spinner})
    }

    userPage()
    {
        const { user , error} = this.state
        if(error)
            return (<h1>{error}</h1>)

        return(
            <div dir='rtl' >
                שלום {user.displayName}
            </div>
        )
    }

}


export  default  UserPage;