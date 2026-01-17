import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ImageUpload } from '@/components/ImageUpload';
import { PromptSelect } from '@/components/PromptSelect';
import { GenerateButton } from '@/components/GenerateButton';
import { ProcessingView } from '@/components/ProcessingView';
import { ResultView } from '@/components/ResultView';

type AppState = 'upload' | 'processing' | 'result';

// Placeholder API call - simulates video generation
const generateVideo = async (): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 4000));
  // Return a sample video URL (placeholder)
  return 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';
};

const Index = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Final prompt: custom overrides preset if not empty
  const finalPrompt = customPrompt.trim() || selectedPrompt;

  const handleGenerate = useCallback(async () => {
    if (!selectedImage || !finalPrompt) return;

    setAppState('processing');
    setStatus('Uploading image…');

    try {
      // Simulate upload progress
      await new Promise(r => setTimeout(r, 1000));
      setStatus('Analyzing image…');
      
      await new Promise(r => setTimeout(r, 1500));
      setStatus('Generating video…');

      const url = await generateVideo();
      setVideoUrl(url);
      setAppState('result');
    } catch (error) {
      console.error('Generation failed:', error);
      setAppState('upload');
    }
  }, [selectedImage, finalPrompt]);

  const handleReset = useCallback(() => {
    setAppState('upload');
    setSelectedImage(null);
    setSelectedPrompt('');
    setCustomPrompt('');
    setVideoUrl('');
    setStatus('');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-12">
        {appState === 'upload' && (
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
              <ImageUpload 
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
              />
            </div>

            {/* Prompt selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                2. Choose motion style
              </label>
              <PromptSelect 
                value={selectedPrompt}
                onValueChange={setSelectedPrompt}
              />
            </div>

            {/* Custom prompt */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                3. Custom prompt <span className="text-muted-foreground font-normal">(optional)</span>
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
                disabled={!selectedImage || !finalPrompt}
                onClick={handleGenerate}
              />
            </div>
          </div>
        )}

        {appState === 'processing' && (
          <ProcessingView status={status} />
        )}

        {appState === 'result' && (
          <ResultView 
            videoUrl={videoUrl}
            onGenerateAnother={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/50 mt-auto">
        <p className="text-center text-sm text-muted-foreground">
          Powered by AI • No account required
        </p>
      </footer>
    </div>
  );
};

export default Index;