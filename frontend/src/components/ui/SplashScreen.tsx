import { Pickaxe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HOLD_MS = 2200;
const EXIT_MS = 350;

const MESSAGES = [
	"DIGGING IN THE CAVES...",
	"FORGING THE ARMOR...",
	"SHARPENING THE AXE...",
	"LOADING THE ARMORY...",
];

const SPARKS = [
	{ tx: "18px", ty: "-22px", delay: "0s" },
	{ tx: "-20px", ty: "-18px", delay: "0.08s" },
	{ tx: "24px", ty: "-8px", delay: "0.05s" },
	{ tx: "-14px", ty: "-28px", delay: "0.12s" },
	{ tx: "8px", ty: "-32px", delay: "0.03s" },
];

interface SplashScreenProps {
	onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
	const [exiting, setExiting] = useState(false);
	const [msgIndex, setMsgIndex] = useState(0);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		const msgInterval = setInterval(() => {
			setMsgIndex((i) => (i + 1) % MESSAGES.length);
		}, HOLD_MS / MESSAGES.length);

		const exitTimer = setTimeout(() => setExiting(true), HOLD_MS);

		const doneTimer = setTimeout(() => onDoneRef.current(), HOLD_MS + EXIT_MS);

		return () => {
			clearInterval(msgInterval);
			clearTimeout(exitTimer);
			clearTimeout(doneTimer);
		};
	}, []);

	return (
		<div
			className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background select-none ${exiting ? "splash-exit" : "splash-enter"}`}
		>
			{/* dot-grid background */}
			<div
				className="absolute inset-0 opacity-[0.04]"
				style={{
					backgroundImage:
						"radial-gradient(circle, #ffffff 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			/>

			{/* vignette */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#000_100%)]" />

			<div className="relative flex flex-col items-center gap-10">
				{/* pickaxe + sparks */}
				<div className="relative flex items-center justify-center w-28 h-28">
					<div
						className="text-secondary"
						style={{
							animation: "pickaxe-swing 0.72s ease-in-out infinite",
							transformOrigin: "70% 70%",
						}}
					>
						<Pickaxe className="w-20 h-20" strokeWidth={1.5} />
					</div>

					{SPARKS.map((s) => (
						<div
							key={`${s.tx}-${s.ty}`}
							className="absolute bottom-6 right-6 w-2 h-2 rounded-none bg-secondary"
							style={
								{
									"--tx": s.tx,
									"--ty": s.ty,
									animation: `spark 0.72s ease-out ${s.delay} infinite`,
								} as React.CSSProperties
							}
						/>
					))}
				</div>

				{/* title */}
				<div className="text-center space-y-1">
					<h1 className="text-6xl font-pixel text-white tracking-[0.25em] leading-none">
						CORE KEEPER
					</h1>
					<h2 className="text-3xl font-pixel text-primary tracking-[0.6em]">
						• ARMORY •
					</h2>
				</div>

				{/* progress bar */}
				<div className="w-72 space-y-3">
					<div className="w-full h-2 bg-white/5 border border-white/10">
						<div
							className="h-full bg-primary"
							style={{
								animation: `progress-bar ${HOLD_MS}ms linear forwards`,
							}}
						/>
					</div>

					{/* message */}
					<p
						key={msgIndex}
						className="text-center text-[11px] font-pixel text-white/40 tracking-[0.25em] uppercase"
						style={{ animation: "text-cycle 0.55s ease-in-out" }}
					>
						{MESSAGES[msgIndex]}
					</p>
				</div>
			</div>

			{/* version */}
			<span className="absolute bottom-6 font-pixel text-[10px] text-white/20 tracking-widest">
				v{__APP_VERSION__}
			</span>
		</div>
	);
}
