import type { LucideIcon } from "lucide-react";
import {
	Backpack,
	Box,
	Circle,
	Footprints,
	Gem,
	Hammer,
	HardHat,
	ShieldAlert,
	ShieldCheck,
	Shirt,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateSet } from "../../hooks/useSets";
import { cn } from "../../utils/cn";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";

interface EquipmentField {
	has_in_set: boolean;
	acquired: boolean;
	custom_name: string;
}

interface FormData {
	name: string;
	type: "R" | "C";
	equipment: Record<string, EquipmentField>;
}

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

interface RegistrationFormProps {
	catalog: Record<string, string>;
	onSuccess?: () => void;
}

export function RegistrationForm({
	catalog = {},
	onSuccess,
}: RegistrationFormProps) {
	const createSet = useCreateSet();

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			name: "",
			type: "R",
			equipment: {},
		},
	});

	useEffect(() => {
		if (Object.keys(catalog).length > 0) {
			reset({
				name: "",
				type: "R",
				equipment: Object.fromEntries(
					Object.keys(catalog).map((key) => [
						key,
						{ has_in_set: false, acquired: false, custom_name: "" },
					]),
				),
			});
		}
	}, [catalog, reset]);

	const onSubmit = (data: FormData) => {
		createSet.mutate(data, {
			onSuccess: () => {
				reset();
				if (onSuccess) onSuccess();
			},
		});
	};

	const equipmentWatch = watch("equipment") || {};

	if (Object.keys(catalog).length === 0) {
		return (
			<div className="text-center py-12 font-pixel text-[#938F99]">
				LOADING BLUEPRINT DATA...
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
				<div className="pixel-card p-8 space-y-8 border-primary/20">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-2">
							<label
								htmlFor="set-name"
								className="font-pixel text-xs text-primary uppercase tracking-widest ml-1"
							>
								Set Designation
							</label>
							<input
								id="set-name"
								{...register("name", { required: "REQUIRED" })}
								placeholder="EX: SCARLET ARMOR"
								className={cn(
									"w-full bg-black/40 border-2 px-4 py-3 text-sm font-pixel text-white focus:outline-none transition-all",
									errors.name
										? "border-red-500"
										: "border-white/10 focus:border-primary",
								)}
							/>
							{errors.name && (
								<p className="text-[10px] font-pixel text-red-500 uppercase">
									{errors.name.message as string}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<span className="font-pixel text-xs text-primary uppercase tracking-widest ml-1">
								Owner
							</span>
							<div className="flex gap-2 p-1 bg-black/40 border-2 border-white/10 h-[52px]">
								{[
									{ value: "R", label: "Radael", color: "bg-radael" },
									{ value: "C", label: "Carol", color: "bg-carol" },
								].map((owner) => (
									<label key={owner.value} className="flex-1">
										<input
											type="radio"
											value={owner.value}
											{...register("type")}
											className="sr-only peer"
										/>
										<div
											className={cn(
												"h-full cursor-pointer flex items-center justify-center font-pixel text-xs transition-all uppercase",
												"peer-checked:" +
													owner.color +
													" peer-checked:text-white",
												"text-[#938F99] hover:bg-white/5",
											)}
										>
											{owner.label}
										</div>
									</label>
								))}
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Box className="w-6 h-6 text-white" />
						<h3 className="text-xl font-black text-white font-pixel uppercase tracking-widest">
							COMPONENT SELECTION
						</h3>
						<div className="h-1 flex-1 bg-white/5" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{Object.entries(catalog).map(([key, label]) => {
							const isSelected = equipmentWatch[key]?.has_in_set;
							const Icon = ICON_MAP[key] || ShieldCheck;

							return (
								<div
									key={key}
									className={cn(
										"pixel-card p-4 flex flex-col gap-4 transition-all duration-200 ease-out",
										isSelected
											? "border-primary/40 bg-primary/5"
											: "border-white/5 bg-black/20",
									)}
								>
									<div className="flex items-center gap-3">
										<Checkbox {...register(`equipment.${key}.has_in_set`)} />
										<div className="flex items-center gap-2">
											<Icon
												className={cn(
													"w-4 h-4",
													isSelected ? "text-primary" : "text-[#938F99]",
												)}
											/>
											<span
												className={cn(
													"font-pixel text-sm uppercase tracking-wider",
													isSelected ? "text-white" : "text-[#938F99]",
												)}
											>
												{label}
											</span>
										</div>
									</div>

									<input
										placeholder={`SPECIFIC ${label.toUpperCase()} NAME...`}
										disabled={!isSelected}
										{...register(`equipment.${key}.custom_name`)}
										className={cn(
											"bg-black/40 border-2 px-3 py-2 text-[10px] font-pixel text-white focus:outline-none transition-all",
											isSelected
												? "border-primary/20 focus:border-primary"
												: "border-white/5 opacity-50",
										)}
									/>
								</div>
							);
						})}
					</div>
				</div>

				<Button
					type="submit"
					isLoading={createSet.isPending}
					className="w-full h-16 text-2xl font-pixel tracking-[0.2em] uppercase font-black pixel-border bg-primary text-black hover:bg-secondary transition-colors"
				>
					<Hammer className="w-6 h-6 mr-3" />
					{createSet.isPending ? "FORGING..." : "FORGE BLUEPRINT"}
				</Button>
			</form>
		</div>
	);
}
