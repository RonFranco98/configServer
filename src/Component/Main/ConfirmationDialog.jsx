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

class ConfirmationDialog extends Component {
  render() {
  let {ChangedApps} = this.props
  let appList = ChangedApps.map(item => {return <ListItem>{item}</ListItem>})
    return (
      <Dialog 
      open={this.props.isConfirmationDialogOpen} 
      onClose={this.props.onRejectConfirmation} 
      aria-labelledby="form-dialog-title" 
      maxWidth="md" 
      fullWidth={true}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">are you utterly sure?</DialogTitle>
        <DialogContent>
          <DialogContentText >Are you absulotly sure you want to change configuration to the next apps</DialogContentText>
          <List>
              {appList}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRejectConfirmation()} className={this.props.classes.discardButton} variant="contained">
            dude discard quickly !!
          </Button>
          <Button onClick={() => this.props.onConfirmation()} className={this.props.classes.commitButton} variant="contained" autoFocus>
            hello?? i am green i mean confirmation
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
 
export default withStyles(style)(ConfirmationDialog);