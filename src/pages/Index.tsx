import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { ImageUpload } from "@/components/ImageUpload";
import { PromptSelect } from "@/components/PromptSelect";
import { GenerateButton } from "@/components/GenerateButton";
import { ProcessingView } from "@/components/ProcessingView";
import { ResultView } from "@/components/ResultView";
import { ErrorModal } from '@/components/ErrorModal';

type AppState = "upload" | "processing" | "result";

const startGeneration = async (image: File, prompt: string) => {
  const fd = new FormData();
  fd.append("image", image);
  fd.append("prompt", prompt);

  const r = await fetch("/api/generate", { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as { id: string; status: string };
};

const pollStatus = async (id: string) => {
  const r = await fetch(`/api/status?id=${encodeURIComponent(id)}`);
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as {
    status: string;
    videoUrl: string | null;
    error: string | null;
  };
};

const Index = () => {
  const [appState, setAppState] = useState<AppState>("upload");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  console.log("selectedImage", selectedImage, selectedImage instanceof File);

  const [isGenerating, setIsGenerating] = useState(false);

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Final prompt: custom overrides preset if not empty
  const finalPrompt = customPrompt.trim() || selectedPrompt;

  const handleGenerate = useCallback(async () => {
    if (!selectedImage || !finalPrompt || isGenerating) return;

    // Client-side validation (prevents wasted calls)
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(selectedImage.type)) {
      setStatus("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (selectedImage.size > 10 * 1024 * 1024) {
      setStatus("Image is too large (max 10MB).");
      return;
    }
    if (finalPrompt.trim().length < 3) {
      setStatus("Prompt is too short.");
      return;
    }

    setIsGenerating(true);
    setAppState("processing");
    setStatus("Uploading image…");

    const startedAt = Date.now();
    const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

    try {
      const { id } = await startGeneration(selectedImage, finalPrompt);

      setStatus("Generating video…");

      while (true) {
        if (Date.now() - startedAt > TIMEOUT_MS) {
          throw new Error("Timed out. Please try again.");
        }

        await new Promise((r) => setTimeout(r, 2000));
        const s = await pollStatus(id);

        const done = s.status === "completed" || s.status === "succeeded";
        const failed =
          s.status === "failed" || s.status === "canceled" || s.status === "error";

        if (done && s.videoUrl) {
          setVideoUrl(s.videoUrl);
          setAppState("result");
          break;
        }

        if (failed) {
          throw new Error(s.error || "Generation failed");
        }

        setStatus(`Status: ${s.status}…`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const message = error instanceof Error ? error.message : undefined;
      setErrorMessage(message);
      setShowErrorModal(true);
      setAppState('upload');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImage, finalPrompt, isGenerating]);

  const handleReset = useCallback(() => {
    setAppState("upload");
    setSelectedImage(null);
    setSelectedPrompt("");
    setCustomPrompt("");
    setVideoUrl("");
    setStatus("");
    setIsGenerating(false);
    setShowErrorModal(false);
    setErrorMessage(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-12">
        {appState === "upload" && (
          <div className="space-y-8">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Turn your images into
                <span className="gradient-text"> stunning videos</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Upload an image, choose a motion style, and let AI do the magic
              </p>
            </div>

            {/* Upload section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                1. Upload your image
              </label>
              <ImageUpload onImageSelect={setSelectedImage} selectedImage={selectedImage} />
            </div>

            {/* Prompt selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                2. Choose motion style
              </label>
              <PromptSelect value={selectedPrompt} onValueChange={setSelectedPrompt} />
            </div>

            {/* Custom prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                3. Custom prompt{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe your desired motion in detail…"
                className="w-full h-24 px-4 py-3 rounded-lg glass border border-border hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                {customPrompt.trim()
                  ? "✓ Using your custom prompt"
                  : "Leave empty to use the selected preset above"}
              </p>
            </div>

            {/* Generate button */}
            <div className="pt-4">
              <GenerateButton
                disabled={!selectedImage || !finalPrompt || isGenerating}
                onClick={handleGenerate}
              />
            </div>
          </div>
        )}

        {appState === "processing" && <ProcessingView status={status} />}

        {appState === "result" && (
          <ResultView videoUrl={videoUrl} onGenerateAnother={handleReset} />
        )}
      </main>

      {/* Error modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onGoBack={handleReset}
        errorMessage={errorMessage}
      />

      {/* Footer */}
      <footer className="py-6 border-t border-border/50 mt-auto" />
    </div>
  );
};

export default Index;
