import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable from "formidable";
import fs from "node:fs";
import OpenAI, { toFile } from "openai";

export const config = {
    api: { bodyParser: false },
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseForm(req: VercelRequest) {
    const form = formidable({
        multiples: false,
        keepExtensions: true,
    });

    return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                reject(err);
            } else {
                console.log("Parsed fields:", Object.keys(fields));
                console.log("Parsed files:", Object.keys(files));
                resolve({ fields, files });
            }
        });
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
        if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

        const { fields, files } = await parseForm(req);
        const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt;
        const promptStr = String(prompt || "").trim();
        if (!promptStr) return res.status(400).json({ error: "prompt is required" });

        // Formidable sometimes returns File or File[]
        const fileValue = (files.image as any) ?? null;
        const imageFile: formidable.File | null =
            Array.isArray(fileValue) ? fileValue[0] : fileValue;

        if (!imageFile) {
            console.error("File validation failed: no image file provided");
            return res.status(400).json({ error: "image file is required" });
        }

        const imageStream = fs.createReadStream(imageFile.filepath);

        const mime =
            imageFile.mimetype === "image/png" ||
                imageFile.mimetype === "image/jpeg" ||
                imageFile.mimetype === "image/webp"
                ? imageFile.mimetype
                : "image/png";

        const filename =
            imageFile.originalFilename?.trim() ||
            (mime === "image/jpeg" ? "image.jpg" : mime === "image/webp" ? "image.webp" : "image.png");

        // Wrap stream with filename + mime so OpenAI doesn't treat it as octet-stream
        const inputFile = await toFile(imageStream as any, filename, { type: mime });

        const job = await client.videos.create({
            model: "sora-2",
            prompt: promptStr,
            input_reference: inputFile,
            size: "1280x720",
            seconds: 4,
        } as any);

        return res.status(200).json({ id: (job as any).id, status: (job as any).status });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: e?.message ?? "Server error" });
    }
}
