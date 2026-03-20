import axios from "axios";

const DEFAULT_URL = "http://localhost:3000";

export function getServerUrl(): string {
	return localStorage.getItem("armory_server_url") ?? DEFAULT_URL;
}

export function setServerUrl(url: string) {
	const normalized = url.replace(/\/$/, "");
	localStorage.setItem("armory_server_url", normalized);
	api.defaults.baseURL = normalized;
}

export const api = axios.create({
	baseURL: getServerUrl(),
	timeout: 5000,
});
