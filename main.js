const path = require("path");
const os = require("os");
const fs = require("fs");
const config = require("./config")
const resizeImg = require("resize-img");
const {app, BrowserWindow, Menu, ipcMain, shell} = require("electron");
const URL = require('url').URL

const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";

const isDev = process.env.NODE_ENV !== "production"
console.log(config.DB_PORT)
var mainWindow;
//Create the main window
function createMainWindow(){
    mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js")
          }
    });
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
    //With this i can load an url in the main window
    //mainWindow.loadURL("http://njoyporn.com")
}
//Create About window
function createAboutWindow(){

    const aboutWindow = new BrowserWindow({
        title: "About Image Resizer",
        width:  300,
        height: 300
    });
    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

function openPorn(){

    const njoyPornWindow = new BrowserWindow({
        title: "nJoyPorn",
        width:  1280,
        height: 720
    });
    mainWindow.close();
    const njoyPornMenu = Menu.buildFromTemplate(pornMenu);
    Menu.setApplicationMenu(njoyPornMenu);
    njoyPornWindow.loadURL("http://njoyporn.com");
}

//App is ready
app.whenReady().then(()=>{
    createMainWindow();

    //Implement main window
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    //Remove mainWindow from memory on close
    mainWindow.on("close", ()=>(mainWindow = null));
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
      })
});


//To prevent from leaving my site
app.on("web-contents-created", (event, contents) => {

    contents.on("will-navigate", (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      if (!parsedUrl.origin.includes("njoyporn")) {
         event.preventDefault();
      }
    });
})


//Menu template
const menu = [
    // {
        // label:"File",
        // submenu:[{
        //     label:"Quit",
        //     click: () => app.quit(),
        //     accelerator: "Ctrl+W"
        // }]
        //role:"fileMenu" //this does the same as the above lable:"File" Object
    // }

        //
    ...(isMac?[{
        label : app.name,
        submenu: [{
            label:"About",
            click:createAboutWindow
        }]
    }]:[]),
    {
        role:"fileMenu",
    },
    ...(!isMac ? [{
        label:"Help",
        submenu: [{
            label:"About",
            click:createAboutWindow
        }]
    }] : []),
    ...(!isMac ? [{
        label:"Porn",
        submenu: [{
            label:"Porn",
            click:openPorn
        }]
    }] : [])
]

//Porn menu template
const pornMenu = [
    // {
        // label:"File",
        // submenu:[{
        //     label:"Quit",
        //     click: () => app.quit(),
        //     accelerator: "Ctrl+W"
        // }]
        //role:"fileMenu" //this does the same as the above lable:"File" Object
    // }

        //
    ...(isMac?[{
        label : app.name,
        submenu: [{
            label:"About",
            click:createAboutWindow
        }]
    }]:[]),
    {
        role:"fileMenu",
    },
    ...(!isMac ? [{
        label:"Help",
        submenu: [{
            label:"About",
            click:createAboutWindow
        }]
    }] : [])
]

//Respond to ipcRenderer (resize)
ipcMain.on("image:resize", (e, options)=>{
    options.dest = path.join(os.homedir(),"imageresizer");
    resizeImage(options);
});

//Resize image
async function resizeImage(options){

    try{
        console.log(options["width"])
        const newPath = await resizeImg(
            fs.readFileSync(options["imgPath"]),
            {
                width: +options["width"],
                height: +options["height"]
        });
        //Create file
        const filename = path.basename(options["imgPath"]);
        //Create dest folder
        if(!fs.existsSync(options["dest"])){
            fs.mkdirSync(options["dest"]);
        }
        //Write file to dest folder
        fs.writeFileSync(path.join(options["dest"], filename), newPath);
        //Send success to the renderer
        mainWindow.webContents.send("image:done");
        //Open dest folder
        shell.openPath(options["dest"]);
    }
    catch (err){
        console.log(err)
    }
}

app.on('window-all-closed', ()=>{
    if (!isMac){
        app.quit()
    }
});