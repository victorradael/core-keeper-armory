import * as fs from "node:fs/promises";
import path from "node:path";
import cors from "@fastify/cors";
import fastify from "fastify";
import { EQUIPMENT_CATALOG } from "./core/catalog";
import { loadConfig, saveConfig } from "./core/config-manager";
import {
	bulkUpdateSets,
	cloneSet,
	createSet,
	prepareSetForDisplay,
	updateEquipmentAcquisition,
} from "./core/equipment-manager";
import type { EquipmentSet, NewEquipmentSet } from "./types";

// Logger ativado para debug visual no terminal
const server = fastify({ logger: true });

server.register(cors, {
	origin: "*",
	methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
});

const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "equipment_sets.json");

// Função de inicialização de dados (chamada em background ou após o listen)
async function setupData() {
	const dir = path.dirname(DATA_FILE);
	await fs.mkdir(dir, { recursive: true });
	try {
		await fs.access(DATA_FILE);
	} catch {
		await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
	}
}

// --- ROTAS (EXEMPLO) ---
server.get("/ping", async () => ({ pong: true }));

server.get("/sets", async () => {
	const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
	const sets = JSON.parse(data);
	return sets.map(prepareSetForDisplay);
});

server.get("/catalog", async () => EQUIPMENT_CATALOG);

server.post("/sets", async (request) => {
	const newSetData = request.body as NewEquipmentSet;
	const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
	const sets = JSON.parse(data) as EquipmentSet[];

	const setWithId = createSet(
		newSetData,
		sets.map((s) => s.name),
	);
	sets.push(setWithId);

	await fs.writeFile(DATA_FILE, JSON.stringify(sets, null, 2));
	return prepareSetForDisplay(setWithId);
});

server.get("/config", async () => loadConfig());

server.post("/config", async (request) => {
	const config = request.body as Record<string, unknown>;
	return saveConfig(config);
});

server.delete("/sets/:id", async (request, reply) => {
	const { id } = request.params as { id: string };
	const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
	const sets = JSON.parse(data) as EquipmentSet[];

	const index = sets.findIndex((s) => s.id === id);
	if (index === -1) return reply.status(404).send({ error: "Não encontrado" });

	sets.splice(index, 1);
	await fs.writeFile(DATA_FILE, JSON.stringify(sets, null, 2));
	return { ok: true };
});

server.post("/sets/:id/clone", async (request, reply) => {
	const { id } = request.params as { id: string };
	const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
	const sets = JSON.parse(data) as EquipmentSet[];

	const original = sets.find((s) => s.id === id);
	if (!original) return reply.status(404).send({ error: "Não encontrado" });

	const cloned = cloneSet(
		original,
		sets.map((s) => s.name),
	);
	sets.push(cloned);
	await fs.writeFile(DATA_FILE, JSON.stringify(sets, null, 2));
	return prepareSetForDisplay(cloned);
});

server.put("/sets/bulk", async (request) => {
	const updates = request.body as Record<string, unknown>[];
	const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
	const sets = JSON.parse(data) as EquipmentSet[];

	const updated = bulkUpdateSets(sets, updates);
	await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2));
	return updated.map(prepareSetForDisplay);
});

server.patch("/sets/:id/items/:key", async (request, reply) => {
	const { id, key } = request.params as { id: string; key: string };
	const { acquired } = request.body as { acquired: boolean };

	const data = await fs.readFile(DATA_FILE, "utf-8").catch(() => "[]");
	const sets = JSON.parse(data) as EquipmentSet[];

	const setIndex = sets.findIndex((s) => s.id === id);
	const targetSet = sets[setIndex];

	if (!targetSet) return reply.status(404).send({ error: "Não encontrado" });

	try {
		const updatedSet = updateEquipmentAcquisition(targetSet, key, acquired);
		sets[setIndex] = updatedSet;
		await fs.writeFile(DATA_FILE, JSON.stringify(sets, null, 2));
		return prepareSetForDisplay(updatedSet);
	} catch (e) {
		return reply.status(400).send({ error: (e as Error).message });
	}
});

// Inicialização DIRETA e RÁPIDA
server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		console.error("❌ Erro Fatal ao abrir porta:", err);
		process.exit(1);
	}
	console.log(`🚀 SERVIDOR ESCUTANDO EM: ${address}`);

	// Inicializa dados APÓS o servidor estar escutando
	setupData().then(() => {
		console.log("📦 Arquivos de dados validados com sucesso.");
	});
});
