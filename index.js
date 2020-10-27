'use strict';
const path = require('path');
const {app, dialog,BrowserWindow, ipcMain} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util');

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.company.AppName');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 400,
		height: 300,
      webPreferences: {
        contextIsolation: true, // protect against prototype pollution
        preload: path.join(__dirname, 'preload.js')
      }
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, 'index.html'));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	mainWindow = await createMainWindow();
})();

//import { resample } from './resample.js'
const { resample } = require('./resample');
const fs = require('fs');

ipcMain.on("toMain-outputFolder", (event, args) => {
  dialog.showOpenDialog(mainWindow, {
    title: 'output destination',
    defaultPath : __dirname,
    properties: ['openDirectory'],
  }).then(result => {
    console.log(result.canceled)
    console.log(result.filePaths)
    if(!result.canceled) mainWindow.webContents.send("fromMain-outputFolder", result.filePaths[0]);
  }).catch((e) => { console.error(e.message) });
});

ipcMain.on("toMain", (event, args) => {
  console.log(args);

  let out = resample(args.data,args.mca,args.outConfig);
  var outFileName = path.join((args.path=='Output Folder')?__dirname:args.path, args.name.split('.')[0]+'.dat')

  mainWindow.webContents.send("fromMain", {
    "message": `${outFileName} data<${args.data.length}> mca<${args.mca}> config<N:${args.outConfig.N}, dE:${args.outConfig.dE}>`, 
    "data": out,
  });
  fs.writeFile(outFileName,out.map(x=>x+' '+Math.sqrt(x)).join('\n'),(err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
});
