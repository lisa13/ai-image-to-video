import { Video } from 'lucide-react';

export const Header = () => {
  return (
    <header className="py-6 border-b border-border/50">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Motion<span className="text-primary">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Image to Video Generator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};