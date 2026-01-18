import type { VercelRequest, VercelResponse } from "@vercel/node";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Extracts video URL from Replicate prediction output.
 * Replicate output formats can vary:
 * - String URL: "https://..."
 * - Array of URLs: ["https://...", ...]
 * - Object with video/video_url/output property: { video: "https://..." }
 * - Object with nested structure: { output: { video: "https://..." } }
 */
function pickVideoUrl(output: any): string | null {
    if (!output) return null;

    // If output is a string URL, use it directly
    if (typeof output === "string") {
        return output.endsWith(".mp4") || output.includes("video") ? output : null;
    }

    // If output is an array, find the first MP4/video URL
    if (Array.isArray(output)) {
        const videoUrl = output.find((item) => {
            if (typeof item === "string") {
                return item.endsWith(".mp4") || item.includes("video") || item.includes(".mp4");
            }
            return false;
        });
        if (videoUrl) return videoUrl;
        // If array contains objects, try first item
        if (output.length > 0 && typeof output[0] === "object") {
            return pickVideoUrl(output[0]);
        }
        return null;
    }

    // If output is an object, check common property names
    if (typeof output === "object") {
        // Try common property names in order of likelihood
        const candidates = [
            output.video,
            output.video_url,
            output.videoUrl,
            output.url,
            output.output,
            output.file,
            output.mp4,
        ].filter(Boolean);

        for (const candidate of candidates) {
            const result = pickVideoUrl(candidate);
            if (result) return result;
        }

        // Check if any property is a string URL
        for (const key in output) {
            const value = output[key];
            if (typeof value === "string" && (value.endsWith(".mp4") || value.includes("video") || value.includes(".mp4"))) {
                return value;
            }
        }
    }

    return null;
}

/**
 * Maps Replicate status to frontend-expected status values.
 * Frontend expects: "processing", "completed"/"succeeded", "failed"/"canceled"/"error"
 */
function mapStatus(replicateStatus: string): string {
    const status = replicateStatus.toLowerCase();

    if (status === "starting" || status === "processing") {
        return "processing";
    }

    if (status === "succeeded") {
        return "succeeded"; // Frontend checks for both "completed" and "succeeded"
    }

    if (status === "failed" || status === "canceled" || status === "error") {
        return status; // Frontend checks for all of these
    }

    // Default: return as-is
    return replicateStatus;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== "GET") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({ error: "Missing REPLICATE_API_TOKEN" });
        }

        const id = String(req.query.id || "").trim();
        if (!id) {
            return res.status(400).json({ error: "id is required" });
        }

        // Get prediction from Replicate
        const prediction = await replicate.predictions.get(id);

        // Map Replicate status to frontend-expected status
        const mappedStatus = mapStatus(prediction.status);

        // Extract video URL from output
        const videoUrl = pickVideoUrl(prediction.output);

        // Extract error message if prediction failed
        let errorMessage: string | null = null;
        if (prediction.status === "failed" || prediction.status === "canceled") {
            errorMessage = (prediction.error ? String(prediction.error) : "Prediction failed") || "Prediction failed";
        }

        return res.status(200).json({
            id: prediction.id,
            status: mappedStatus,
            videoUrl,
            error: errorMessage,
        });
    } catch (e: any) {
        console.error("Status check error:", e);

        // Handle Replicate-specific errors
        if (e.message && typeof e.message === "string") {
            return res.status(500).json({ error: e.message });
        }

        return res.status(500).json({ error: "Server error" });
    }
}
