import * as fs from 'node:fs/promises';
import path from 'node:path';
import { type AppConfig, DEFAULT_CONFIG } from '../types/config';

const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, '..', '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'app_config.json');

export class ConfigManager {
  private static config: AppConfig | null = null;

  static async loadConfig(): Promise<AppConfig> {
    if (this.config) return this.config;

    try {
      await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      this.config = { ...DEFAULT_CONFIG };
      await this.saveConfig(this.config);
    }

    return this.config!;
  }

  static async saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
    const current = await this.loadConfig();
    this.config = { ...current, ...config };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    return this.config;
  }
}
