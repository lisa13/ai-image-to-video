import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoBack: () => void;
    errorMessage?: string;
}

export const ErrorModal = ({
    isOpen,
    onClose,
    onGoBack,
    errorMessage,
}: ErrorModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md glass border-border">
                <DialogHeader className="text-center sm:text-center">
                    {/* Friendly icon */}
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-400" />
                    </div>

                    <DialogTitle className="text-xl font-semibold text-foreground">
                        Couldn't create your video
                    </DialogTitle>

                    <DialogDescription className="text-muted-foreground space-y-3 pt-2">
                        <p>
                            Something went wrong while generating your video. This can happen
                            due to a temporary hiccup or if we're experiencing high demand.
                        </p>

                        {errorMessage && (
                            <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground text-left">
                                <span className="font-medium text-foreground/80">Details:</span>{' '}
                                {errorMessage}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={onGoBack}
                        className="w-full sm:w-auto"
                    >
                        Go back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
