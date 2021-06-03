import React, { Component } from 'react';
import EnvDrawer from "./EnvDrawer"
import { Button, Drawer, Box } from '@material-ui/core';
import ValueChangeDialog from './ValueChangeDialog';
import ConfirmationDialog from './ConfirmationDialog';
import DiscardDialog from './DiscardDialog';
class Main extends Component{
    state = {
      selectedEnv:undefined,
      selectedApp:undefined,
      selectedPath:undefined,
      selectedValue:undefined,
      selectedEnvInTable:undefined,
      EnvTree:undefined,
      appsToDisplay:undefined,
      dataForTable:undefined,
      localDB:undefined,
      UniqueTableKeys:undefined,
      completeAppJson:{},
      isOpenDialog:false,
      isConfirmationDialogOpen:false,
      isDiscardDialogOpen:false,
      ChangedApps:[],
      listOfTableApps:[]
    }
    render(){
      return (
        <React.Fragment>
          <EnvDrawer
          AccessToken={this.props.AccessToken}
          EnvSelector={this.EnvSelector}
          envTreeGetter={this.envTreeGetter}
          appSelector={this.appSelector}
          openDialog={this.openDialog}
          onCommit={this.onCommit}
          onDiscard={this.onDiscard}
          selectedEnv={this.state.selectedEnv}
          EnvTree={this.state.EnvTree}
          appsToDisplay={this.state.appsToDisplay}
          selectedApp={this.state.selectedApp}
          dataForTable={this.state.dataForTable}
          UniqueTableKeys={this.state.UniqueTableKeys}
          completeAppJson={this.state.completeAppJson}
          localDB={this.state.localDB}
          />
          <ValueChangeDialog 
          isOpenDialog={this.state.isOpenDialog} 
          discardDialog={this.discardDialog} 
          commitDialog={this.commitDialog}
          app={this.state.selectedApp}
          env={this.state.selectedEnv}
          path={this.state.selectedPath}
          val={this.state.selectedValue}
          tableEnv={this.state.selectedEnvInTable}
          />
          <ConfirmationDialog 
          onConfirmation={this.onConfirmation}
          onRejectConfirmation={this.onRejectConfirmation}
          ChangedApps={this.state.ChangedApps}
          isConfirmationDialogOpen={this.state.isConfirmationDialogOpen}
          />
          <DiscardDialog 
          onRejectDiscard={this.onRejectDiscard}
          onConfirmeDiscard={this.onConfirmeDiscard}
          ChangedApps={this.state.ChangedApps}
          isDiscardDialogOpen={this.state.isDiscardDialogOpen}
          />
        </React.Fragment>
      );
    }
    EnvSelector = (Path)=>{
      let arr = [];
      this.getRelevantApps(this.state.EnvTree , arr , Path.split("/") , 0);
      this.setState({selectedEnv:Path, appsToDisplay:arr});
    }
    appSelector = async (app) =>{
      this.setState({selectedApp:app});
      let json = await this.fetchAppsForLocalDB(app , this.state.selectedEnv)
      let AppsForTable = this.getAppsForTable(json , this.state.listOfTableApps)

      let Unique = [];
      this.getUniqueKeys(AppsForTable , Unique , "" , 0)
      let completeApp = await this.fetchCompeteApp(app , this.state.selectedEnv)
      this.setState({localDB:json , UniqueTableKeys:Unique, completeAppJson:completeApp , dataForTable:AppsForTable})
    }
    envTreeGetter = (Tree)=>{
      this.setState({EnvTree:Tree});
    }
    getRelevantApps = (json, arr, path, index) => {
      if(!json) return;
      if(!path) return;
      if(index < path.length){
          let currEnv = path[index]
          this.getRelevantApps(json[currEnv] , arr ,path , index+1)
          return;
      }
      let appKeys = json["__APPS__"];
      for(let i = 0; i < appKeys.length; i++){
          let currKey = appKeys[i]
          if(!arr.includes(currKey)){
              arr.push(currKey)
          }
      }
      let envKeys = Object.keys(json);
      for(let i = 0; i < envKeys.length; i++){
          let currKey = envKeys[i]
          if(this.isTreeChildObj(currKey)){
              this.getRelevantApps(json[currKey] , arr ,path , index)
          }
      }
  }
  isTreeChildObj = (key) => {
    if(key != "__APPS__" && key != "__Path__" && key != "__Perent__"){
      return true;
    }
    return false;
  }
  async fetchAppsForLocalDB(app , env){
    let exsistingKeys = (this.state.dataForTable) ? Object.keys(this.state.localDB) : []
    let apps = []
    let envs = env.split("/")
    this.getDrilledDownApps(this.state.EnvTree , apps , app , envs , 0 , "")
    const respons = await fetch("/api/getAppFromAllEnvs" , {
      method: 'POST',
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        AccessToken:this.props.AccessToken,
        apps:apps
      })
    });
    const Data = (respons.ok) ? await respons.json() : {};
    for(let i = 0; i < exsistingKeys.length; i++){
      Data[exsistingKeys[i]] = this.state.localDB[exsistingKeys[i]]
    }
    this.setState({listOfTableApps:apps})
    return Data
  }
  getDrilledDownApps = (tree , arr , app , envs , index , prefix) =>{
    if(!tree) return
    if(index < envs.length){
      let currApp = envs.slice(0 , index+1).join("/")+"|"+app
      arr.push(currApp)
      prefix = currApp.split("|")[0]     
      let currEnv = envs[index]
      this.getDrilledDownApps(tree[currEnv] , arr , app , envs , index+1 , prefix)
      return
    }
    let keys = Object.keys(tree);
    for(let i = 0; i < keys.length; i++){
      let currKey = keys[i]
      if(this.isTreeChildObj(currKey)){
        if(tree[currKey].__APPS__.includes(app)){
          arr.push(`${prefix}/${currKey}|${app}`)
        }
      }
    }
    for(let i = 0; i < keys.length; i++){
      let currKey = keys[i]
      if(this.isTreeChildObj(currKey)){
        this.getDrilledDownApps(tree[currKey] , arr , app , envs , index , prefix+"/"+currKey)
      }
    }
  }
  
  getAppsForTable = (json , apps) =>{
    let returnObj = {}
    apps.map(item =>{
      let objKey = item.split("|")[0]
      returnObj[objKey] = json[item]
    })
    return returnObj;
  }
  getUniqueKeys(json , stack , path , index){
      if(typeof json != "object"){
        return;
      }
      let keys = Object.keys(json);
      if(index == 0){
        for(let i = 0; i < keys.length; i++){
          let currKey = keys[i];
          this.getUniqueKeys(json[currKey] , stack , path , index+1)
        }
        return;
      }
      for(let i = 0; i < keys.length; i++){
        let currKey = keys[i]; 
        let currPath = path + currKey;
        if(!stack.includes(currPath) && typeof json[currKey] != "object"){
          stack.push(currPath)
        }
        this.getUniqueKeys(json[currKey] , stack , currPath + "/" , index)
      }
    }
    async fetchCompeteApp(app , env){
      let url = `${env}?app=${app}&token=0a7161d0-eba7-11ea-adc3-71bb49121e10`;

      const respons = await fetch(url , {
        method: 'GET',
        headers:{
          "Content-Type":"application/json"
        }
      });
      
      const Data = (respons.ok) ? await respons.json() : undefined;
      return Data
    }
    openDialog = (path , val , env ) =>{
      this.setState({isOpenDialog:true , selectedPath:path , selectedEnvInTable:env , selectedValue:val})
    }
    discardDialog = () =>{
      this.setState({isOpenDialog:false})
    }
    commitDialog = (env, app,newValue , valuePath) =>{
      let {localDB , ChangedApps} = this.state
      let key = `${env}|${app}`
      this.changeValueViaPath(localDB[key] , valuePath.split("/") , newValue , 0)
      if(!ChangedApps.includes(key)) ChangedApps.push(key)
      this.setState({isOpenDialog:false , localDB : localDB , ChangedApps:ChangedApps})
    }
    changeValueViaPath = (obj , path , value , index) => {
      if(index >= path.length){
        return;
      }
      let currPath = path[index];
      if(path.length - 1 == index){
        obj[currPath] = value
      }
      if(!obj){
        obj[currPath] = {}
      }
      this.changeValueViaPath(obj[currPath] , path , value , index+1)
    }
    onConfirmation = async () =>{
      let {ChangedApps , localDB} = this.state;
      let RequestApps = []
      for(let i = 0; i < ChangedApps.length; i++){
        let currApp = ChangedApps[i]
        let path = currApp.split("|")[0]
        let app = currApp.split("|")[1]
        let currReqItem = {
          data:localDB[currApp],
          override:true,
          path:path,
          appName:app
        }
        RequestApps.push(currReqItem)
      }
      await fetch("api/mergeConfig" , {
        method: 'POST',
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          AccessToken:this.props.AccessToken,
          apps:RequestApps
        })
      });
      this.setState({isConfirmationDialogOpen:false})
    }
    onRejectConfirmation= () => {
      this.setState({isConfirmationDialogOpen:false})
    }
    onCommit = () => {
      this.setState({isConfirmationDialogOpen:true})
    }
    onRejectDiscard = () =>{
      this.setState({isDiscardDialogOpen:false})
    }
    onConfirmeDiscard = async () =>{
      this.setState({isDiscardDialogOpen:false , ChangedApps:[] ,localDB:undefined , dataForTable:undefined},
                    async () =>{await this.appSelector(this.state.selectedApp)})
    }
    onDiscard = () =>{
      this.setState({isDiscardDialogOpen:true})
    }
}
 
export default Main;