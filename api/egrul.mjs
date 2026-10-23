// Vercel Function: /api/egrul
import { handleEgrul } from '../lib/egrul.mjs';
export function GET(request) { return handleEgrul(request); }
