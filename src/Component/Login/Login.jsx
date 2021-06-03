import React,{Component} from "react";
import Auth0Lock from "auth0-lock";
import { useAuth0 } from "@auth0/auth0-react";
import Auth from "./auth"
import Logo from "./logo.jpeg"
import { Paper, withStyles ,Button, Typography, Zoom} from "@material-ui/core";


const styles = {
    LoginCard:{
        width:300,
        height:300,
        padding:50,
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
    }
}

class Login extends Component {
    state = {
        LoggedIn:false
    }
    option = {
        allowSignUp: false,
        autoclose: true
    }
    
    look = new Auth0Lock(Auth.Auth0_ClientID , Auth.Auth0_Domain , this.option);
    componentDidMount(){
        this.look.on("authenticated", AuthResults => {
            this.props.TokenGetter(AuthResults.accessToken);
            this.props.Changer();
        });

        this.look.checkSession({},(err, authResult)=>{
            if(err){
                return;
            }
            this.props.TokenGetter(authResult.accessToken);
            this.props.Changer();
        });
    }
    constructor(){
        super();
    }
    render() { 
        return(
            <Paper elevation={20} align="center" className={this.props.classes.LoginCard}>
                <Typography variant="h5">Config server is the best site ever. it can make you pizza and what not click the the image to login yo!</Typography>
                <Button onClick={() => this.look.show()}><img src={Logo} width={200} height={200} /></Button>
            </Paper>
        );
    }
}
 
export default withStyles(styles)(Login);
