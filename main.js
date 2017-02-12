const {app} = require('electron')
if (require('electron-squirrel-startup')) app.quit()

const path = require('path')
const autoUpdater = require('electron').autoUpdater
const BrowserWindow = require('electron').BrowserWindow
const {ipcMain} = require('electron')

// ------------------------------------------- squirrel stuff (for updating) ----------------------------------------------------------------

if (handleSquirrelEvent()) app.quit()

function handleSquirrelEvent () {
  if (process.argv.length === 1) {
    return false
  }

  const ChildProcess = require('child_process')

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawn = function (command, args) {
    let spawnedProcess

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      })
    } catch (err) {}
    return spawnedProcess
  }

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args)
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName])

      setTimeout(app.quit, 1000)
      return true

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit()
      return true
  }
}

autoUpdater.addListener('error', function (error) { // eslint-disable-line

})

var version = app.getVersion()

autoUpdater.setFeedURL('http://launcher2.arctic-network.com/update/win/' + version)
autoUpdater.checkForUpdates()

// ------------------------------------------- real stuff that does something ----------------------------------------------------------------

let win
let downWin
let webWin
let loadWin

function createWindows () {
  // web process
  webWin = new BrowserWindow({
    icon: 'icon/workericon.ico',
    width: 1000,
    height: 500,
    show: false
  })
  webWin.loadURL(`file://${__dirname}/app/web.html`)
  webWin.webContents.openDevTools({
    detach: false
  })

  // download process
  downWin = new BrowserWindow({
    icon: 'icon/workericon.ico',
    width: 1000,
    height: 500,
    show: false
  })
  downWin.loadURL(`file://${__dirname}/app/dwn.html`)
  downWin.webContents.openDevTools({
    detach: false
  })

  // Create the browser window.
  win = new BrowserWindow({
    icon: 'icon/appicon.ico',
    width: 1300,
    height: 700,
    minWidth: 1300,
    minHeight: 700,
    show: false,
    frame: false
  })
  /*
  win.webContents.openDevTools({
    detach: true
  })
  */

  win.loadURL(`file://${__dirname}/index.html`)

  autoUpdater.addListener('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateURL) {
    var args = {
      releaseNotes: releaseNotes,
      releaseName: releaseName,
      releaseDate: releaseDate,
      updateURL: updateURL
    }
    win.webContents.send('update-downloaded', args)
  })

  autoUpdater.addListener('checking-for-update', function (event) {
    win.webContents.send('checking-for-update')
  })

  autoUpdater.addListener('update-not-available', function (event) {
    win.webContents.send('update-not-available')
  })

  autoUpdater.addListener('update-available', function (event) {
    win.webContents.send('update-available')
  })

  loadWin = new BrowserWindow({
    icon: 'icon/appicon.ico',
    width: 162,
    height: 162,
    frame: false,
    transparent: true
  })

  loadWin.loadURL(`file://${__dirname}/app/loading.html`)

  setUpIpcHandlers()
}

function setUpIpcHandlers () {
  ipcMain.on('to-dwn', function (event, arg) {
    downWin.webContents.send('to-dwn', arg)
  })

  ipcMain.on('to-web', function (event, arg) {
    webWin.webContents.send('to-web', arg)
  })

  ipcMain.on('to-app', function (event, arg) {
    win.webContents.send('to-app', arg)
  })
}

const shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
  if (win) {
    if (win.isMinimized()) win.restore()
    if (!win.isVisible()) win.show()
    win.focus()
  }
})

if (shouldQuit) {
  app.quit()
}

app.on('ready', function () {
  createWindows()
})

app.on('activate', function () {
  if (win === null) {
    createWindows()
  }
})

ipcMain.on('winprogress-change', function (event, arg) {
  win.setProgressBar(arg.progress)
})

ipcMain.on('app-loaded', function (event) {
  win.show()
  loadWin.destroy()
})

ipcMain.on('focus-window', function (event) {
  win.focus()
})

ipcMain.on('close-app', function (event) {
  app.quit()
})

ipcMain.on('minimize-app', function (event) {
  win.minimize()
})
