/*general conmments:
    - a refrence object format is as the followings : "ref://<Path>?<AppName>"
    -log out to the azure portal console
    context.log.info(refbag);
    return {
        body: JSON.stringify(payload)
    };
    -
*/
//import modouls
var url = require("url");
var TableTools = require("./TableTools");
var Permission = require("./Permission");
var API = require("./API");



var myDB = {};

const appsTableName = "Apps";

//main function , triggered on http request
module.exports = async function (context, req) {
    var APIresultValue = await API.router(context);
    if(APIresultValue){
        context.res = {
            body: APIresultValue
        }
        return;
    }
    var domainArray = getDomainArray(context);
    var token = url.parse(req.url , true).query.token;
    var Permissions = await Permission.getPermissions(token);
    
    var app = getApp(req, Permissions);
    domainArray = overrideDomainArray(req , Permissions , domainArray);
    await addToMyDBFromTable(domainArray , app);

    var payload = {};
    var refbag = {};
    initializeRefBag(refbag , domainArray ,app , payload);
    
    ProcessData(myDB, 0 ,domainArray ,app,payload, refbag._Root_ , Permissions);
    await Patch(myDB ,refbag._Root_.Child , token); //begins at the first child of the root node which is the original http request transfered into refreence
    
    context.res = {
        body: payload
    }
};

function Marge(Father , Child , refbag){
    var ChildKeys = Object.keys(Child);

    for(var i = 0; i < ChildKeys.length; i++){
        var CurrChild = Child[ChildKeys[i]];
        if(isObjNotArr(CurrChild)){
            if(!Father[ChildKeys[i]]){
                Father[ChildKeys[i]] = {};
            }
            Marge(Father[ChildKeys[i]] , CurrChild , refbag);
            continue;
        }
        if(CurrChild instanceof Array){
            if(!Father[ChildKeys[i]]){
                Father[ChildKeys[i]] = [];
            }
            Marge(Father[ChildKeys[i]] , CurrChild , refbag);
            continue;
        }

        Father[ChildKeys[i]] = Child[ChildKeys[i]];

        if(isRefObj(Father[ChildKeys[i]])){
            var refVal = Father[ChildKeys[i]];
            var refName = ChildKeys[i];
            Father[ChildKeys[i]] = {};
            insertRef(refName , refVal ,refbag , undefined ,Father[ChildKeys[i]] ,false);
        }
    }
}

function ProcessData(Node , Index , DomainArray , App, payload ,refbag, permissions){
    if(Index >= DomainArray.length){
        return;
    }
    if(!Permission.HasReadPermissions(permissions, DomainArray.slice(0,Index+1))){
        ProcessData(Node , Index+1 , DomainArray , App,payload ,refbag , permissions);
        return;
    }
    var Key = GenerateKey(DomainArray.slice(0,Index+1) , App)
    var CurrNode = Node[Key];
    
    if(CurrNode){
        Marge(payload , CurrNode , refbag);
    }

    ProcessData(Node , Index+1 , DomainArray , App,payload ,refbag , permissions);
}

async function Patch(DB , refbag , token){
    if(!refbag){
        return;
    }
    var keys = Object.keys(refbag);
    for(var i = 0; i < keys.length; i++){
        var CurrRef = refbag[keys[i]];
        if(!isInRecursion(CurrRef.Father , CurrRef.RefValue)){
            CurrRef.isVisted = true;
            var Path = extractRefPath(CurrRef.RefValue);
            var App = extractRefAppName(CurrRef.RefValue);
            var Payload = CurrRef.Node;
            await addToMyDBFromTable(Path , App);
            var Permissions = {};
            await Permission.processPremissionTree(token , Path ,Permissions);
            console.log(Permissions);
            ProcessData(DB , 0 , Path , App , Payload ,CurrRef, Permissions);
            await Patch(DB , CurrRef.Child , token);
        }
    }
}



//tools

//general tools

//checks if the arrgument is an object but not an array
function isObjNotArr(Obj){
    if(!Obj){
        return false;
    }
    if(!(Obj instanceof Array)){
        if(typeof Obj == "object"){
            return true;
        }
    }
    return false;
}

//takes the row data of the domainArray and the AppName and gets it to the format <Domain1>/<Domain2>|<AppName>
function GenerateKey(Path , App){
    return Path.join("/")+"|"+App;
}

//creating an array consiste of the sub path of the http requeset , accessing the function.json route property via bindingData (kutas's function)
function getDomainArray(context){
    var domains = new Array();
    var Bindings = context.bindingData; 
    if (Bindings.topDomain) domains.push(Bindings.topDomain.toLocaleLowerCase());
    if (Bindings.midDomain) domains.push(Bindings.midDomain.toLocaleLowerCase());
    if (Bindings.lowDomain1) domains.push(Bindings.lowDomain1.toLocaleLowerCase());
    if (Bindings.lowDomain2) domains.push(Bindings.lowDomain2.toLocaleLowerCase());
    if (Bindings.lowDomain3) domains.push(Bindings.lowDomain3.toLocaleLowerCase());
    if (Bindings.lowDomain4) domains.push(Bindings.lowDomain4.toLocaleLowerCase());
    if (Bindings.lowDomain5) domains.push(Bindings.lowDomain5.toLocaleLowerCase());
    return domains;
}

function getApp(req, permissions){
    var app = url.parse(req.url , true).query.app;
    if(permissions["_QueryOverride_"]){
        app = permissions["_QueryOverride_"];
        app = app.split("|")[1].toLocaleLowerCase();
        return app;
    }
    return app.toLocaleLowerCase();
}
function overrideDomainArray(req , permissions , domainArray){
    var Path = "";
    var arr = [];
    if(permissions["_QueryOverride_"]){
        Path = permissions["_QueryOverride_"].split("|")[0];
        Path = Path.toLocaleLowerCase();
        arr = Path.split("/");
        return arr
    }
    return domainArray
}

//Reference objects Tools

//insert the current ref to the ref bag in the correct node
function insertRef(refName , refValue , father , child , node , isVisted){
    if(!father.Child){
        father.Child = {};
    }
    father.Child[refName] =  {
        "RefName" : refName,
        "RefValue" : refValue,
        "Child" : child,
        "Father" : father,
        "Node" : node,
        "isVisted" : isVisted
    };
}

//checks if the value passed is of the reference request format
function isRefObj(value){
    if(typeof value == "string" && value.slice(0,6) == "ref://" && value.indexOf("?") != -1){
        return true;
    }else{
        return false;
    }
}

//take the reference object format extract App/Path
function extractRefPath(value){
    value = value.slice(6);
    var temp = value.split("?");
    return temp[0].split("/");
}
function extractRefAppName(value){
    value = value.slice(6);
    var temp = value.split("?");
    return temp[1];
}

//take the original Http request and convert it to a reference object, to be later insert into the refbag as the root of the tree
function Req2Ref(DA , app){
    return "ref://" + DA.join("/") + "?" + app.slice(5);
}

//set the root of refbag
function initializeRefBag(refbag , domainArray , app ,payload){
    refbag["_Root_"] = {
        "RefName" : "_Root_",
        "RefValue" : Req2Ref(domainArray , app),
        "Child" : undefined,
        "Father" : undefined,
        "Node" : payload,
        "isVisted" : false
    };
}

//checks if the current ref that is being processed exsist in one of the perents node in the refbag tree.
function isInRecursion(refbag , OriginalRef){
    if(!refbag){
        return false;
    }
    var CurrRef = refbag.RefValue;
    if(OriginalRef == CurrRef){
        return true;
    }
    else{
        return isInRecursion(refbag.Father,OriginalRef);
    }
}



//storage table Tools

//get a path and an app name, and insert the relevant data , that isnt alredy there, from the azure table to MyDB.
async function addToMyDBFromTable(path , app){
    for(var i = 0; i < path.length; i++){
        var CurrPath = GenerateKey(path.slice(0,i+1) , app);
        if(!myDB[CurrPath]){
            insertObjToDB(await TableTools.getEntity(CurrPath , appsTableName));
        }
    }
}

//make the actual insertion to the myDB object after it was confermed it should really be inserted
function insertObjToDB(obj){
    if(obj){
        var Key = Object.keys(obj)[0];
        if(!myDB[Key]){
            myDB[Key] = obj[Key];
        }
    }
}


//router function

