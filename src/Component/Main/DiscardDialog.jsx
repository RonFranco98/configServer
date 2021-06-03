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

class DiscardDialog extends Component {
  render() {
  let {ChangedApps} = this.props
  let appList = ChangedApps.map(item => {return <ListItem>{item}</ListItem>})
    return (
      <Dialog 
      open={this.props.isDiscardDialogOpen} 
      onClose={this.props.onRejectDiscard} 
      aria-labelledby="form-dialog-title" 
      maxWidth="md"
      fullWidth={true}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      >
        <DialogTitle id="form-dialog-title">are you utterly sure?</DialogTitle>
        <DialogContent>
          <DialogContentText >Are you absulotly sure you want to discard changes to the next apps</DialogContentText>
          <List>
              {appList}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRejectDiscard()} className={this.props.classes.discardButton} variant="contained">
            No
          </Button>
          <Button onClick={() => this.props.onConfirmeDiscard()} className={this.props.classes.commitButton} variant="contained" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(style)(DiscardDialog);