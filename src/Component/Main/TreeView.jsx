import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import {FolderOpen , Folder, AssignmentReturnOutlined} from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import { keys } from '@material-ui/core/styles/createBreakpoints';



const Styles ={
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  }
};
class EnvTree extends Component{
  state = {
    data:undefined,
    apps:undefined
  }

  async componentDidMount(){
    const Data = await this.fetchEnvs();
    this.preprocessTree(Data,"", undefined)
    this.setState({data:Data});
    this.props.envTreeGetter(Data)
  }
  preprocessTree(json, path , perent){
    if(!json){
      return;
    }
    var keys = Object.keys(json);
    for(var i = 0; i < keys.length; i++){
      var CurrKey = keys[i];
      if(CurrKey.substring(0,2) == "__"){
        continue;
      }
      let tempPath = (!path) ? CurrKey : path + "/" + CurrKey;
      json[CurrKey]["__Path__"] = tempPath;
      if(perent) {json[CurrKey]["__Perent__"] = perent}
      this.preprocessTree(json[CurrKey] , tempPath , CurrKey)
    }
  }
  render(){
    let TreeItems = this.CreateTreeItems(this.state.data);
    return (
      <TreeView
        className={this.props.classes.root}
        defaultCollapseIcon={<Folder />}
        defaultExpandIcon={<FolderOpen />}
      >
        {TreeItems}
      </TreeView>
    );
  }
  CreateTreeItems = json => {
    if(!json){
      return;
    }

    var keys = Object.keys(json);
    if(this.isLeaf(keys)) return
    
    var Tree = [];
    for(var i = 0; i < keys.length; i++){
      let CurrKey = keys[i];
      if(CurrKey.substring(0,2) == "__"){
        continue;
      }
      let path = json[CurrKey]["__Path__"];
      Tree.push(
        <TreeItem nodeId={path} onLabelClick={() => {this.onEnvSelect(path)}} label={CurrKey}>
        {this.CreateTreeItems(json[CurrKey])}
        </TreeItem>
        )
    }
    return <React.Fragment>{Tree.map(item => item)}</React.Fragment>
  }
  onEnvSelect = (path) => {
    this.props.EnvSelector(path);
    this.props.closer()
  }
  async fetchEnvs(){
    const respons = await fetch("/api/getAllEnv" , {
      method: 'POST',
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        AccessToken:this.props.AccessToken
      })
    });
    const Data = await respons.json();
    return Data
  }
  isLeaf(keys){
    for(let i = 0; i < keys.length; i++){
      if(keys[i] != "__APPS__" && keys[i] != "__Path__" && keys[i] != "__Perent__"){
        return false;
      }
    }
    return true
  }
}

export default withStyles(Styles)(EnvTree);
