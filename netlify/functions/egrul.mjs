// Netlify Function: /api/egrul
import { handleEgrul } from '../../lib/egrul.mjs';
export default async (req) => handleEgrul(req);
export const config = { path: '/api/egrul' };
