import type { LucideIcon } from "lucide-react";
import {
	Backpack,
	ChevronDown,
	ChevronUp,
	Circle,
	Copy,
	Footprints,
	Gem,
	HardHat,
	Pickaxe,
	ShieldAlert,
	ShieldCheck,
	Shirt,
	Trash2,
	Trophy,
} from "lucide-react";
import { useState } from "react";
import { useCloneSet, useDeleteSet, useUpdateItem } from "../../hooks/useSets";
import type { EquipmentSet } from "../../types";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Checkbox } from "../ui/Checkbox";

const ICON_MAP: Record<string, LucideIcon> = {
	capacete: HardHat,
	peitoral: Shirt,
	calças: Footprints,
	anel_1: Circle,
	anel_2: Circle,
	colar: Gem,
	mochila: Backpack,
	mao_secundaria: ShieldAlert,
};

interface BuildCardProps {
	set: EquipmentSet;
	catalog: Record<string, string>;
}

export function BuildCard({ set, catalog }: BuildCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const updateItem = useUpdateItem();
	const cloneSet = useCloneSet();
	const deleteSet = useDeleteSet();

	const progress = (set._acquired_items / set._total_items) * 100 || 0;
	const isCarol = set.type === "C";

	return (
		<Card
			className={cn(
				"pixel-card relative group overflow-visible",
				isCarol ? "border-carol/30" : "border-radael/30",
			)}
		>
			{/* Badge de Nome do Dono (Carol ou Radael) */}
			<div
				className={cn(
					"absolute -top-3 left-4 px-3 py-1 text-[10px] font-black uppercase tracking-tighter font-pixel",
					isCarol ? "bg-carol text-white" : "bg-radael text-white",
				)}
			>
				{isCarol ? "Carol" : "Radael"}
			</div>

			<div className="flex flex-col gap-4 mt-2">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div
							className={cn(
								"p-2 border-2",
								set._is_complete
									? "border-secondary text-secondary"
									: "border-white/10 text-[#938F99]",
							)}
						>
							{set._is_complete ? (
								<Trophy className="w-6 h-6" />
							) : (
								<Pickaxe className="w-6 h-6" />
							)}
						</div>
						<div>
							<h3 className="text-xl font-bold font-pixel text-white leading-tight">
								{set.name}
							</h3>
							<p className="text-[10px] text-[#938F99] font-bold uppercase font-pixel">
								{set._acquired_items}/{set._total_items} ITEMS
							</p>
						</div>
					</div>

					<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<Button
							variant="text"
							size="sm"
							onClick={() => cloneSet.mutate(set.id)}
						>
							<Copy className="w-4 h-4 text-[#938F99]" />
						</Button>
						<Button
							variant="text"
							size="sm"
							onClick={() =>
								confirm(`Apagar ${set.name}?`) && deleteSet.mutate(set.id)
							}
						>
							<Trash2 className="w-4 h-4 text-red-500" />
						</Button>
					</div>
				</div>

				{/* Progress Bar Pixelated */}
				<div className="h-3 w-full bg-black/40 border-2 border-white/5 p-0.5">
					<div
						className={cn(
							"h-full transition-all duration-500 ease-out",
							set._is_complete ? "bg-secondary" : "bg-primary",
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>

				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="text-[10px] font-black text-primary hover:text-secondary transition-colors font-pixel flex items-center justify-center gap-1"
				>
					{isExpanded ? (
						<ChevronUp className="w-4 h-4" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
					{isExpanded ? "CLOSE GEAR" : "SHOW GEAR"}
				</button>

				<div
					className={cn(
						"overflow-hidden transition-all duration-300 ease-in-out",
						isExpanded ? "max-h-[600px] opacity-100 pt-2" : "max-h-0 opacity-0",
					)}
				>
					<div className="space-y-2">
						{Object.entries(set.equipment)
							.filter(([_, data]) => data.has_in_set)
							.map(([key, data]) => {
								const Icon = ICON_MAP[key] || ShieldCheck;
								return (
									<div
										key={key}
										className="flex items-center gap-3 p-2 bg-black/20 border border-white/5"
									>
										<Checkbox
											checked={data.acquired}
											onChange={(e) =>
												updateItem.mutate({
													setId: set.id,
													key,
													acquired: e.target.checked,
												})
											}
										/>
										<div className="flex flex-col flex-1 min-w-0">
											<span
												className={cn(
													"text-xs font-bold truncate",
													data.acquired
														? "text-white/40 line-through"
														: "text-white",
												)}
											>
												{data.custom_name || catalog[key]}
											</span>
											{data.custom_name && (
												<div className="flex items-center gap-1 text-[9px] text-[#938F99] font-black uppercase font-pixel">
													<Icon className="w-3 h-3" />
													{catalog[key]}
												</div>
											)}
										</div>
									</div>
								);
							})}
					</div>
				</div>
			</div>
		</Card>
	);
}
