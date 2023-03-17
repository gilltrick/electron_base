const fs = require("fs")

var electronVersion = "";
var jsonFile = "";

async function preparePackageJsonForBuild(){

    jsonFile = JSON.parse(fs.readFileSync("./package.json"));
    electronVersion = jsonFile["dependencies"]["electron"];
    delete jsonFile["dependencies"]["electron"];
    fs.writeFileSync("./electronVersion", electronVersion, function(err) {
        if (err) {
            console.log(err);
        }
    });
    fs.writeFileSync("./package.json", JSON.stringify(jsonFile, null, 4), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

async function backToDevPackage(){

    electronVersion = fs.readFileSync("./electronVersion")
    jsonFile = JSON.parse(fs.readFileSync("./package.json"));

    jsonFile["dependencies"]["electron"] = electronVersion.toString();
    fs.writeFileSync("./package.json", JSON.stringify(jsonFile, null, 4), function(err) {
        if (err) {
            console.log(err);
        }
    });
    fs.unlinkSync("./electronVersion");
}


async function run(args){
    if(args == "prepare"){
        await preparePackageJsonForBuild();
    }
    if(args == "back"){
        electronVersion = "^23.1.4";
        await backToDevPackage();
    }
    if(args == "config_dev"){
        createConfig("DEV")
    }
}


async function createConfig(arg){
    var configJson = JSON.parse(fs.readFileSync("./config.json"));
    console.log(configJson)
    var jsString = `var ENV = "${configJson["ENV"][arg]}";\nvar DB_PORT = "${configJson["DB_PORT"][arg]}";\n\nmodule.exports = {ENV:ENV, DB_PORT:DB_PORT}`
    fs.writeFileSync("./config.js", jsString, function(err) {
        if (err) {
            console.log(err);
        }
    });
}


//if i want to pass some arguments i get a list with the next line
var args = process.argv.slice(2);
try{
    run(args[0])
}
catch{
    return;
}

module.exports = {preparePackageJsonForBuild:preparePackageJsonForBuild, backToDevPackage:backToDevPackage}