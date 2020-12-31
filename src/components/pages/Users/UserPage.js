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
    console.log("NextPage_data"+data)
    console.log("NextPage_path"+path)
    console.log("NextPage_prop"+prop)

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
                console.log("type"+type)


                if(type!=='Tester')
                {

                        this.loadUser(type)
                }
                // if(href[4] === user.uid && (href[3] === type||type==='Tester'))
                // {

                this.setState({loadPage:true})
                this.loadSpinner(false,"")
                this.render()
                return
                // }
                // else
                // {
                //
                //     // window.location.href = `/${type}/${href[4]}`;
                //     alert('המנהל עדיין לא אישר את הבקשה')
                //     window.location.href = '/Login';
                //     return
                // }

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
        // console.log("this:"+this.state)
        // console.log("this.state.loadPage:"+this.state.loadPage)
        // console.log("this.state.name:"+this.state.name)
        // console.log("this.state.data:"+this.state.data)
        // console.log("this.state.email:"+this.state.email)
        // console.log("this.state.user.data:"+this.state.user.data)
        //
        // console.log("user:"+this.state.user)
        // // if(this.state.user.email)
        //     console.log("this is email : "+this.state.user.email)
        // console.log("hhhhhhhhhhhh: ")

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


                            {/*<button onClick={() => this.loadUser("Student")}>Enter Student</button>*/}
                            <button onClick={() => this.loadUser("Researcher")}>Enter Researcher</button>
                            <button onClick={() => this.loadUser("Manager")}>Enter Manager</button>
                            <button onClick={() => this.loadTempPage("TempStudent")}>Enter TempStudent</button>
                            {/*<button onClick={() => this.loadTempPage("TempGuide")}>Enter TempGuide</button>*/}
                            {/*<button onClick={() => this.loadTempPage("TempManager")}>Enter TempManager</button>*/}

                            <button onClick={() => this.loadPage(true)}>loading page</button>
                            <button onClick={() => this.loadPage(false)}>unloading page</button>

                            {!this.state.loading ? "" :
                                <div className="sweet-loading">
                                    <ClipLoader style={{
                                        backgroundColor: "rgba(255,255,255,0.85)",
                                        borderRadius: "25px"
                                    }}
                                        //   css={override}
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
                            //   css={override}
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
            // pathname: `/Temp${page}`,
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
                {/*    <span>*/}
                {/*    {isLoaded ? <Users user={user} isLoaded={isLoaded}/> : <div/>}*/}
                {/*</span>*/}
            </div>
        )
    }

}


export  default  UserPage;