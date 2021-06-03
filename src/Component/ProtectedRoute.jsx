import React from 'react';
import { Route ,Redirect } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import Error from "./Error"
function ProtectedRoute(props){
    const { isAuthenticated } = useAuth0();
    if(isAuthenticated){
        return <Route exact path={props.path} component={props.component} />
    }
    return <Route exact path={"/Error"} component={Error} />
}

export default ProtectedRoute;

