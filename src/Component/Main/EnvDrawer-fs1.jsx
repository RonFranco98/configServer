import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ConfigPanel from "./ConfigPanel"
import ValuesPanel from "./ValuesPanel"
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeView from "./TreeView"
import { Divider, Button, Paper, Fab, Grid } from '@material-ui/core';
import Auth from "../Login/auth"
import Auth0Lock from "auth0-lock";
import JsonView from './JsonView';
import { PortraitSharp } from '@material-ui/icons';
import JsonPanel from './JsonPanel';
const drawerWidth = 400;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor:"#2196f3"
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  TreeViewContainer:{
    paddingLeft:20
  },
  ConfigPaper:{
    color:"red"
  },
  NavTitle:{
    flexGrow:1
  },
  logoutButton:{
    color:"white"
  },
  commitButton:{
    position:"fixed",
    bottom:15,
    right:15,
    backgroundColor:"#00e676",
    color:"white",
    fontSize:"150%",
    '&:hover':{
      backgroundColor:"#00c853"
    }
  },
  discardButton:{
    position:"fixed",
    bottom:15,
    left:15,
    backgroundColor:"#f44336",
    color:"white",
    fontSize:"150%",
    '&:hover':{
      backgroundColor:"#e53935"
    }
  }
}));

export default function EnvDrawer(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const look = new Auth0Lock(Auth.Auth0_ClientID , Auth.Auth0_Domain);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <Button
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            Environments
          </Button>
          <Typography variant="h6" noWrap className={classes.NavTitle}>
            Config Server
          </Typography>
          <Button className={classes.logoutButton} onClick={() => look.logout()}>Logout</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography>Environments</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <div className={classes.TreeViewContainer}>
          <TreeView AccessToken={props.AccessToken}
          EnvSelector={props.EnvSelector}
          envTreeGetter={props.envTreeGetter}
          closer={handleDrawerClose}/>
        </div>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        <Grid container spacing={3}>
          <Grid item xs={6}><ConfigPanel appsToDisplay={props.appsToDisplay} appSelector={props.appSelector}/></Grid>
          <Grid item xs={6}><JsonPanel completeAppJson={props.completeAppJson}/></Grid>
          <Grid item xs={12}><ValuesPanel selectedApp={props.selectedApp} selectedEnv={props.selectedEnv} dataForTable={props.dataForTable} UniqueTableKeys={props.UniqueTableKeys} openDialog={props.openDialog}/></Grid>
        </Grid>
        <Fab onClick={() => props.onCommit()} variant="extended"  className={classes.commitButton}>commit</Fab>
        <Fab onClick={() => props.onDiscard()} variant="extended"  className={classes.discardButton}>discard</Fab>
      </main>
    </div>
  );
}
