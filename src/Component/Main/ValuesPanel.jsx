import React , {Component} from "react"
import { Paper, Typography, Divider, makeStyles, withStyles } from "@material-ui/core"
import ValuesTable from "./ValuesTable"

const styles = {
    root:{
        height:"40vh",
        maxHeight:"40vh",
        overflow:"auto"
    }
}

class ValuePanel extends Component{
    state = {

    }
    render(){
        return(
            <Paper elevation={10} align="center" className={this.props.classes.panel}>
                <Typography variant="overline">
                    Values
                </Typography>
                <Divider />
                <div className={this.props.classes.root}>
                    <ValuesTable selectedApp={this.props.selectedApp} selectedEnv={this.props.selectedEnv} UniqueTableKeys={this.props.UniqueTableKeys} dataForTable={this.props.dataForTable} openDialog={this.props.openDialog}/>
                </div>
            </Paper>
        );
    }
}
export default withStyles(styles)(ValuePanel);