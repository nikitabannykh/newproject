// Netlify Function: /api/search и /api/health
import { handle } from '../../lib/twogis.mjs';

export default async (req) => handle(req, process.env.TWOGIS_KEY);

export const config = { path: ['/api/search', '/api/health', '/api/count'] };
