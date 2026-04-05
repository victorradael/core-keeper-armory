import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
	minimize: () => ipcRenderer.invoke("window-minimize"),
	maximize: () => ipcRenderer.invoke("window-maximize"),
	close: () => ipcRenderer.invoke("window-close"),
	checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
	downloadUpdate: () => ipcRenderer.invoke("download-update"),
	installUpdate: () => ipcRenderer.invoke("install-update"),
	onUpdateAvailable: (callback: (info: unknown) => void) =>
		ipcRenderer.on("update-available", (_event, info) => callback(info)),
	onUpdateNotAvailable: (callback: () => void) =>
		ipcRenderer.on("update-not-available", () => callback()),
	onDownloadProgress: (callback: (progress: { percent: number }) => void) =>
		ipcRenderer.on("download-progress", (_event, progress) =>
			callback(progress),
		),
	onUpdateDownloaded: (callback: (info: unknown) => void) =>
		ipcRenderer.on("update-downloaded", (_event, info) => callback(info)),
	onUpdateError: (callback: (message: string) => void) =>
		ipcRenderer.on("update-error", (_event, message) => callback(message)),
});
