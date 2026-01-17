import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
        if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

        const id = String(req.query.id || "").trim();
        if (!id) return res.status(400).json({ error: "id is required" });

        // GET /v1/videos/{id} per docs. :contentReference[oaicite:7]{index=7}
        const job = await client.videos.retrieve(id);

        // Depending on response shape, video may be a URL or an asset reference.
        // We'll normalize to `videoUrl` if present.
        const videoUrl =
            (job as any).video_url ||
            (job as any).output?.[0] ||
            null;

        return res.status(200).json({
            id: (job as any).id,
            status: (job as any).status,
            videoUrl,
            error: (job as any).error ?? null,
        });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: e?.message ?? "Server error" });
    }
}
