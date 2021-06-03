import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import { DialogContent, DialogContentText, FormControlLabel, TextField, Switch, DialogActions, withStyles } from '@material-ui/core';

const style = {
  commitButton:{
    backgroundColor:"#4caf50",
    color:"white",
    '&:hover':{
      backgroundColor:"#43a047"
    }
  },
  discardButton:{
    backgroundColor:"#f44336",
    color:"white",
    '&:hover':{
      backgroundColor:"#e53935"
    }
  }
}

class ValueChangeDialog extends Component {
  state = {
    newValue:undefined
  }
  render() {
    let {app , env , tableEnv , path , val} = this.props
    env = this.findEnv(tableEnv , env)
    let input = this.getCorrectInputComponent(val);
    return (
      <Dialog 
      open={this.props.isOpenDialog} 
      onClose={this.props.closeDialog} 
      aria-labelledby="form-dialog-title" 
      maxWidth="md" 
      fullWidth={true}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">Change Value</DialogTitle>
        <DialogContent>
          <DialogContentText >App: {app}</DialogContentText>
          <DialogContentText>Environment: {env}</DialogContentText>
          <DialogContentText>Value Path: {path}</DialogContentText>
          <DialogContentText>Value: {val}</DialogContentText>
          {input}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.discardDialog()} className={this.props.classes.discardButton} variant="contained">
            discard
          </Button>
          <Button onClick={() => this.props.commitDialog(env, app, this.state.newValue , path)} className={this.props.classes.commitButton} variant="contained" autoFocus>
            commit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  findEnv(tableEnv , env){
    if(!env){return}
    let envArr = env.split("/")
    let key = ""
    for(let i = 0; i < envArr.length; i++){
      key += envArr[i]
      if(envArr[i] == tableEnv){
        return key
      }
      key += "/"
    }
  }
  getCorrectInputComponent = (val) =>{
    if(typeof val == "boolean"){
      return(<FormControlLabel
        control={
          <Switch
            checked={val}
            color="primary"
          />
        }
        label={val}
      />)
    }
    if(typeof val == "string" || val == undefined){
      return(<TextField
          onChange={this.onTextChange}  
          label="value"
          style={{ margin: 8 }}
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          defaultValue={val}
          margin="normal"
        />)
    }
    if(typeof val == "number"){
      return(<TextField
        onChange={this.onTextChange}
        label="value"
        type="number"
        style={{ margin: 8 }}
        defaultValue={val}
        margin="normal"
        variant="outlined"
      />)
    }
  }
  onTextChange = (event) => {
    this.setState({newValue: event.target.value})
  }
}
 
export default withStyles(style)(ValueChangeDialog);