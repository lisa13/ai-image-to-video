import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable";
import fs from "node:fs";
import Replicate from "replicate";

export const config = {
    api: { bodyParser: false },
};

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Wan video generation parameters
// Duration ≈ num_frames / frames_per_second (e.g., 81 frames / 20 fps ≈ 4 seconds)
const WAN_RESOLUTION = "480p"; // Cost-effective default
const WAN_ASPECT_RATIO = "16:9";
const WAN_FRAMES_PER_SECOND = 20;
const WAN_NUM_FRAMES = 81; // Minimum allowed

// Model version handling: extract hash if format is "model:hash"
function normalizeModelVersion(version: string | undefined): string {
    if (!version) {
        // Default model with version hash
        return "wan-video/wan-2.2-i2v-fast:616fe5913f5c30db10afc0576c0c1179a1d11a713273fa3ad529b0e47370b62a";
    }

    // If format is "model:hash", extract just the hash portion
    // Otherwise, assume it's already in the correct format
    const parts = version.split(":");
    if (parts.length >= 2) {
        // Return the hash portion (last part)
        return parts[parts.length - 1];
    }

    return version;
}

const MODEL_VERSION = normalizeModelVersion(process.env.REPLICATE_MODEL_VERSION);

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function parseForm(req: VercelRequest) {
    const form = formidable({
        multiples: false,
        keepExtensions: true,
        maxFileSize: MAX_FILE_SIZE,
    });

    return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                reject(err);
            } else {
                resolve({ fields, files });
            }
        });
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({ error: "Missing REPLICATE_API_TOKEN" });
        }

        const { fields, files } = await parseForm(req);
        const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt;
        const promptStr = String(prompt || "").trim();

        if (!promptStr) {
            return res.status(400).json({ error: "prompt is required" });
        }

        // Extract image file (formidable can return File or File[])
        const fileValue = (files.image as any) ?? null;
        const imageFile: formidable.File | null = Array.isArray(fileValue) ? fileValue[0] : fileValue;

        if (!imageFile) {
            return res.status(400).json({ error: "image file is required" });
        }

        // Validate image type
        const allowedMimes = ["image/png", "image/jpeg", "image/webp"];
        if (!imageFile.mimetype || !allowedMimes.includes(imageFile.mimetype)) {
            return res.status(400).json({
                error: "Invalid image type. Only PNG, JPEG, and WEBP are supported."
            });
        }

        // Validate file size (formidable maxFileSize should catch this, but double-check)
        if (imageFile.size && imageFile.size > MAX_FILE_SIZE) {
            return res.status(400).json({
                error: `Image is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            });
        }

        // Read image file as buffer (production-safe, no File() constructor)
        const imageBuffer = await fs.promises.readFile(imageFile.filepath);

        // Create Replicate prediction with explicit Wan parameters
        // Replicate SDK accepts Buffers directly (more reliable than File in serverless)
        const prediction = await replicate.predictions.create({
            version: MODEL_VERSION,
            input: {
                image: imageBuffer,
                prompt: promptStr,
                resolution: WAN_RESOLUTION,
                aspect_ratio: WAN_ASPECT_RATIO,
                frames_per_second: WAN_FRAMES_PER_SECOND,
                num_frames: WAN_NUM_FRAMES,
            },
        });

        // Map Replicate status to frontend-expected status
        // Replicate uses: "starting", "processing", "succeeded", "failed", "canceled"
        // Frontend expects: "processing", "completed"/"succeeded", "failed"/"canceled"/"error"
        let mappedStatus = prediction.status;
        if (prediction.status === "starting" || prediction.status === "processing") {
            mappedStatus = "processing";
        } else if (prediction.status === "succeeded") {
            mappedStatus = "succeeded";
        }

        return res.status(200).json({
            id: prediction.id,
            status: mappedStatus
        });
    } catch (e: any) {
        console.error("Generate error:", e);

        // Handle Replicate-specific errors
        if (e.message && typeof e.message === "string") {
            return res.status(500).json({ error: e.message });
        }

        // Handle file size errors from formidable
        if (e.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                error: `Image is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            });
        }

        return res.status(500).json({ error: "Server error" });
    }
}
