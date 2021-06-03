import React, { Component } from 'react';
import { Table, Button } from '@material-ui/core';

const style = {
    head:{
        backgroundColor:"#2196f3",
        position:"sticky",
        top:0
    },
    headCell:{
        fontWeight:"bold",
        color:"white"
    },
    keyCell:{
        fontWeight:"bold"
    }
}
class ValuesTable extends Component{
    state = {
        taggledTable:false,
        
    }

    render(){
        return <div>{this.createTable(this.props.UniqueTableKeys , this.props.dataForTable)}</div>
    }
    
    createTable(keys , json){
        if(!keys) return
        if(!json) return
        let headKeys = Object.keys(json);
        return (
            <table>
                <tr style={style.head}>
                    <th style={style.headCell}></th>
                    {headKeys.map(item => <th style={style.headCell}>{item.split("/").pop()}</th>)}
                </tr>
                {keys.map(item => this.createRow(headKeys , item , json , {}))}
            </table>
        );
        
    }
    createRow(envs , path , json , cache){
        return(
            <tr>
                <td style={style.keyCell}>{path}</td>
                {
                    envs.map(item => {
                        let color = "black"
                        let val = this.getValue(path.split("/") , json[item] , 0)
                        if(!val){
                            val = this.findInCache(cache,item);
                            color = "gray"
                        }
                        cache[item] = val
                        return <td onDoubleClick={() => this.props.openDialog(path , val ,item)} style={{color:color}}>{val}</td>
                    })
                }
            </tr>
        );
    }
    getCell(path ,env, json){
        let envs = env.split("/");
        let val = undefined;
        while(envs.length > 0){
            let currEnv = envs.join("/")
            val = this.getValue(path , json[currEnv] , 0)
            if(val) break;
            envs.pop()
        }
        return <td onDoubleClick={() => this.props.openDialog(path , val ,env)}>{val}</td>
    }
    getValue(path , json , index){
        
        if(!json) return
        if(index > path.length) return 
        if(typeof json != "object") return json
        let currPath = path[index];
        return this.getValue(path , json[currPath] ,index + 1)
    }
    findInCache(cache , env){
        let prevEnv = env.split("/")
        prevEnv.pop()
        return cache[prevEnv.join("/")]
    }
    onTaggle = () =>{
        this.setState({taggledTable:!this.state.taggledTable})
    }
}

export default ValuesTable