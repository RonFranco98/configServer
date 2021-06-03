import React, { Component } from "react"
import Login from "./Login/Login"
import Main from "./Main/Main";
import {Route , BrowserRouter, Switch, Redirect} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

class App extends Component{
    state = {
        LoggedIn:false
    }
    render(){
       if(this.state.LoggedIn == true){
            return(
                <Main AccessToken={this.state.accessToken} />
            )
        }
        else{
            return <Login Changer={this.changeLoggedIn} TokenGetter={this.getAccessToken} />;
        }
    }
    changeLoggedIn = () => {
        this.setState({LoggedIn:true});
    }
    getAccessToken = authAccessToken => {
        this.setState({accessToken:authAccessToken});
    }
}
export default App; 