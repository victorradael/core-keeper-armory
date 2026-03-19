import axios from 'axios';

/**
 * Cliente Axios configurado para comunicar com o container do backend.
 * O container expõe a porta 3000.
 */
export const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
});
