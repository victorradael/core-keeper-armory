import * as fs from "node:fs/promises";
import path from "node:path";
import { type AppConfig, DEFAULT_CONFIG } from "../types/config";

const DATA_DIR =
	process.env.DATA_DIR ?? path.join(__dirname, "..", "..", "data");
const CONFIG_FILE = path.join(DATA_DIR, "app_config.json");

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
	if (config) return config;

	try {
		await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
		const data = await fs.readFile(CONFIG_FILE, "utf-8");
		config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
	} catch {
		config = { ...DEFAULT_CONFIG };
		await saveConfig(config);
	}

	return config as AppConfig;
}

export async function saveConfig(
	newConfig: Partial<AppConfig>,
): Promise<AppConfig> {
	const current = await loadConfig();
	config = { ...current, ...newConfig };
	await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
	return config;
}
