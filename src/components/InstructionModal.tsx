import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, ExternalLink, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';

interface InstructionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  steps?: string[];
  linkUrl?: string;
  showCopyButton?: boolean;
  showDownloadLink?: boolean;
  downloadLink?: string;
  downloadLinkText?: string;
  securityNote?: string;
  imageUrl?: string;
}

export function InstructionModal({
  isOpen,
  onOpenChange,
  title = 'Payment Instructions',
  description = 'This payment link works best in the Pi Browser.',
  steps = [
    'Copy this payment link using the copy button above',
    'Open the Pi Browser app on your device',
    'Paste the link in Pi Browser\'seach address bar',
    'Complete your secure Pi payment'
  ],
  linkUrl,
  showCopyButton = true,
  showDownloadLink = true,
  downloadLink = 'https://minepi.com/download',
  downloadLinkText = 'Download Pi Browser here',
  securityNote = 'Pi Browser ensures secure authentication and blockchain-verified transactions.',
  imageUrl
}: InstructionModalProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-500/10">
              <Info className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-4 pt-2">
            <p className="text-base font-medium text-foreground">
              {description.includes('<strong>') ? (
                <span dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <>
                  This payment link works best in the{' '}
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">
                    Pi Browser
                  </span>
                  .
                </>
              )}
            </p>

            {imageUrl && (
              <div className="flex justify-center py-3">
                <img 
                  src={imageUrl} 
                  alt="Payment Instructions" 
                  className="w-full max-w-sm rounded-lg border-2 border-orange-200 shadow-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">To complete your payment:</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-semibold text-foreground min-w-[20px]">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {securityNote && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{securityNote}</span>
                </p>
              </div>
            )}

            {showDownloadLink && (
              <div className="pt-2">
                <a
                  href={downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  {downloadLinkText}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          {showCopyButton && linkUrl && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                copyToClipboard(linkUrl);
                toast.success('Link copied! Open it in Pi Browser');
              }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          )}
          <Button
            variant="default"
            className={showCopyButton && linkUrl ? 'flex-1' : 'w-full'}
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InstructionModal;
