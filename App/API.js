const express = require("express");
const TableTools = require("./TableTools");
const fetch = require("node-fetch")
const appsTableName = "Apps";
const AllEnvs = "allDBEnvironments";

exports.router = async function(context){
    let body = context.req.body
    if(!body){
        return false;
    }
    var route = [context.bindingData.topDomain,context.bindingData.midDomain];
    var AccessToken = context.req.body.AccessToken
    if(route.length < 2){
        return false;
    }
    if(route[0] != "api"){
        return false;
    }
    if(!await CheckAuthorization(AccessToken)){
        return "unautorized access";
    }
    if(route[1] === "mergeConfig"){
        await exports.mergeConfig(body);
        return "App Configered successfully";
    }
    if(route[1] === "createEnv"){
        await exports.createEnv(body);
        return "Environment created successfully";
    }
    if(route[1] === "getAllEnv"){
        return await exports.getAllEnv(body);
    }
    if(route[1] === "deleteEnv"){
        await exports.deleteEnv(body);
        return "Environment deleted successfully";
    }
    if(route[1] === "getAppFromAllEnvs"){
        return await exports.getAppFromAllEnvs(body);
    }
    if(route[1] === "queryTable"){
        return await exports.queryTable(body);
    }
}

exports.getAllEnv = async function(){
    var Envs = await TableTools.getEntity(AllEnvs , appsTableName);
    return Envs[AllEnvs];
}

exports.mergeConfig = async function(req){ //api/mergeConfig
    let apps = req.apps
    for(let i = 0; i < apps.length; i++){
        let currApp = apps[i]
        let {path , appName, data , override} = currApp 
        let Key = path + "|" + appName
        if(override == true){
            await TableTools.insertOrReplace(Key , data, appsTableName);
            continue;
        }
        var oldDataObj = await TableTools.getEntity(Key, appsTableName);
        if(!oldDataObj){
            await TableTools.insertOrReplace(Key , data, appsTableName);
            continue;
        }
        var oldData = oldDataObj[Key];
        merge(oldData , data);
        await TableTools.updateEntity(Key , oldData, appsTableName);
    }
}


exports.deleteEnv = async function(req){
    var Envs = await exports.getAllEnv();
    var path = path = req.path.split("/");
    deleteEnvInternal(path , Envs , 0);
    await TableTools.updateEntity(AllEnvs, Envs, appsTableName);
}

function deleteEnvInternal(path , Envs , index){
    var CurrPath = path[index];
    if(!Envs[CurrPath]){
        return;
    }
    if(index >= path.length-1){
        if(HaveChildEnv(Envs[CurrPath])){
            return;
        }
        delete Envs[CurrPath];
        return;
    }
    deleteEnvInternal(path, Envs[CurrPath], index+1);
}

exports.createEnv = async function(req){
    var Envs = await exports.getAllEnv();
    var path = req.path.split("/");
    var apps = req.apps;
    createEnvInternal(path , Envs ,apps, 0);
    await TableTools.updateEntity(AllEnvs, Envs, appsTableName);

}

function createEnvInternal(path , Envs ,apps, index){
    var currPath = path[index];
    if(index >= path.length-1){
        if(!Envs[currPath]){
            Envs[currPath] = {
                "__APPS__": apps
            };
        }
        return;
    }
    if(!Envs[currPath]){
        return;
    }
    createEnvInternal(path , Envs[currPath], apps, index+1);
}

exports.getAppFromAllEnvs = async function(req){
    let apps = req.apps;
    let payload = {};
    for(let i = 0; i < apps.length; i++){
        let currKey = apps[i]
        let currApp = await TableTools.getEntity(currKey , appsTableName);
        payload[currKey] = currApp[currKey];
    }
    return payload;
}
exports.queryTable = async function(req){
    return await TableTools.queryTable(appsTableName)
}

function merge(oldData , newData){
    if(!oldData){
        return;
    }
    if(!newData){
        return;
    }
    var newKeys = Object.keys(newData);
    for(var i = 0; i < newKeys.length; i++){
        oldData[newKeys[i]] = newData[newKeys[i]];
    }
}
function HaveChildEnv(obj){
    var keys = Object.keys(obj);
    if(keys.length > 1){
        return true;
    }
    return false;
}
async function CheckAuthorization(accessToken){
    if(!accessToken){
        return false;
    }
    var Bearer = `Bearer ${accessToken}`
    var Res;
    await fetch("https://configserver.us.auth0.com/userinfo" , {
        method: 'get',
        headers: { 'Authorization': Bearer }
    }).then(res => Res = res.json())
    .then(json => Res = json)
    if(Res){
        return true;
    }
    return false;
}