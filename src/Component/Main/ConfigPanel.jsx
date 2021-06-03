import React , {Component} from "react"
import { Paper, Typography, Divider, makeStyles, withStyles } from "@material-ui/core"
import ConfigList from "./ConfigList"

const styles = {
    root:{
        height:"30vh",
        maxHeight:"30vh",
        overflow:"auto"
    }
}
class ConfigPanel extends Component{
    state = {

    }
    render(){
        return(
            <Paper elevation={10} align="center">
                <Typography variant="overline">
                    Configuration
                </Typography>
                <Divider />
                <div className={this.props.classes.root}>
                    <ConfigList appsToDisplay={this.props.appsToDisplay} appSelector={this.props.appSelector}/>
                </div>
            </Paper>
        );
    }
}
export default withStyles(styles)(ConfigPanel);