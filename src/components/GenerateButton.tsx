import { Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export const GenerateButton = ({ disabled, onClick }: GenerateButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-6 rounded-xl font-semibold text-lg
        flex items-center justify-center gap-3
        transition-all duration-300 transform
        ${disabled 
          ? 'bg-secondary text-muted-foreground cursor-not-allowed' 
          : 'bg-primary text-primary-foreground glow hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      <Sparkles className={`w-5 h-5 ${disabled ? '' : 'animate-pulse'}`} />
      Generate Video
    </button>
  );
};