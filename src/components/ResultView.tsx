import { Download, RotateCcw, Play } from 'lucide-react';

interface ResultViewProps {
  videoUrl: string;
  onGenerateAnother: () => void;
}

export const ResultView = ({ videoUrl, onGenerateAnother }: ResultViewProps) => {
  const handleDownload = () => {
    // Placeholder: In real implementation, this would download the video
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'generated-video.mp4';
    link.click();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Video player */}
      <div className="glass rounded-xl overflow-hidden glow">
        <div className="relative aspect-video bg-secondary">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-cover"
          />
          {/* Fallback for demo - shows play icon if no video */}
          {!videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-6 rounded-full bg-primary/20 backdrop-blur-sm">
                <Play className="w-12 h-12 text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success message */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold gradient-text mb-2">
          Video Generated!
        </h2>
        <p className="text-muted-foreground">
          Your video is ready to download
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 py-4 px-6 rounded-xl font-semibold bg-primary text-primary-foreground glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Download className="w-5 h-5" />
          Download Video
        </button>
        <button
          onClick={onGenerateAnother}
          className="flex-1 py-4 px-6 rounded-xl font-semibold glass border-border hover:border-primary/50 hover:glow-sm transition-all flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-5 h-5" />
          Generate Another
        </button>
      </div>
    </div>
  );
};