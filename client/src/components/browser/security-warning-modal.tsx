import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SecurityWarningModalProps {
  isOpen: boolean;
  url: string;
  reason: string;
  onContinue: () => void;
  onCancel: () => void;
}

export default function SecurityWarningModal({
  isOpen,
  url,
  reason,
  onContinue,
  onCancel,
}: SecurityWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <DialogTitle>Security Warning</DialogTitle>
          </div>
          <DialogDescription className="mt-4">
            This site may contain malicious content. SecureBrowser has detected potential security risks.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Reason: {reason}
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1 break-all">
              URL: {url}
            </p>
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="destructive"
            onClick={onCancel}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={onContinue}
            className="flex-1"
          >
            Continue Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
