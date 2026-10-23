// Vercel Function: /api/health
import { handle } from '../lib/twogis.mjs';
export function GET(request) { return handle(request, process.env.TWOGIS_KEY); }
