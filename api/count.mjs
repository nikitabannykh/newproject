// Vercel Function: /api/count — число организаций по рубрике в городе
import { handle } from '../lib/twogis.mjs';
export function GET(request) { return handle(request, process.env.TWOGIS_KEY); }
