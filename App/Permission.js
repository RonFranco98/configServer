const tokenTableName = "Tokens";
var uuid = require("uuid/v1");
var TableTools = require("./TableTools");


exports.CreateToken = function (creator, overried){
    var obj = {
        "UserID":creator,
        "QueryOverride":overried,
        "Permissions":{}
    };
    var key = uuid();
    TableTools.insertToTable(key,obj,tokenTableName);
}

exports.getPermissions = async function (tokenId){
    var token = await TableTools.getEntity(tokenId , tokenTableName);
    var permission = token[tokenId].Permissions;
    return permission;
}

//add premissions functions
exports.InsertPermission = async function addPermission(tokenId , path , read , write){
    var token = await TableTools.getEntity(tokenId , tokenTableName);
    var permission = token[tokenId].Permissions;
    InsertPermissionInternal(permission , path , 0 , read, write)

    await TableTools.updateEntity(tokenId ,token[tokenId], tokenTableName);
}
function InsertPermissionInternal(permissons ,path ,index , read , write){
    var CurrPath = path[index];
    if(!permissons[CurrPath]){
        permissons[CurrPath] = {
            "Childs":{}
        };
    }
    if(index == path.length-1){
        permissons[CurrPath] = {
            "Read":read,
            "Write":write,
            "Childs":{}
        };
        return;
    }
    InsertPermissionInternal(permissons[CurrPath]["Childs"] , path , index+1 , read ,write);
}



//check permissions
exports.HasReadPermissions = function(permissions , path){
    return hasPermissionInternal("Read" , permissions , path , 0 , undefined);
}
exports.HasWritePermissions = function(permissions , path){
    return hasPermissionInternal("Write" , permissions , path , 0 , undefined);
}


function hasPermissionInternal(type , node , path , index , permission){
    if(index == path.length){
        if(permission == undefined)
            return CheckUnder(node , type);
        return permission
    }
    var CurrEnv = path[index];
    if(!node[CurrEnv]){
        if(permission == true)
            return permission;
        return false;
    }
    if(node[CurrEnv][type] != undefined){
        permission = node[CurrEnv][type];
    }
    
    return hasPermissionInternal(type , node[CurrEnv]["Childs"] , path , index+1 , permission);
}
function CheckUnder(node , type){
    if(!node){
        return false;
    }
    var Keys = Object.keys(node);
    for(var i  = 0; i < Keys.length; i++){
        CurrKey = Keys[i];
        if(node[CurrKey][type] == true){
            return true;
        }
        return CheckUnder(node["Childs"] , type);
    }
}










/*
permission insertion for future reference
    await Permission.InsertPermission("6b562cd0-754e-11ea-a7cc-ed7dab849c43" , "leverate" , true , false);
    await Permission.InsertPermission("6b562cd0-754e-11ea-a7cc-ed7dab849c43" , "leverate/dev/ronen" , false , false);

    await Permission.InsertPermission("7d44ca90-920a-11ea-9c62-2784675426e9" , "leverate" , true , undefined);

    await Permission.InsertPermission("7d44f1a0-920a-11ea-9c62-2784675426e9" , "leverate/prod" , true , undefined);
    await Permission.InsertPermission("7d44f1a0-920a-11ea-9c62-2784675426e9" , "leverate" , false , undefined);

    await Permission.InsertPermission("7d4518b0-920a-11ea-9c62-2784675426e9" , "leverate/prod" , true , undefined);

    await Permission.InsertPermission("7d4518b1-920a-11ea-9c62-2784675426e9" , "leverate/dev" , true , undefined);

    await Permission.InsertPermission("7d453fc0-920a-11ea-9c62-2784675426e9" , "leverate/dev/yuri" , true , undefined);

    await Permission.InsertPermission("7d453fc1-920a-11ea-9c62-2784675426e9" , "leverate" , true , undefined);
    await Permission.InsertPermission("7d453fc1-920a-11ea-9c62-2784675426e9" , "leverate/dev" , false , undefined);
    await Permission.InsertPermission("7d453fc1-920a-11ea-9c62-2784675426e9" , "leverate/dev/ronen" , true , undefined);
    await Permission.InsertPermission("7d453fc1-920a-11ea-9c62-2784675426e9" , "leverate/dev/ronen/express" , false , undefined);

    await Permission.InsertPermission("7d453fc2-920a-11ea-9c62-2784675426e9" , "leverate" , undefined , true);

*/ 