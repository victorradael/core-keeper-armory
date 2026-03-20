import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "../utils/cn";

type ToastType = "error" | "success";

interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

interface ToastContextValue {
	toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: number) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback(
		(message: string, type: ToastType = "error") => {
			const id = ++nextId;
			setToasts((prev) => [...prev, { id, message, type }]);
			setTimeout(() => dismiss(id), 4000);
		},
		[dismiss],
	);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={cn(
							"flex items-center gap-3 px-4 py-3 border-2 font-pixel text-xs uppercase tracking-wider pointer-events-auto",
							"animate-in slide-in-from-right-4 fade-in duration-200",
							t.type === "error"
								? "bg-[#1a0a0a] border-red-500/60 text-red-400"
								: "bg-[#0a1a0a] border-green-500/60 text-green-400",
						)}
					>
						{t.type === "error" ? (
							<AlertTriangle className="w-4 h-4 shrink-0" />
						) : (
							<CheckCircle2 className="w-4 h-4 shrink-0" />
						)}
						<span>{t.message}</span>
						<button
							type="button"
							onClick={() => dismiss(t.id)}
							className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
						>
							<X className="w-3 h-3" />
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used inside ToastProvider");
	return ctx;
}
