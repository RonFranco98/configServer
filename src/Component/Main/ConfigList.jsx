import React, { Component } from 'react';
import TreeItem from '@material-ui/lab/TreeItem';
import { List, ListItem, withStyles } from '@material-ui/core';

class ConfigList extends Component {
    state = { Apps:[] }
    componentDidMount = () =>{
        this.setState({Apps:this.props.appsToDisplay})
    }
    render() {
        let listItems = this.AppsToItems(this.props.appsToDisplay)
        return (
            <List>{listItems}</List>
        );
    }
    
    AppsToItems = (arr) =>{
        if(!arr){
            return;
        }
        let items = arr.map(item => {
            return <ListItem button onClick={() => this.props.appSelector(item)}>{item}</ListItem>
        })
        return items;
    }
}
 
export default ConfigList;