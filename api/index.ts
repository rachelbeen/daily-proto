import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleRequest } from "../dist/handler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleRequest(req, res);
}
