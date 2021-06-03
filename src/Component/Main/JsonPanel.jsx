import React , {Component} from "react"
import { Paper, Typography, Divider, makeStyles, withStyles, Switch, MenuItem, Select, FormControl, InputLabel } from "@material-ui/core"
import ConfigList from "./ConfigList"
import JsonView from "./JsonView"

const styles = {
    root:{
        height:"30vh",
        maxHeight:"30vh",
        overflow:"auto"
    },
    title:{
        float:"left",
        width:"33.3333%",
        textAlign:"center"
    },
    titleContainer:{
        display:"inline"
    },


}
class JsonPanel extends Component{
    state = {
        
    }
    render(){
        let entites = this.props.entities;
        let entitiesKeys = entites ? Object.keys(entites) : []
        return(
            <Paper elevation={10} align="center">
                <select onChange={this.props.dropDownEntitieGetter}>
                    {
                        entitiesKeys.map(item => <option value={item}>{item}</option>)
                    }
                </select>
                <Typography variant="overline">Json</Typography>
                <button>Save</button>
                <Divider />
                <div className={this.props.classes.root}>
                    <JsonView Entitie={this.props.selectedJsonEntite} onChangeJSON={this.props.onEditInJsonView}/>
                </div>
            </Paper>
        );
    }
}
export default withStyles(styles)(JsonPanel);