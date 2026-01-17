import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROMPTS = [
  { value: "zoom-in", label: "Slow zoom in" },
  { value: "zoom-out", label: "Slow zoom out" },
  { value: "pan-left", label: "Pan left" },
  { value: "pan-right", label: "Pan right" },
  { value: "orbit", label: "Orbital camera motion" },
  { value: "animate-subject", label: "Animate the subject" },
  { value: "add-motion", label: "Add subtle motion" },
  { value: "cinematic", label: "Cinematic movement" },
];

interface PromptSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const PromptSelect = ({ value, onValueChange }: PromptSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full glass border-border hover:border-primary/50 transition-colors h-12">
        <SelectValue placeholder="Select a motion style" />
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {PROMPTS.map((prompt) => (
          <SelectItem 
            key={prompt.value} 
            value={prompt.value}
            className="focus:bg-primary/10 focus:text-foreground"
          >
            {prompt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};