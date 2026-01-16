import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import dropPayLogo from '@/assets/droppay-logo.png';

interface TransactionReceiptProps {
  transactionId: string;
  amount: number;
  currency: string;
  paymentLinkTitle: string;
  merchantName: string;
  payerUsername: string;
  payerEmail?: string;
  txid?: string;
  completedAt: string;
  isBlockchainVerified?: boolean;
  blockExplorerUrl?: string;
  onDownload?: () => void;
  onSendEmail?: () => void;
}

export function TransactionReceipt({
  transactionId,
  amount,
  currency,
  paymentLinkTitle,
  merchantName,
  payerUsername,
  payerEmail,
  txid,
  completedAt,
  isBlockchainVerified = false,
  blockExplorerUrl,
  onDownload,
  onSendEmail,
}: TransactionReceiptProps) {
  const receiptContent = `
TRANSACTION RECEIPT
═══════════════════════════════════════════════════════

Receipt #: ${transactionId}
Date: ${new Date(completedAt).toLocaleString()}

PAYMENT DETAILS
───────────────────────────────────────────────────────
Product/Service: ${paymentLinkTitle}
Merchant: ${merchantName}
Amount: ${currency === 'Pi' ? 'π' : currency} ${Number(amount).toFixed(2)}

PAYER INFORMATION
───────────────────────────────────────────────────────
Username: @${payerUsername}
Email: ${payerEmail || 'Not provided'}

BLOCKCHAIN VERIFICATION
───────────────────────────────────────────────────────
Transaction ID: ${txid || 'Pending verification'}
Verification Status: ${isBlockchainVerified ? '✓ VERIFIED' : '⏳ Verifying...'}

═══════════════════════════════════════════════════════

This receipt is proof of payment from DropPay.
Both merchant and customer can use this receipt as proof of transaction.

For support: https://droppay.space
Powered by DropPay - Pi Payment Platform
`;

  const downloadReceipt = () => {
    const element = document.createElement('a');
    const file = new Blob([receiptContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `DropPay_Receipt_${transactionId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Receipt downloaded!');
    onDownload?.();
  };

  const copyReceipt = () => {
    navigator.clipboard.writeText(receiptContent);
    toast.success('Receipt copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {/* Receipt Card */}
      <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader className="pb-3 border-b border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Payment Successful
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Receipt #{transactionId}
              </p>
            </div>
            <img
              src={dropPayLogo}
              alt="DropPay"
              className="w-12 h-12 rounded-lg"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Payment Details Section */}
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground font-medium">Product/Service</p>
                <p className="font-semibold text-foreground">{paymentLinkTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Merchant</p>
                <p className="font-semibold text-foreground">{merchantName}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="text-3xl font-bold text-green-600">
                  {currency === 'Pi' ? 'π' : currency} {Number(amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground font-medium">Payer</p>
                <p className="font-semibold text-foreground">@{payerUsername}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Date & Time</p>
                <p className="font-semibold text-foreground">
                  {new Date(completedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {payerEmail && (
              <div>
                <p className="text-muted-foreground font-medium">Receipt Email</p>
                <p className="font-semibold text-foreground text-sm break-all">
                  {payerEmail}
                </p>
              </div>
            )}
          </div>

          {/* Blockchain Verification Section */}
          {txid && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Blockchain Verified
              </h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Transaction ID:</span>{' '}
                  <code className="bg-white dark:bg-slate-900/50 px-2 py-1 rounded text-xs font-mono break-all">
                    {txid}
                  </code>
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={isBlockchainVerified ? 'text-green-600 font-semibold' : 'text-amber-600'}>
                    {isBlockchainVerified ? '✓ VERIFIED' : '⏳ Verifying...'}
                  </span>
                </p>
                {blockExplorerUrl && isBlockchainVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full mt-2"
                  >
                    <a
                      href={blockExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Block Explorer
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold">💡 Proof of Payment:</span> Both merchant and payer can use this receipt as proof of transaction. Keep this receipt for your records.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={downloadReceipt}
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <Download className="w-4 h-4" />
          Download Receipt
        </Button>
        <Button
          onClick={copyReceipt}
          className="flex items-center justify-center gap-2"
          variant="outline"
        >
          <Copy className="w-4 h-4" />
          Copy to Clipboard
        </Button>
      </div>

      {onSendEmail && (
        <Button
          onClick={onSendEmail}
          className="w-full flex items-center justify-center gap-2"
          variant="default"
        >
          <Mail className="w-4 h-4" />
          Send Receipt to Email
        </Button>
      )}
    </div>
  );
}
