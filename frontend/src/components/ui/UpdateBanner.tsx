import { Download, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";

declare global {
	interface Window {
		electronAPI?: {
			minimize(): void;
			maximize(): void;
			close(): void;
			checkForUpdates(): void;
			downloadUpdate(): void;
			installUpdate(): void;
			onUpdateAvailable(callback: (info: { version: string }) => void): void;
			onUpdateNotAvailable(callback: () => void): void;
			onDownloadProgress(
				callback: (progress: { percent: number }) => void,
			): void;
			onUpdateDownloaded(callback: (info: { version: string }) => void): void;
			onUpdateError(callback: (message: string) => void): void;
		};
	}
}

type UpdateState =
	| { status: "idle" }
	| { status: "available"; version: string }
	| { status: "downloading"; percent: number }
	| { status: "ready"; version: string }
	| { status: "error"; message: string };

export function UpdateBanner() {
	const [update, setUpdate] = useState<UpdateState>({ status: "idle" });
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const api = window.electronAPI;
		if (!api) return;

		api.onUpdateAvailable((info) => {
			setDismissed(false);
			setUpdate({ status: "available", version: info.version });
		});

		api.onDownloadProgress((progress) => {
			setUpdate({
				status: "downloading",
				percent: Math.round(progress.percent),
			});
		});

		api.onUpdateDownloaded((info) => {
			setUpdate({ status: "ready", version: info.version });
		});

		api.onUpdateError((message) => {
			setUpdate({ status: "error", message });
		});
	}, []);

	if (update.status === "idle" || dismissed) return null;

	const handleDownload = () => {
		window.electronAPI?.downloadUpdate();
		setUpdate({ status: "downloading", percent: 0 });
	};

	const handleInstall = () => {
		window.electronAPI?.installUpdate();
	};

	return (
		<div className="relative flex items-center gap-4 px-6 py-2 bg-primary/10 border-b-2 border-primary/30 text-xs font-pixel">
			{update.status === "available" && (
				<>
					<Download className="w-3.5 h-3.5 text-primary shrink-0" />
					<span className="text-white/80 uppercase tracking-wider">
						UPDATE AVAILABLE —{" "}
						<span className="text-primary">v{update.version}</span>
					</span>
					<button
						type="button"
						onClick={handleDownload}
						className="ml-auto px-4 py-1 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors uppercase tracking-wider"
					>
						DOWNLOAD
					</button>
					<button
						type="button"
						onClick={() => setDismissed(true)}
						className="text-white/30 hover:text-white/70 transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</>
			)}

			{update.status === "downloading" && (
				<>
					<Download className="w-3.5 h-3.5 text-primary shrink-0 animate-bounce" />
					<span className="text-white/80 uppercase tracking-wider">
						DOWNLOADING UPDATE...
					</span>
					<div className="ml-auto flex items-center gap-3">
						<div className="w-32 h-1.5 bg-white/10">
							<div
								className="h-full bg-primary transition-all duration-300"
								style={{ width: `${update.percent}%` }}
							/>
						</div>
						<span className="text-primary w-10 text-right">
							{update.percent}%
						</span>
					</div>
				</>
			)}

			{update.status === "ready" && (
				<>
					<RefreshCw className="w-3.5 h-3.5 text-secondary shrink-0" />
					<span className="text-white/80 uppercase tracking-wider">
						READY TO INSTALL —{" "}
						<span className="text-secondary">v{update.version}</span>
					</span>
					<button
						type="button"
						onClick={handleInstall}
						className="ml-auto px-4 py-1 bg-secondary/20 border border-secondary/50 text-secondary hover:bg-secondary/30 transition-colors uppercase tracking-wider"
					>
						RESTART & INSTALL
					</button>
				</>
			)}

			{update.status === "error" && (
				<>
					<X className="w-3.5 h-3.5 text-red-500 shrink-0" />
					<span className="text-red-400/80 uppercase tracking-wider">
						UPDATE ERROR: {update.message}
					</span>
					<button
						type="button"
						onClick={() => setDismissed(true)}
						className="ml-auto text-white/30 hover:text-white/70 transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</>
			)}
		</div>
	);
}
