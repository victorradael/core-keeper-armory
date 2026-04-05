import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { autoUpdater } from "electron-updater";

let mainWindow: BrowserWindow | null = null;

function setupAutoUpdater() {
	autoUpdater.autoDownload = false;
	autoUpdater.autoInstallOnAppQuit = false;

	autoUpdater.on("update-available", (info) => {
		mainWindow?.webContents.send("update-available", info);
	});

	autoUpdater.on("update-not-available", () => {
		mainWindow?.webContents.send("update-not-available");
	});

	autoUpdater.on("download-progress", (progress) => {
		mainWindow?.webContents.send("download-progress", progress);
	});

	autoUpdater.on("update-downloaded", (info) => {
		mainWindow?.webContents.send("update-downloaded", info);
	});

	autoUpdater.on("error", (err) => {
		mainWindow?.webContents.send("update-error", err.message);
	});

	// Check for updates 3 seconds after startup to not block initial load
	setTimeout(() => {
		autoUpdater.checkForUpdates();
	}, 3000);
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		frame: false, // Remove a barra de título nativa
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
			contextIsolation: true,
		},
		title: "Build Keeper Electron",
		backgroundColor: "#1C1B1F",
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	}
}

// Handlers para controle da janela
ipcMain.handle("window-minimize", () => {
	mainWindow?.minimize();
});

ipcMain.handle("window-maximize", () => {
	if (mainWindow?.isMaximized()) {
		mainWindow.unmaximize();
	} else {
		mainWindow?.maximize();
	}
});

ipcMain.handle("window-close", () => {
	mainWindow?.close();
});

// Handlers para atualização
ipcMain.handle("check-for-updates", () => {
	autoUpdater.checkForUpdates();
});

ipcMain.handle("download-update", () => {
	autoUpdater.downloadUpdate();
});

ipcMain.handle("install-update", () => {
	autoUpdater.quitAndInstall();
});

app.whenReady().then(() => {
	createWindow();
	if (app.isPackaged) {
		setupAutoUpdater();
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
