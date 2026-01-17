import { Loader2 } from 'lucide-react';

interface ProcessingViewProps {
  status: string;
}

export const ProcessingView = ({ status }: ProcessingViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Animated loader */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-secondary" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-primary animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow -z-10" />

      {/* Status text */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          {status}
        </h2>
        <p className="text-muted-foreground">
          This usually takes 30-60 seconds
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
};