import { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
}

export const ImageUpload = ({ onImageSelect, selectedImage }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearImage = useCallback(() => {
    onImageSelect(null);
    setPreview(null);
  }, [onImageSelect]);

  if (selectedImage && preview) {
    return (
      <div className="relative group">
        <div className="glass rounded-xl overflow-hidden">
          <img 
            src={preview} 
            alt="Selected" 
            className="w-full h-64 object-cover"
          />
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive/20 hover:border-destructive/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground text-center">
          {selectedImage.name}
        </p>
      </div>
    );
  }

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        block cursor-pointer glass rounded-xl p-8 transition-all duration-300
        ${isDragging 
          ? 'border-primary glow-sm scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:glow-sm'
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`
          p-4 rounded-full bg-secondary transition-all duration-300
          ${isDragging ? 'bg-primary/20 scale-110' : ''}
        `}>
          {isDragging ? (
            <ImageIcon className="w-8 h-8 text-primary" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">
            {isDragging ? 'Drop your image here' : 'Upload an image'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag & drop or click to browse
          </p>
        </div>
      </div>
    </label>
  );
};