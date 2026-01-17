import { useState, useCallback } from 'react';
import { Download, RotateCcw, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

interface ResultViewProps {
  videoUrl: string;
  onGenerateAnother: () => void;
}

export const ResultView = ({ videoUrl, onGenerateAnother }: ResultViewProps) => {
  const [videoError, setVideoError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleVideoError = useCallback(() => {
    console.error('Video preview failed:', videoUrl);
    setVideoError(true);
  }, [videoUrl]);

  const handleDownload = useCallback(async () => {
    if (!videoUrl) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Fetch the video as a blob to handle cross-origin URLs
      const response = await fetch(videoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'video/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError(error instanceof Error ? error.message : 'Download failed');

      // Fallback: open video in new tab
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
  }, [videoUrl]);

  const handleOpenInNewTab = useCallback(() => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  }, [videoUrl]);

  return (
    <div className="flex flex-col gap-6">
      {/* Video player */}
      <div className="glass rounded-xl overflow-hidden glow">
        <div className="relative aspect-video bg-secondary">
          {!videoError ? (
            <video
              src={videoUrl}
              controls
              playsInline
              preload="metadata"
              onError={handleVideoError}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <div className="p-4 rounded-full bg-destructive/20">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Video Preview Unavailable
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The video cannot be displayed here. This may be due to CORS restrictions or an expired link.
                </p>
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass border border-border hover:border-primary/50 hover:glow-sm transition-all text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
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

      {/* Download error message */}
      {downloadError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Download failed</span>
          </div>
          <p className="text-muted-foreground">{downloadError}</p>
          <p className="text-xs text-muted-foreground mt-1">
            The video has been opened in a new tab instead.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          disabled={isDownloading || !videoUrl}
          className="flex-1 py-4 px-6 rounded-xl font-semibold bg-primary text-primary-foreground glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Video
            </>
          )}
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
