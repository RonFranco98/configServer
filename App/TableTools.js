//import modale
const azure = require('azure-storage');
var AsyncAzure = require("./AzureAsyncTableAPI");

//set connection details
const tableService = azure.createTableService("_storageAccount_","StorageKey");

//insert to table with the Key as rowKey and Obj as value (conver obj to Json)
exports.insertToTable = function(Key,Obj,tableName){
    var task = {
        PartitionKey: {'_':""},
        RowKey : {'_':convertToTable(Key)},
        Value: {'_': JSON.stringify(Obj)}
    };
    tableService.insertEntity(tableName , task , function(error , result , response){
        if(!error){
            console.log("did it");
        }
    });
}

exports.updateEntity = async function(Key,Obj,tableName){
    var task = {
        PartitionKey: {'_':""},
        RowKey : {'_':convertToTable(Key)},
        Value: {'_': JSON.stringify(Obj)}
    };
    await AsyncAzure.replaceEntityAsync(tableService , tableName , task);
}
exports.insertOrReplace = async function(Key,Obj,tableName){
    var task = {
        PartitionKey: {'_':""},
        RowKey : {'_':convertToTable(Key)},
        Value: {'_': JSON.stringify(Obj)}
    };
    await AsyncAzure.insertOrReplaceEntityAsync(tableService , tableName , task);
}

exports.deleteEntity = async function(Key , tableName){
    var task = {
        PartitionKey: {'_':""},
        RowKey : {'_':convertToTable(Key)},
    };
    await AsyncAzure.deleteEntityAsync(tableService , tableName , task);
}

exports.queryTable = async function(tableName){
    let query = new azure.TableQuery()
        .where('RowKey gt ?', 'lev♥dev');
    return await AsyncAzure.queryEntitiesAsync(tableService , tableName , query);
}

//return a neat and clean object value and RowKey of the requested entity from the Table
exports.getEntity = async function(req , tableName){
    var obj = {};
    req = convertToTable(req);
    var result = await AsyncAzure.retrieveEntityAsync(tableService , tableName , '' , req);
    if(result){
        var Key = convertFromTable(result.RowKey._);
        var Value = JSON.parse(result.Value._);
        obj[Key] = Value;
        return obj;
    }else{
        return undefined;
    }
}


//translate value of Rowkey back a forwth and to handle Azure Table illigal Chars 
function convertToTable(str){
    while(str.indexOf("|") != -1){
        str = str.replace("|" , "☺");
    }
    while(str.indexOf("/") != -1){    
        str = str.replace("/" , "♥");
    }
    return str;
}
function convertFromTable(str){
    while(str.indexOf("♥") != -1){ 
        str = str.replace("♥" , "/");
    }
    while(str.indexOf("☺") != -1){ 
        str = str.replace("☺" , "|");
    }
    return str
}